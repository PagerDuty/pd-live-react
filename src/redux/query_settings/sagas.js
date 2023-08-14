import {
  put, select, takeLatest, call, debounce,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

// import {
//   // pd,
//   throttledPdAxiosRequest,
// } from 'util/pd-api-wrapper';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
import {
  FETCH_INCIDENTS_REQUESTED,
  // FILTER_INCIDENTS_LIST_BY_QUERY,
} from 'redux/incidents/actions';

import {
  getIncidents, // getAllIncidentNotes, // getAllIncidentAlerts,
} from 'redux/incidents/sagas';

// import {
//   FETCH_SERVICES_REQUESTED,
// } from 'redux/services/actions';

// import {
//   GET_USERS_REQUESTED,
// } from 'redux/users/actions';

// import {
//   DEBUG_SINCE_DATE, DEBUG_UNTIL_DATE,
// } from 'config/constants';

import {
  TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED,
  TOGGLE_DISPLAY_QUERY_SETTINGS_COMPLETED,
  UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED,
  UPDATE_QUERY_SETTING_SINCE_DATE_COMPLETED,
  UPDATE_QUERY_SETTING_UNTIL_DATE_REQUESTED,
  UPDATE_QUERY_SETTING_UNTIL_DATE_COMPLETED,
  UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED,
  UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED,
  UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED,
  UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED,
  UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED,
  UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_COMPLETED,
  UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED,
  UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED,
  UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED,
  UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_COMPLETED,
  UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED,
  UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED,
  UPDATE_QUERY_SETTINGS_USERS_REQUESTED,
  UPDATE_QUERY_SETTINGS_USERS_COMPLETED,
  UPDATE_SEARCH_QUERY_REQUESTED,
  UPDATE_SEARCH_QUERY_COMPLETED,
  VALIDATE_INCIDENT_QUERY_REQUESTED,
  VALIDATE_INCIDENT_QUERY_COMPLETED,
  CONFIRM_INCIDENT_QUERY_REQUESTED,
  CONFIRM_INCIDENT_QUERY_COMPLETED,
  CONFIRM_INCIDENT_QUERY_ERROR,
} from './actions';

import {
  FILTER_INCIDENTS_LIST,
} from '../incidents/actions';

import selectQuerySettings from './selectors';

export function* toggleDisplayQuerySettings() {
  yield takeLatest(TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED, toggleDisplayQuerySettingsImpl);
}

export function* toggleDisplayQuerySettingsImpl() {
  const {
    displayQuerySettings,
  } = yield select(selectQuerySettings);
  yield put({
    type: TOGGLE_DISPLAY_QUERY_SETTINGS_COMPLETED,
    displayQuerySettings: !displayQuerySettings,
  });
}

export function* updateQuerySettingsSinceDate() {
  yield takeLatest(UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED, updateQuerySettingsSinceDateImpl);
}

export function* updateQuerySettingsSinceDateImpl(action) {
  // Update since date and re-request incidents list + notes
  const {
    sinceDate,
  } = action;
  yield put({ type: UPDATE_QUERY_SETTING_SINCE_DATE_COMPLETED, sinceDate });
  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });
  yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateQuerySettingsUntilDate() {
  yield takeLatest(UPDATE_QUERY_SETTING_UNTIL_DATE_REQUESTED, updateQuerySettingsUntilDateImpl);
}

export function* updateQuerySettingsUntilDateImpl(action) {
  // Update since date and re-request incidents list + notes
  const {
    untilDate,
  } = action;
  yield put({ type: UPDATE_QUERY_SETTING_UNTIL_DATE_COMPLETED, untilDate });
  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });
  yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateQuerySettingsIncidentStatus() {
  yield takeLatest(
    UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED,
    updateQuerySettingsIncidentStatusImpl,
  );
}

export function* updateQuerySettingsIncidentStatusImpl(action) {
  // Update incident status and re-request incidents list + notes
  const {
    incidentStatus,
  } = action;

  yield put({
    type: UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED,
    incidentStatus,
  });

  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });

  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
}

export function* updateQuerySettingsIncidentUrgency() {
  yield takeLatest(
    UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED,
    updateQuerySettingsIncidentUrgencyImpl,
  );
}

export function* updateQuerySettingsIncidentUrgencyImpl(action) {
  // Update incident urgency and re-request incidents list + notes
  const {
    incidentUrgency,
  } = action;

  yield put({
    type: UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED,
    incidentUrgency,
  });

  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });

  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
  // yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateQuerySettingsIncidentPriority() {
  yield takeLatest(
    UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED,
    updateQuerySettingsIncidentPriorityImpl,
  );
}

export function* updateQuerySettingsIncidentPriorityImpl(action) {
  // Update incident priority, re-request incidents list, and then apply priority filtering
  const {
    incidentPriority,
  } = action;
  yield put({
    type: UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_COMPLETED,
    incidentPriority,
  });
  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
}

export function* updateQuerySettingsTeams() {
  yield takeLatest(UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED, updateQuerySettingsTeamsImpl);
}

export function* updateQuerySettingsTeamsImpl(action) {
  // Update team ids, re-request services and users under those teams, and re-request incidents list
  const {
    teamIds,
  } = action;

  // yield put({ type: FETCH_SERVICES_REQUESTED, teamIds });
  // yield put({ type: GET_USERS_REQUESTED, teamIds });
  yield put({ type: UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED, teamIds });

  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });

  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
  // yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateQuerySettingsEscalationPolicies() {
  yield takeLatest(
    UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED,
    updateQuerySettingsEscalationPoliciesImpl,
  );
}

export function* updateQuerySettingsEscalationPoliciesImpl(action) {
  // Update escalation policy ids and re-request incidents list + notes
  const {
    escalationPolicyIds,
  } = action;
  yield put({ type: UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_COMPLETED, escalationPolicyIds });
  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
  // yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateQuerySettingsServices() {
  yield takeLatest(UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED, updateQuerySettingsServicesImpl);
}

export function* updateQuerySettingsServicesImpl(action) {
  // Update service ids and re-request incidents list + notes
  const {
    serviceIds,
  } = action;

  yield put({ type: UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED, serviceIds });

  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });

  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
  // yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateQuerySettingsUsers() {
  yield takeLatest(UPDATE_QUERY_SETTINGS_USERS_REQUESTED, updateQuerySettingsUsersImpl);
}

export function* updateQuerySettingsUsersImpl(action) {
  // Update user ids and re-request incidents list + notes
  const {
    userIds,
  } = action;

  yield put({ type: UPDATE_QUERY_SETTINGS_USERS_COMPLETED, userIds });

  yield put({
    type: FETCH_INCIDENTS_REQUESTED,
  });

  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
  // yield put({ type: VALIDATE_INCIDENT_QUERY_REQUESTED });
}

export function* updateSearchQuery() {
  yield takeLatest(UPDATE_SEARCH_QUERY_REQUESTED, updateSearchQueryImpl);
}

export function* updateSearchQueryImpl(action) {
  // Update search query and filter incidents
  const {
    searchQuery,
  } = action;
  yield put({ type: UPDATE_SEARCH_QUERY_COMPLETED, searchQuery });
  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
  // yield put({ type: FILTER_INCIDENTS_LIST_BY_QUERY, searchQuery });
}

export function* validateIncidentQuery() {
  yield debounce(2000, VALIDATE_INCIDENT_QUERY_REQUESTED, validateIncidentQueryImpl);
}

export function* validateIncidentQueryImpl() {
  try {
    yield put({ type: VALIDATE_INCIDENT_QUERY_COMPLETED });
  } catch (e) {
    // Handle API auth failure
    if (e.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}

export function* confirmIncidentQuery() {
  yield takeLatest(CONFIRM_INCIDENT_QUERY_REQUESTED, confirmIncidentQueryImpl);
}

export function* confirmIncidentQueryImpl(action) {
  const {
    confirm,
  } = action;
  if (confirm) {
    yield call(getIncidents);
    // yield call(getAllIncidentNotes);
    // yield call(getAllIncidentAlerts);
    yield put({ type: CONFIRM_INCIDENT_QUERY_COMPLETED });
  } else {
    yield put({ type: CONFIRM_INCIDENT_QUERY_ERROR });
  }
}
