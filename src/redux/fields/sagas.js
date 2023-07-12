import {
  put, call, takeLatest,
} from 'redux-saga/effects';

import {
  pdParallelFetch,
} from 'util/pd-api-wrapper';
import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
import {
  FETCH_FIELDS_REQUESTED, FETCH_FIELDS_COMPLETED, FETCH_FIELDS_ERROR,
} from './actions';

export function* getFieldsAsync() {
  yield takeLatest(FETCH_FIELDS_REQUESTED, getFields);
}

export function* getFields() {
  try {
    const response = yield call(pdParallelFetch, 'incidents/custom_fields');

    yield put({
      type: FETCH_FIELDS_COMPLETED,
      fields: response.resource,
    });
  } catch (e) {
    if (e.status === 401) {
      e.message = 'Unauthorized Access';
    }
    yield put({ type: FETCH_FIELDS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}
