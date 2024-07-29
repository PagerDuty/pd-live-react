import {
  put, call, select, takeLatest, take, race, delay,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  getLimiterStats, throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

import {
  FETCH_LOG_ENTRIES_COMPLETED,
  FETCH_LOG_ENTRIES_ERROR,
} from 'src/redux/log_entries/actions';

import {
  updateConnectionStatusRequested, MISSING_ABILITY_ERROR,
} from 'src/util/sagas';

import {
  PD_OAUTH_CLIENT_ID,
  PD_OAUTH_CLIENT_SECRET,
  PD_REQUIRED_ABILITY,
  DEBUG_DISABLE_POLLING,
} from 'src/config/constants';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
  UPDATE_CONNECTION_STATUS_COMPLETED,
  UPDATE_QUEUE_STATS_REQUESTED,
  UPDATE_QUEUE_STATS_COMPLETED,
  START_QUEUE_STATS_POLLING,
  STOP_QUEUE_STATS_POLLING,
  CHECK_CONNECTION_STATUS_REQUESTED,
  CHECK_CONNECTION_STATUS_COMPLETED,
  START_CONNECTION_STATUS_POLLING,
  STOP_CONNECTION_STATUS_POLLING,
  CHECK_ABILITIES_REQUESTED,
  CHECK_ABILITIES_COMPLETED,
  CHECK_ABILITIES_ERROR,
  START_ABILITIES_POLLING,
  STOP_ABILITIES_POLLING,
  OAUTH_REFRESH_REQUESTED,
  OAUTH_REFRESH_COMPLETED,
  OAUTH_REFRESH_ERROR,
  START_OAUTH_REFRESH_POLLING,
  STOP_OAUTH_REFRESH_POLLING,
  SAVE_ERROR_REQUESTED,
  SAVE_ERROR_COMPLETED,
} from './actions';

export function* updateConnectionStatus() {
  yield takeLatest(UPDATE_CONNECTION_STATUS_REQUESTED, updateConnectionStatusImpl);
}

export function* updateConnectionStatusImpl(action) {
  const {
    connectionStatus, connectionStatusMessage, messageDetail,
  } = action;
  yield put({
    type: UPDATE_CONNECTION_STATUS_COMPLETED,
    connectionStatus,
    connectionStatusMessage,
    messageDetail,
  });
}

export function* updateQueueStats() {
  yield takeLatest(UPDATE_QUEUE_STATS_REQUESTED, updateQueueStatsImpl);
}

export function* updateQueueStatsImpl(action) {
  const {
    queueStats,
  } = action;
  yield put({
    type: UPDATE_QUEUE_STATS_COMPLETED,
    queueStats,
  });
}

export function* updateQueueStatsTask() {
  while (true) {
    yield call(updateQueueStatsImpl, { queueStats: getLimiterStats() });
    yield delay(1000);
  }
}

export function* updateQueueStatsTaskWatcher() {
  while (true) {
    yield take(START_QUEUE_STATS_POLLING);
    yield race([call(updateQueueStatsTask), take(STOP_QUEUE_STATS_POLLING)]);
  }
}

export function* checkConnectionStatus() {
  yield takeLatest(CHECK_CONNECTION_STATUS_REQUESTED, checkConnectionStatusImpl);
}

export function* checkConnectionStatusImpl() {
  // Wait until these actions have been dispatched before verifying connection status
  // yield take([CHECK_ABILITIES_COMPLETED, CHECK_ABILITIES_ERROR]);
  if (!DEBUG_DISABLE_POLLING) {
    yield take([FETCH_LOG_ENTRIES_COMPLETED, FETCH_LOG_ENTRIES_ERROR]);
  }

  // Check entire store for fulfilled statuses
  const {
    incidents: {
      status: incidentsStatus,
    },
    logEntries: {
      status: logEntriesStatus,
    },
    extensions: {
      status: extensionsStatus,
    },
    connection: {
      abilities, connectionStatusMessage,
    },
  } = yield select();
  let validConnection = false;
  if (
    incidentsStatus.includes('COMPLETED')
    && logEntriesStatus.includes('COMPLETED')
    && extensionsStatus.includes('COMPLETED')
  ) {
    // Ignoring priorities as this is persisted to localcache
    validConnection = true;
  }

  if (DEBUG_DISABLE_POLLING) {
    yield updateConnectionStatusRequested('negative', i18next.t('Live updates disabled'));
  } else if (validConnection) {
    if (!abilities.includes(PD_REQUIRED_ABILITY)) {
      yield updateConnectionStatusRequested('negative', MISSING_ABILITY_ERROR);
    } else {
      yield put({
        type: UPDATE_CONNECTION_STATUS_COMPLETED,
        connectionStatus: 'positive',
        connectionStatusMessage: i18next.t('Connected'),
        messageDetail: i18next.t('Live updates enabled'),
      });
    }
  } else if (!abilities.includes(PD_REQUIRED_ABILITY)) {
    yield updateConnectionStatusRequested('negative', MISSING_ABILITY_ERROR);
  } else {
    yield updateConnectionStatusRequested('neutral', connectionStatusMessage);
  }
  yield put({ type: CHECK_CONNECTION_STATUS_COMPLETED });
}

export function* checkConnectionStatusTask() {
  while (true) {
    yield call(checkConnectionStatusImpl);
    yield delay(1000);
  }
}

export function* checkConnectionStatusTaskWatcher() {
  while (true) {
    yield take(START_CONNECTION_STATUS_POLLING);
    yield race([call(checkConnectionStatusTask), take(STOP_CONNECTION_STATUS_POLLING)]);
  }
}

export function* checkAbilities() {
  yield takeLatest(CHECK_ABILITIES_REQUESTED, checkAbilitiesAsync);
}

export function* checkAbilitiesAsync() {
  try {
    // Obtain abilities from API
    const response = yield call(throttledPdAxiosRequest, 'GET', 'abilities');
    const {
      status,
    } = response;
    if (status !== 200) {
      throw Error(i18next.t('Unable to fetch account abilities'));
    }
    const {
      abilities,
    } = response.data;
    yield put({ type: CHECK_ABILITIES_COMPLETED, abilities });

    // Check if required ability is present, else identicate error
    if (!abilities.includes(PD_REQUIRED_ABILITY)) {
      yield updateConnectionStatusRequested('negative', MISSING_ABILITY_ERROR);
    }
  } catch (e) {
    // Handle API auth failure
    if (e.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({ type: CHECK_ABILITIES_ERROR, message: e.message });
    yield updateConnectionStatusRequested('neutral', e.message);
  }
}

export function* checkAbilitiesTask() {
  while (true) {
    yield call(checkAbilitiesAsync);
    yield delay(300_000);
  }
}

export function* checkAbilitiesTaskWatcher() {
  while (true) {
    yield take(START_ABILITIES_POLLING);
    yield race([call(checkAbilitiesTask), take(STOP_ABILITIES_POLLING)]);
  }
}

export function* refreshOauth() {
  yield takeLatest(OAUTH_REFRESH_REQUESTED, refreshOauthImpl);
}

export function* refreshOauthImpl() {
  const postData = async (url, data) => {
    const formData = new URLSearchParams(data); // Convert data to URL-encoded form data
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Set the content type
      },
      body: formData.toString(), // Convert the form data to a string
    });
    const json = await response.json(); // Parse the response JSON
    return json;
  };

  const refreshToken = sessionStorage.getItem('pd_refresh_token');
  if (!refreshToken) {
    yield put({ type: OAUTH_REFRESH_ERROR, message: 'No refresh token found' });
  }

  const requestTokenUrl = 'https://identity.pagerduty.com/oauth/token';
  const formData = {
    grant_type: 'refresh_token',
    client_id: PD_OAUTH_CLIENT_ID,
    client_secret: PD_OAUTH_CLIENT_SECRET,
    refresh_token: refreshToken,
  };

  const response = yield call(postData, requestTokenUrl, formData);
  const {
    access_token: accessToken,
    refresh_token: newRefreshToken,
    expires_in: expiresIn,
  } = response;
  if (!accessToken || !newRefreshToken || !expiresIn) {
    yield put({ type: OAUTH_REFRESH_ERROR, message: 'Invalid response from OAuth server' });
  } else {
    sessionStorage.setItem('pd_access_token', accessToken);
    sessionStorage.setItem('pd_refresh_token', newRefreshToken);
    sessionStorage.setItem('pd_token_expires_at', Date.now() + expiresIn * 1000);
    yield put({ type: OAUTH_REFRESH_COMPLETED });
  }
}

export function* checkForTokenExpiry() {
  while (true) {
    const tokenExpiresAtStr = sessionStorage.getItem('pd_token_expires_at');
    const refreshToken = sessionStorage.getItem('pd_refresh_token');
    if (
      typeof refreshToken === 'string'
      && refreshToken.startsWith('pd')
      && typeof tokenExpiresAtStr === 'string'
      && /^-?\d+$/.test(tokenExpiresAtStr)
    ) {
      const tokenExpiresAt = new Date(parseInt(tokenExpiresAtStr, 10));
      if (tokenExpiresAt && Date.now() + 60_000 > tokenExpiresAt) {
        yield put({ type: OAUTH_REFRESH_REQUESTED });
      }
    }
    yield delay(60_000);
  }
}

export function* checkForTokenExpiryWatcher() {
  while (true) {
    yield take(START_OAUTH_REFRESH_POLLING);
    yield race([call(checkForTokenExpiry), take(STOP_OAUTH_REFRESH_POLLING)]);
  }
}

export function* saveError() {
  yield takeLatest(SAVE_ERROR_REQUESTED, saveErrorImpl);
}

export function* saveErrorImpl(action) {
  const {
    error,
  } = action;
  yield put({
    type: SAVE_ERROR_COMPLETED,
    error,
  });
}
