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

export const pdAxiosRequest = async (
  method,
  endpoint,
  params = {},
  data = {},
  throwErrors = false,
) => axios({
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
  RealUserMonitoring.trackError(new Error('LimiterDepleted'), {
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
        RealUserMonitoring.trackError(new Error('LimiterWatchdogTimeout'), {
          reservoir,
          currentLimit,
        });
        resetLimiterWithRateLimit(currentLimit);
      }
    });
  }, 10 * 1000);
});

limiter.on('error', (error) => {
  RealUserMonitoring.trackError(new Error('limiter error'), {
    error,
    currentLimit,
  });
});

// Listen to the 'failed' event
limiter.on('failed', async (error, jobInfo) => {
  const {
    id,
  } = jobInfo.options;
  // eslint-disable-next-line no-console
  console.error(`Job ${id} failed: ${error}`);

  RealUserMonitoring.trackError(error, {
    jobInfo,
  });

  if (jobInfo.retryCount < 3) {
    // eslint-disable-next-line no-console
    console.error(`Retrying job ${id} in 100ms!`);
    return 100;
  }
  return undefined;
});

// Listen to the 'retry' event
// eslint-disable-next-line no-console
limiter.on('retry', (error, jobInfo) => console.error(`Now retrying ${jobInfo.options.id}`));

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
  const qid = `${method}-${endpoint}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const throwErrors = options?.throwErrors || false;

  return limiter
    .schedule(
      {
        expiration: options?.expiration || 30 * 1000,
        priority: options.priority || 5,
        id: qid,
      },
      async () => {
        const r = await pdAxiosRequest(method, endpoint, params, data, throwErrors);
        return r;
      },
    )
    .catch((error) => {
      if (error instanceof Bottleneck.BottleneckError) {
        RealUserMonitoring.trackError(error, {
          type: 'limiter error',
          method,
          endpoint,
          currentLimit,
        });
      } else {
        RealUserMonitoring.trackError(error, {
          type: 'pdAxiosRequest error',
          method,
          endpoint,
        });
        throw error;
      }
    });
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

  if (!firstPageResponse?.status) {
    const e = new Error(`Error fetching ${endpoint}: no response object`);
    RealUserMonitoring.trackError(e, {
      endpoint,
      response: firstPageResponse,
      params: requestParams,
    });
    throw e;
  }

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

  if (!fetchedData) {
    const e = new Error(`No data found for endpoint ${endpoint}`);
    RealUserMonitoring.trackError(e, {
      endpoint,
      response: firstPage,
      params: requestParams,
    });
    throw e;
  }

  const promises = [];
  const failed = [];

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
        .then((response) => {
          if (
            !response?.status
            || !(response.status >= 200 && response.status < 300)
            || !response.data
          ) {
            failed.push({
              endpoint,
              response,
              params: { ...requestParams, offset },
            });
            RealUserMonitoring.trackError(new Error('Failed to fetch data'), {
              endpoint,
              response,
              params: { ...requestParams, offset },
            });
            return;
          }
          const {
            data,
          } = response;
          fetchedData.push(...data[endpointIdentifier(endpoint)]);
          if (progressCallback) {
            progressCallback(firstPage.total, fetchedData.length);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          RealUserMonitoring.trackError(new Error('Failed to fetch data'), {
            endpoint,
            error,
            params: { ...requestParams, offset },
          });
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
