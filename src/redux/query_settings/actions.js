/* eslint-disable max-len */
// Define Action Types
export const TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED = 'TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED';
export const TOGGLE_DISPLAY_QUERY_SETTINGS_COMPLETED = 'TOGGLE_DISPLAY_QUERY_SETTINGS_COMPLETED';

export const UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED = 'UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED';
export const UPDATE_QUERY_SETTING_SINCE_DATE_COMPLETED = 'UPDATE_QUERY_SETTING_SINCE_DATE_COMPLETED';

export const UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED = 'UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED';
export const UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED = 'UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED';

export const UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED = 'UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED';
export const UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED = 'UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED';

export const UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED = 'UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED';
export const UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_COMPLETED = 'UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_COMPLETED';

export const UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED = 'UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED';
export const UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED = 'UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED';

export const UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED = 'UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED';
export const UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_COMPLETED = 'UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_COMPLETED';

export const UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED = 'UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED';
export const UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED = 'UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED';

export const UPDATE_QUERY_SETTINGS_USERS_REQUESTED = 'UPDATE_QUERY_SETTINGS_USERS_REQUESTED';
export const UPDATE_QUERY_SETTINGS_USERS_COMPLETED = 'UPDATE_QUERY_SETTINGS_USERS_COMPLETED';

export const UPDATE_SEARCH_QUERY_REQUESTED = 'UPDATE_SEARCH_QUERY_REQUESTED';
export const UPDATE_SEARCH_QUERY_COMPLETED = 'UPDATE_SEARCH_QUERY_COMPLETED';

export const VALIDATE_INCIDENT_QUERY_REQUESTED = 'VALIDATE_INCIDENT_QUERY_REQUESTED';
export const VALIDATE_INCIDENT_QUERY_COMPLETED = 'VALIDATE_INCIDENT_QUERY_COMPLETED';

export const UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED = 'UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED';
export const UPDATE_TOTAL_INCIDENTS_FROM_QUERY_COMPLETED = 'UPDATE_TOTAL_INCIDENTS_FROM_QUERY_COMPLETED';

export const CONFIRM_INCIDENT_QUERY_REQUESTED = 'CONFIRM_INCIDENT_QUERY_REQUESTED';
export const CONFIRM_INCIDENT_QUERY_COMPLETED = 'CONFIRM_INCIDENT_QUERY_COMPLETED';
export const CONFIRM_INCIDENT_QUERY_ERROR = 'CONFIRM_INCIDENT_QUERY_ERROR';

// Define Actions
export const toggleDisplayQuerySettings = () => ({
  type: TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED,
});

export const updateQuerySettingsSinceDate = (sinceDate) => ({
  type: UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED,
  sinceDate,
});

export const updateQuerySettingsIncidentStatus = (incidentStatus) => ({
  type: UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED,
  incidentStatus,
});

export const updateQuerySettingsIncidentUrgency = (incidentUrgency) => ({
  type: UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED,
  incidentUrgency,
});

export const updateQuerySettingsIncidentPriority = (incidentPriority) => ({
  type: UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED,
  incidentPriority,
});

export const updateQuerySettingsTeams = (teamIds) => ({
  type: UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED,
  teamIds,
});

export const updateQuerySettingsEscalationPolicies = (escalationPolicyIds) => ({
  type: UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED,
  escalationPolicyIds,
});

export const updateQuerySettingsServices = (serviceIds) => ({
  type: UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED,
  serviceIds,
});

export const updateQuerySettingsUsers = (userIds) => ({
  type: UPDATE_QUERY_SETTINGS_USERS_REQUESTED,
  userIds,
});

export const updateSearchQuery = (searchQuery) => ({
  type: UPDATE_SEARCH_QUERY_REQUESTED,
  searchQuery,
});

export const confirmIncidentQuery = (confirm = true) => ({
  type: CONFIRM_INCIDENT_QUERY_REQUESTED,
  confirm,
});
