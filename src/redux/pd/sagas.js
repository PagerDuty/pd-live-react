import {
  put,
  takeLatest,
} from 'redux-saga/effects';

import {
  PD_API_CALL_REQUESTED,
  PD_API_CALL_COMPLETED,
  PD_API_CALL_ERROR,
} from './actions';

export function* pdApiCallAsync() {
  yield takeLatest(PD_API_CALL_REQUESTED, pdApiCall);
}

export function* pdApiCall(action) {
  try {
    console.log('pdApiCall', action);
    yield put({
      type: PD_API_CALL_COMPLETED,
      response: {},
    });
  } catch (e) {
    yield put({ type: PD_API_CALL_ERROR, message: e.message });
  }
}
