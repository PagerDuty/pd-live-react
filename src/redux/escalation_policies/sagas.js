import {
  put, call, takeLatest,
} from 'redux-saga/effects';

import i18next from 'i18n';

import {
  pdParallelFetch,
} from 'util/pd-api-wrapper';
import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
import {
  FETCH_ESCALATION_POLICIES_REQUESTED,
  FETCH_ESCALATION_POLICIES_COMPLETED,
  FETCH_ESCALATION_POLICIES_ERROR,
} from './actions';

export function* getEscalationPoliciesAsync() {
  yield takeLatest(FETCH_ESCALATION_POLICIES_REQUESTED, getEscalationPolicies);
}

export function* getEscalationPolicies() {
  try {
    const escalationPolicies = yield call(pdParallelFetch, 'escalation_policies');

    yield put({
      type: FETCH_ESCALATION_POLICIES_COMPLETED,
      escalationPolicies,
    });
  } catch (e) {
    // Handle API auth failure
    if (e.response?.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({ type: FETCH_ESCALATION_POLICIES_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}
