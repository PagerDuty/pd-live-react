import {
  put,
} from 'redux-saga/effects';

import {
  userUnauthorize,
} from 'src/redux/users/actions';

import {
  stopMonitoring,
} from 'src/redux/monitoring/actions';

import RealUserMonitoring from 'src/config/monitoring';

import i18next from 'src/i18n';

import {
  TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_REQUESTED,
  UPDATE_ACTION_ALERTS_MODAL_REQUESTED,
} from 'src/redux/action_alerts/actions';

import {
  // CATASTROPHE,
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'src/redux/connection/actions';

// eslint-disable-next-line max-len
export const MISSING_ABILITY_ERROR = i18next.t(
  'Current subdomain does not have the correct ability to use PagerDuty Live',
);

// Helper function to handle errors while processing saga
export function* handleSagaError(action, exception) {
  RealUserMonitoring.trackError(exception);
  if (exception?.response?.status === 401) {
    yield put(userUnauthorize());
    yield put(stopMonitoring());
    sessionStorage.removeItem('pd_access_token');
    throw Error(i18next.t('Unauthorized. Please re-authorize.'));
  }
  yield displayActionModal('error', exception.message);
  yield put({ type: action, message: exception.message });
}

// Helper functions to handle API errors in response
export function* handleSingleAPIErrorResponse(response) {
  if (response?.status === 401) {
    yield put(userUnauthorize());
    yield put(stopMonitoring());
    sessionStorage.removeItem('pd_access_token');
    throw Error(i18next.t('Unauthorized. Please re-authorize.'));
  }
  if (response?.data?.error) {
    throw Error(
      response.data.error.message
        + (response.data.error.errors ? `: ${response.data.error.errors.join(', ')}` : ''),
    );
  } else {
    throw Error(i18next.t('Unknown error while using PD API'));
  }
}

export function* handleMultipleAPIErrorResponses(responses) {
  if (responses.some((response) => response?.status === 401)) {
    yield put(userUnauthorize());
    yield put(stopMonitoring());
    sessionStorage.removeItem('pd_access_token');
    throw Error(i18next.t('Unauthorized. Please re-authorize.'));
  }
  const errorStrs = responses
    .filter((response) => response?.status < 200 || response?.status >= 300)
    .filter((response) => response?.data?.error)
    .map(
      (response) => response.data.error.message
        + (response.data.error.errors ? `: ${response.data.error.errors.join(', ')}` : ''),
    );
  // dedup errors
  const errors = [...new Set(errorStrs)];
  if (errors.length) {
    throw Error(errors);
  } else {
    throw Error(i18next.t('Unknown error while using PD API'));
  }
}

// Helper function to display modal with API result
export function* displayActionModal(actionAlertsModalType, actionAlertsModalMessage) {
  yield put({
    type: UPDATE_ACTION_ALERTS_MODAL_REQUESTED,
    actionAlertsModalType,
    actionAlertsModalMessage,
  });
  yield put({ type: TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_REQUESTED });
}

// Helper function to update connection status
export function* updateConnectionStatusRequested(status, statusMessage) {
  yield put({
    type: UPDATE_CONNECTION_STATUS_REQUESTED,
    connectionStatus: status,
    connectionStatusMessage: statusMessage,
  });
}
