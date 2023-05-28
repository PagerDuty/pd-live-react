import {
  put, select, takeLatest, call, debounce,
} from 'redux-saga/effects';

import i18next from 'i18n';

// import {
//   // pd,
//   throttledPdAxiosRequest,
// } from 'util/pd-api-wrapper';

import selectSettings from 'redux/settings/selectors';

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
  TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED,
  TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_COMPLETED,
  UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED,
  UPDATE_TOTAL_INCIDENTS_FROM_QUERY_COMPLETED,
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

  const {
    serverSideFiltering,
  } = yield select(selectSettings);

  yield put({
    type: UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED,
    incidentStatus,
  });

  if (serverSideFiltering) {
    yield put({
      type: FETCH_INCIDENTS_REQUESTED,
    });
  }

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

  const {
    serverSideFiltering,
  } = yield select(selectSettings);

  yield put({
    type: UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED,
    incidentUrgency,
  });

  if (serverSideFiltering) {
    yield put({
      type: FETCH_INCIDENTS_REQUESTED,
    });
  }

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

  const {
    serverSideFiltering,
  } = yield select(selectSettings);

  // yield put({ type: FETCH_SERVICES_REQUESTED, teamIds });
  // yield put({ type: GET_USERS_REQUESTED, teamIds });
  yield put({ type: UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED, teamIds });

  if (serverSideFiltering) {
    yield put({
      type: FETCH_INCIDENTS_REQUESTED,
    });
  }

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

  const {
    serverSideFiltering,
  } = yield select(selectSettings);

  yield put({ type: UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED, serviceIds });

  if (serverSideFiltering) {
    yield put({
      type: FETCH_INCIDENTS_REQUESTED,
    });
  }

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

  const {
    serverSideFiltering,
  } = yield select(selectSettings);

  yield put({ type: UPDATE_QUERY_SETTINGS_USERS_COMPLETED, userIds });

  if (serverSideFiltering) {
    yield put({
      type: FETCH_INCIDENTS_REQUESTED,
    });
  }

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
    // // Find total incidents from data query
    // const {
    //   maxIncidentsLimit, autoAcceptIncidentsQuery,
    // } = yield select(selectSettings);

    // const {
    //   sinceDate,
    //   incidentStatus,
    //   incidentUrgency,
    //   teamIds,
    //   serviceIds,
    //   userIds,
    //   // incidentPriority, // Unfortunately can't do this pre-API call.
    // } = yield select(selectQuerySettings);

    // const params = {
    //   since: DEBUG_SINCE_DATE
    // ? new Date(DEBUG_SINCE_DATE).toISOString() : sinceDate.toISOString(),
    //   until: DEBUG_UNTIL_DATE
    // ? new Date(DEBUG_UNTIL_DATE).toISOString() : new Date().toISOString(),
    //   limit: 1,
    //   total: true,
    // };

    // if (incidentStatus) params['statuses[]'] = incidentStatus;
    // if (incidentUrgency) params['urgencies[]'] = incidentUrgency;
    // if (teamIds.length) params['team_ids[]'] = teamIds;
    // if (serviceIds.length) params['service_ids[]'] = serviceIds;
    // if (userIds.length) params['user_ids[]'] = userIds;

    // const response = yield call(throttledPdAxiosRequest, 'GET', 'incidents', params);
    // if (response.status !== 200) {
    //   throw Error(i18next.t('Unable to fetch incidents'));
    // }

    // const totalIncidentsFromQuery = response.data.total;
    yield put({ type: VALIDATE_INCIDENT_QUERY_COMPLETED });
    // yield put({
    //   type: UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED,
    //   totalIncidentsFromQuery,
    // });

    // // Determine if Confirm Query Modal component should be rendered
    // if (totalIncidentsFromQuery > maxIncidentsLimit && !autoAcceptIncidentsQuery) {
    //   yield put({ type: TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED });
    // } else {
    //   yield put({ type: CONFIRM_INCIDENT_QUERY_REQUESTED, confirm: true });
    // }
    // yield put({
    //   type: FILTER_INCIDENTS_LIST,
    // });
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

export function* toggleDisplayConfirmQueryModal() {
  yield takeLatest(
    TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED,
    toggleDisplayConfirmQueryModalImpl,
  );
}

export function* toggleDisplayConfirmQueryModalImpl() {
  const {
    displayConfirmQueryModal,
  } = yield select(selectQuerySettings);
  yield put({
    type: TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_COMPLETED,
    displayConfirmQueryModal: !displayConfirmQueryModal,
  });
}

export function* updateTotalIncidentsFromQuery() {
  yield takeLatest(UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED, updateTotalIncidentsFromQueryImpl);
}

export function* updateTotalIncidentsFromQueryImpl(action) {
  const {
    totalIncidentsFromQuery,
  } = action;
  yield put({
    type: UPDATE_TOTAL_INCIDENTS_FROM_QUERY_COMPLETED,
    totalIncidentsFromQuery,
  });
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
