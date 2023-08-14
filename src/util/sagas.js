import {
  put,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_REQUESTED,
  UPDATE_ACTION_ALERTS_MODAL_REQUESTED,
} from 'redux/action_alerts/actions';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';

// eslint-disable-next-line max-len
export const MISSING_ABILITY_ERROR = i18next.t(
  'Current subdomain does not have the correct ability to use PagerDuty Live',
);

// Helper function to handle errors while processing saga
export function* handleSagaError(action, exception) {
  yield displayActionModal('error', exception.message);
  yield put({ type: action, message: exception.message });
}

// Helper functions to handle API errors in response
export const handleSingleAPIErrorResponse = (response) => {
  if (response?.data?.error) {
    throw Error(
      response.data.error.message
        + (response.data.error.errors ? `: ${response.data.error.errors.join(', ')}` : ''),
    );
  } else {
    throw Error(i18next.t('Unknown error while using PD API'));
  }
};

export const handleMultipleAPIErrorResponses = (responses) => {
  const errors = responses
    .filter((response) => response?.data?.error)
    .map(
      (response) => response.data.error.message
        + (response.data.error.errors ? `: ${response.data.error.errors.join(', ')}` : ''),
    );
  if (errors.length) {
    throw Error(errors);
  } else {
    throw Error(i18next.t('Unknown error while using PD API'));
  }
};

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
