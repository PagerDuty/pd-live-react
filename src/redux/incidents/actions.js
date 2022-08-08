/* eslint-disable max-len */
// Define Action Types
export const FETCH_INCIDENTS_REQUESTED = 'FETCH_INCIDENTS_REQUESTED';
export const FETCH_INCIDENTS_COMPLETED = 'FETCH_INCIDENTS_COMPLETED';
export const FETCH_INCIDENTS_ERROR = 'FETCH_INCIDENTS_ERROR';

export const REFRESH_INCIDENTS_REQUESTED = 'REFRESH_INCIDENTS_REQUESTED';
export const REFRESH_INCIDENTS_COMPLETED = 'REFRESH_INCIDENTS_COMPLETED';
export const REFRESH_INCIDENTS_ERROR = 'REFRESH_INCIDENTS_ERROR';

export const FETCH_INCIDENT_NOTES_REQUESTED = 'FETCH_INCIDENT_NOTES_REQUESTED';
export const FETCH_INCIDENT_NOTES_COMPLETED = 'FETCH_INCIDENT_NOTES_COMPLETED';
export const FETCH_INCIDENT_NOTES_ERROR = 'FETCH_INCIDENT_NOTES_ERROR';

export const FETCH_ALL_INCIDENT_NOTES_REQUESTED = 'FETCH_ALL_INCIDENT_NOTES_REQUESTED';
export const FETCH_ALL_INCIDENT_NOTES_COMPLETED = 'FETCH_ALL_INCIDENT_NOTES_COMPLETED';
export const FETCH_ALL_INCIDENT_NOTES_ERROR = 'FETCH_ALL_INCIDENT_NOTES_ERROR';

export const FETCH_ALL_INCIDENT_ALERTS_REQUESTED = 'FETCH_ALL_INCIDENT_ALERTS_REQUESTED';
export const FETCH_ALL_INCIDENT_ALERTS_COMPLETED = 'FETCH_ALL_INCIDENT_ALERTS_COMPLETED';
export const FETCH_ALL_INCIDENT_ALERTS_ERROR = 'FETCH_ALL_INCIDENT_ALERTS_ERROR';

export const UPDATE_INCIDENTS_LIST = 'UPDATE_INCIDENTS_LIST';
export const UPDATE_INCIDENTS_LIST_COMPLETED = 'UPDATE_INCIDENTS_LIST_COMPLETED';
export const UPDATE_INCIDENTS_LIST_ERROR = 'UPDATE_INCIDENTS_LIST_ERROR';

export const FILTER_INCIDENTS_LIST_BY_PRIORITY = 'FILTER_INCIDENTS_LIST_BY_PRIORITY';
export const FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED = 'FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED';
export const FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR = 'FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR';

export const FILTER_INCIDENTS_LIST_BY_STATUS = 'FILTER_INCIDENTS_LIST_BY_STATUS';
export const FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED = 'FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED';
export const FILTER_INCIDENTS_LIST_BY_STATUS_ERROR = 'FILTER_INCIDENTS_LIST_BY_STATUS_ERROR';

export const FILTER_INCIDENTS_LIST_BY_URGENCY = 'FILTER_INCIDENTS_LIST_BY_URGENCY';
export const FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED = 'FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED';
export const FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR = 'FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR';

export const FILTER_INCIDENTS_LIST_BY_TEAM = 'FILTER_INCIDENTS_LIST_BY_TEAM';
export const FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED = 'FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED';
export const FILTER_INCIDENTS_LIST_BY_TEAM_ERROR = 'FILTER_INCIDENTS_LIST_BY_TEAM_ERROR';

export const FILTER_INCIDENTS_LIST_BY_SERVICE = 'FILTER_INCIDENTS_LIST_BY_SERVICE';
export const FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED = 'FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED';
export const FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR = 'FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR';

export const FILTER_INCIDENTS_LIST_BY_QUERY = 'FILTER_INCIDENTS_LIST_BY_QUERY';
export const FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED = 'FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED';
export const FILTER_INCIDENTS_LIST_BY_QUERY_ERROR = 'FILTER_INCIDENTS_LIST_BY_QUERY_ERROR';

// Define Actions
export const getIncidentsAsync = () => ({
  type: FETCH_INCIDENTS_REQUESTED,
});

export const refreshIncidentsAsync = () => ({
  type: REFRESH_INCIDENTS_REQUESTED,
});

export const getIncidentNotesAsync = (incidentId) => ({
  type: FETCH_INCIDENT_NOTES_REQUESTED,
  incidentId,
});

export const getAllIncidentNotesAsync = () => ({
  type: FETCH_ALL_INCIDENT_NOTES_REQUESTED,
});

export const getAllIncidentAlertsAsync = () => ({
  type: FETCH_ALL_INCIDENT_ALERTS_REQUESTED,
});

export const updateIncidentsListAsync = (addList = [], updateList = [], removeList = []) => ({
  type: UPDATE_INCIDENTS_LIST,
  addList,
  updateList,
  removeList,
});

export const filterIncidentsByPriority = (incidentPriority = []) => ({
  type: FILTER_INCIDENTS_LIST_BY_PRIORITY,
  incidentPriority,
});

export const filterIncidentsByStatus = (incidentStatus = []) => ({
  type: FILTER_INCIDENTS_LIST_BY_PRIORITY,
  incidentStatus,
});

export const filterIncidentsByUrgency = (incidentUrgency = []) => ({
  type: FILTER_INCIDENTS_LIST_BY_URGENCY,
  incidentUrgency,
});

export const filterIncidentsByTeam = (teamIds = []) => ({
  type: FILTER_INCIDENTS_LIST_BY_TEAM,
  teamIds,
});

export const filterIncidentsByService = (serviceIds = []) => ({
  type: FILTER_INCIDENTS_LIST_BY_SERVICE,
  serviceIds,
});

export const filterIncidentsByQuery = (searchQuery = '') => ({
  type: FILTER_INCIDENTS_LIST_BY_QUERY,
  searchQuery,
});
