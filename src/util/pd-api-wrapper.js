/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

// TODO: bubble error state up to UI
import {
  api,
} from '@pagerduty/pdjs';
import axios from 'axios';

import Bottleneck from 'bottleneck';

import {
  PD_USER_TOKEN,
} from 'config/constants';
import {
  compareCreatedAt,
} from 'util/helpers';

/*
  PDJS Wrapper
*/
export const getPdAccessTokenObject = () => {
  // Check if user token is loaded from env, else assume OAuth workflow
  let token;
  let tokenType;

  if (PD_USER_TOKEN) {
    sessionStorage.setItem('pd_access_token', token);
    token = PD_USER_TOKEN;
  } else {
    token = sessionStorage.getItem('pd_access_token');
    tokenType = 'bearer';
  }

  // Return object needed for PD API helpers
  if (tokenType === 'bearer') {
    return {
      token,
      tokenType,
    };
  }
  return {
    token,
  };
};

export const pd = api(getPdAccessTokenObject());

export const pdAxiosRequest = async (method, endpoint, params = {}, data = {}) => axios({
  method,
  url: `https://api.pagerduty.com/${endpoint}`,
  headers: {
    Authorization: (() => {
      const tokenObj = getPdAccessTokenObject();
      if (tokenObj.tokenType === 'bearer') {
        return `Bearer ${tokenObj.token}`;
      }
      return `Token token=${tokenObj.token}`;
    })(),
    Accept: 'application/vnd.pagerduty+json;version=2',
    'content-type': 'application/json; charset=utf-8',
  },
  params,
  data,
});

// Ref: https://www.npmjs.com/package/bottleneck#refresh-interval
const limiterSettings = {
  maxConcurrent: 20,
  minTime: Math.floor((60 / 200) * 1000),
};

const limiter = new Bottleneck(limiterSettings);

/*
  Throttled version of Axios requests for direct API calls
*/
export const throttledPdAxiosRequest = (
  method,
  endpoint,
  params = {},
  data = {},
  options = {
    expiration: 60 * 1000,
    priority: 5,
  },
) => limiter.schedule(
  {
    expiration: options.expiration || 60 * 1000,
    priority: options.priority || 5,
    id: `${method}-${endpoint}-${JSON.stringify(params)}-${Date.now()}`,
  },
  () => pdAxiosRequest(method, endpoint, params, data),
);

export const getLimiterStats = () => limiter.counts();
export const getLimiter = () => limiter;

export const resetLimiterWithRateLimit = async (limit = 200) => {
  // eslint-disable-next-line no-console
  console.log(
    `updating limiter with rate limit ${limit} => minTime ${Math.floor((60 / limit) * 1000)}`,
  );
  limiter.updateSettings({
    ...limiterSettings,
    minTime: Math.floor((60 / limit) * 1000),
  });
};

/*
  Optimized parallel fetch for paginated endpoints
*/

const endpointIdentifier = (endpoint) => {
  if (endpoint.match(/users\/P.*\/sessions/)) {
    return 'user_sessions';
  }
  return endpoint.split('/').pop();
};

export const pdParallelFetch = async (
  endpoint,
  params,
  progressCallback,
  options = {
    priority: 5,
  },
) => {
  let requestParams = {
    limit: 100,
    total: true,
    offset: 0,
  };

  const axiosRequestOptions = {
    expiration: 60 * 1000,
    priority: options.priority,
  };

  if (params) requestParams = { ...requestParams, ...params };

  let reversedSortOrder = false;
  if (endpoint.indexOf('log_entries') > -1) reversedSortOrder = true;

  const firstPage = (
    await throttledPdAxiosRequest('GET', endpoint, requestParams, undefined, axiosRequestOptions)
  ).data;
  if (options.maxRecords && firstPage.total > options.maxRecords) {
    throw new Error(`Too many records: ${firstPage.total} > ${options.maxRecords}`);
  }
  const fetchedData = firstPage[endpointIdentifier(endpoint)];

  const promises = [];
  if (firstPage.more) {
    for (
      let offset = requestParams.limit;
      offset < firstPage.total;
      offset += requestParams.limit
    ) {
      const promise = throttledPdAxiosRequest(
        'GET',
        endpoint,
        { ...requestParams, offset },
        undefined,
        axiosRequestOptions,
      )
        .then(({
          data,
        }) => {
          fetchedData.push(...data[endpointIdentifier(endpoint)]);
          if (progressCallback) {
            progressCallback(firstPage.total, fetchedData.length);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
      promises.push(promise);
    }
  }
  await Promise.all(promises);
  if (!options.skipSort) {
    fetchedData.sort((a, b) => (reversedSortOrder ? compareCreatedAt(b, a) : compareCreatedAt(a, b)));
  }
  return fetchedData;
};
