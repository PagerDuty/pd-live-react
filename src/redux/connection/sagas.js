import {
  put, call, select, takeLatest, take,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  throttledPdAxiosRequest,
} from 'util/pd-api-wrapper';

import {
  FETCH_LOG_ENTRIES_COMPLETED, FETCH_LOG_ENTRIES_ERROR,
} from 'redux/log_entries/actions';

import {
  updateConnectionStatusRequested, MISSING_ABILITY_ERROR,
} from 'util/sagas';

import {
  PD_REQUIRED_ABILITY, DEBUG_DISABLE_POLLING,
} from 'config/constants';

// import {
//   FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED,
//   FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR,
// } from 'redux/incidents/actions';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
  UPDATE_CONNECTION_STATUS_COMPLETED,
  UPDATE_QUEUE_STATS_REQUESTED,
  UPDATE_QUEUE_STATS_COMPLETED,
  CHECK_CONNECTION_STATUS_REQUESTED,
  CHECK_CONNECTION_STATUS_COMPLETED,
  CHECK_ABILITIES_REQUESTED,
  CHECK_ABILITIES_COMPLETED,
  CHECK_ABILITIES_ERROR,
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

export function* checkConnectionStatus() {
  yield takeLatest(CHECK_CONNECTION_STATUS_REQUESTED, checkConnectionStatusImpl);
}

export function* checkConnectionStatusImpl() {
  // Wait until these actions have been dispatched before verifying connection status
  // yield take([CHECK_ABILITIES_COMPLETED, CHECK_ABILITIES_ERROR]);
  if (!DEBUG_DISABLE_POLLING) {
    yield take([FETCH_LOG_ENTRIES_COMPLETED, FETCH_LOG_ENTRIES_ERROR]);
    // yield take([
    //   FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED,
    //   FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR,
    // ]);
  }

  // Check entire store for fulfilled statuses
  const store = yield select();
  let validConnection = false;
  if (
    store.incidents.status.includes('COMPLETED')
    && store.logEntries.status.includes('COMPLETED')
    && store.services.status.includes('COMPLETED')
    && store.teams.status.includes('COMPLETED')
    && store.users.status.includes('COMPLETED')
    && store.escalationPolicies.status.includes('COMPLETED')
    && store.extensions.status.includes('COMPLETED')
    // response plays gives an error if incident workflows is enabled
    // && store.responsePlays.status.includes('COMPLETED')
    // && store.connection.status.includes('COMPLETED')
  ) {
    // Ignoring priorities as this is persisted to localcache
    validConnection = true;
  }

  // console.log('validConnection', validConnection);
  // if (!validConnection) {
  //   console.log({
  //     logEntries: store.logEntries.status,
  //     services: store.services.status,
  //     teams: store.teams.status,
  //     users: store.users.status,
  //     eps: store.escalationPolicies.status,
  //     extensions: store.extensions.status,
  //     responsePlays: store.responsePlays.status,
  //     connection: store.connection.status,
  //   });
  // }

  // Update connection status depending on store state
  const {
    abilities,
  } = store.connection;
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
    yield updateConnectionStatusRequested('neutral', store.connection.connectionStatusMessage);
  }
  yield put({ type: CHECK_CONNECTION_STATUS_COMPLETED });
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
