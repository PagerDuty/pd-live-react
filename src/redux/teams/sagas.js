import {
  put, call, takeLatest,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  pdParallelFetch,
} from 'util/pd-api-wrapper';
import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
import {
  FETCH_TEAMS_REQUESTED, FETCH_TEAMS_COMPLETED, FETCH_TEAMS_ERROR,
} from './actions';

export function* getTeamsAsync() {
  yield takeLatest(FETCH_TEAMS_REQUESTED, getTeams);
}

export function* getTeams() {
  try {
    const teams = yield call(pdParallelFetch, 'teams');

    yield put({
      type: FETCH_TEAMS_COMPLETED,
      teams,
    });
  } catch (e) {
    // Handle API auth failure
    if (e.response?.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({ type: FETCH_TEAMS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}
