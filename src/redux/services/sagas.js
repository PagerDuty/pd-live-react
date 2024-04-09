import {
  put, call, takeLatest,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  pdParallelFetch,
} from 'src/util/pd-api-wrapper';
import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'src/redux/connection/actions';
import {
  FETCH_EXTENSIONS_REQUESTED,
} from 'src/redux/extensions/actions';
import {
  FETCH_SERVICES_REQUESTED,
  FETCH_SERVICES_COMPLETED,
  FETCH_SERVICES_ERROR,
} from './actions';

export function* getServicesAsync() {
  yield takeLatest(FETCH_SERVICES_REQUESTED, getServices);
}

export function* getServices(action) {
  try {
    //  Create params and call pd lib
    const {
      teamIds,
    } = action;
    const params = {};
    if (teamIds.length) params['team_ids[]'] = teamIds;

    const services = yield call(pdParallelFetch, 'services', params);

    yield put({
      type: FETCH_SERVICES_COMPLETED,
      services,
    });

    // We now obtain extensions for mapping once services have been fetched
    yield put({ type: FETCH_EXTENSIONS_REQUESTED });
  } catch (e) {
    // Handle API auth failure
    if (e.response?.status === 401) {
      e.message = i18next.t('Unauthorized Access');
      throw e;
    }
    yield put({ type: FETCH_SERVICES_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}
