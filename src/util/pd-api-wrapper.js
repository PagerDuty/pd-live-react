/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

// TODO: bubble error state up to UI
import {
  api,
} from '@pagerduty/pdjs';
import axios from 'axios';

import Bottleneck from 'bottleneck';

import RealUserMonitoring from 'src/config/monitoring';

import {
  PD_USER_TOKEN,
} from 'src/config/constants';
import {
  compareCreatedAt,
} from 'src/util/helpers';

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

export const pdAxiosRequest = async (method, endpoint, params = {}, data = {}, throwErrors = false) => axios({
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
    'Content-Type': 'application/json; charset=utf-8',
  },
  params: { ...params, rand: Math.random().toString(36).substring(2, 7) },
  data,
}).catch((error) => {
  if (throwErrors) {
    throw error;
  }
  return error;
});

let currentLimit = 200;
// Ref: https://www.npmjs.com/package/bottleneck
const limiterSettings = {
  maxConcurrent: 20,
  reservoir: currentLimit,
};

const limiter = new Bottleneck(limiterSettings);
let reservoirRefreshInterval;

export const resetLimiterWithRateLimit = async (limit = 200) => {
  currentLimit = limit;
  // eslint-disable-next-line no-console
  console.log(`updating limiter with rate limit ${limit}`);
  if (reservoirRefreshInterval) {
    clearInterval(reservoirRefreshInterval);
  }
  limiter.updateSettings({
    ...limiterSettings,
    reservoir: limit,
  });
  reservoirRefreshInterval = setInterval(() => {
    limiter.currentReservoir().then((reservoir) => {
      const maxAmountToAdd = limit - reservoir;
      const wantToAdd = Math.floor(limit / 10);
      const amountToAdd = Math.min(maxAmountToAdd, wantToAdd);
      limiter.incrementReservoir(amountToAdd);
    });
  }, 6 * 1000);
};

let watchdogTimeout;

limiter.on('depleted', () => {
  // eslint-disable-next-line no-console
  console.error('Limiter queue depleted, setting watchdog timeout');
  RealUserMonitoring.trackError('LimiterDepleted', {
    reservoir: 0,
    currentLimit,
  });
  if (watchdogTimeout) {
    clearTimeout(watchdogTimeout);
  }
  watchdogTimeout = setTimeout(() => {
    limiter.currentReservoir().then((reservoir) => {
      if (reservoir === 0) {
        // eslint-disable-next-line no-console
        console.error(
          'Watchdog timeout, queue is still depleted after 10 seconds; resetting limiter',
        );
        RealUserMonitoring.trackError('LimiterWatchdogTimeout', {
          reservoir,
          currentLimit,
        });
        resetLimiterWithRateLimit(currentLimit);
      }
    });
  }, 10 * 1000);
});

/*
  Throttled version of Axios requests for direct API calls
*/
export const throttledPdAxiosRequest = (
  method,
  endpoint,
  params = {},
  data = {},
  options = {
    expiration: 30 * 1000,
    priority: 5,
  },
) => {
  const qid = `${method}-${endpoint}-${JSON.stringify(params)}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)}`;

  const throwErrors = options?.throwErrors || false;

  return limiter.schedule(
    {
      expiration: options?.expiration || 30 * 1000,
      priority: options.priority || 5,
      id: qid,
    },
    async () => {
      const r = await pdAxiosRequest(method, endpoint, params, data, throwErrors);
      return r;
    },
  );
};

export const getLimiterStats = () => limiter.counts();
export const getLimiter = () => limiter;
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
    offset: 0,
  };

  const axiosRequestOptions = {
    expiration: options?.expiration || 30 * 1000,
    priority: options.priority,
  };

  if (params) requestParams = { ...requestParams, ...params };

  let reversedSortOrder = false;
  if (endpoint.indexOf('log_entries') > -1) reversedSortOrder = true;

  const firstPageResponse = await throttledPdAxiosRequest(
    'GET',
    endpoint,
    { ...requestParams, total: true },
    undefined,
    axiosRequestOptions,
  );

  if (!(firstPageResponse.status >= 200 && firstPageResponse.status < 300)) {
    const e = new Error(
      `Error fetching ${endpoint}: ${firstPageResponse.status}`
        + `${firstPageResponse.data ? `: ${firstPageResponse.data}` : ''}`,
    );
    e.response = firstPageResponse;
    throw e;
  }
  const firstPage = firstPageResponse.data;
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
  if (!options.skipSort && fetchedData.length > 0) {
    fetchedData.sort((a, b) => (reversedSortOrder ? compareCreatedAt(b, a) : compareCreatedAt(a, b)));
  }
  return fetchedData;
};
