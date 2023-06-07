import produce from 'immer';

import {
  UPDATE_INCIDENT_REDUCER_STATUS, UPDATE_INCIDENT_LAST_FETCH_DATE,
} from 'util/incidents';

import {
  FETCH_INCIDENTS_REQUESTED,
  FETCH_INCIDENTS_COMPLETED,
  FETCH_INCIDENTS_ERROR,
  // REFRESH_INCIDENTS_REQUESTED,
  // REFRESH_INCIDENTS_COMPLETED,
  // REFRESH_INCIDENTS_ERROR,
  FETCH_INCIDENT_ALERTS_REQUESTED,
  FETCH_INCIDENT_ALERTS_COMPLETED,
  FETCH_INCIDENT_ALERTS_ERROR,
  FETCH_INCIDENT_NOTES_REQUESTED,
  FETCH_INCIDENT_NOTES_COMPLETED,
  FETCH_INCIDENT_NOTES_ERROR,
  // UPDATE_INCIDENTS_LIST,
  // UPDATE_INCIDENTS_LIST_COMPLETED,
  // UPDATE_INCIDENTS_LIST_ERROR,
  PROCESS_LOG_ENTRIES,
  PROCESS_LOG_ENTRIES_COMPLETED,
  PROCESS_LOG_ENTRIES_ERROR,
  UPDATE_INCIDENTS,
  UPDATE_INCIDENTS_COMPLETED,
  UPDATE_INCIDENTS_ERROR,
  UPDATE_INCIDENT_ALERTS,
  UPDATE_INCIDENT_ALERTS_COMPLETED,
  UPDATE_INCIDENT_ALERTS_ERROR,
  UPDATE_INCIDENT_NOTES,
  UPDATE_INCIDENT_NOTES_COMPLETED,
  UPDATE_INCIDENT_NOTES_ERROR,
  FILTER_INCIDENTS_LIST,
  FILTER_INCIDENTS_LIST_COMPLETED,
  FILTER_INCIDENTS_LIST_ERROR,
  FILTER_INCIDENTS_LIST_BY_PRIORITY,
  FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR,
  FILTER_INCIDENTS_LIST_BY_STATUS,
  FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_STATUS_ERROR,
  FILTER_INCIDENTS_LIST_BY_URGENCY,
  FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR,
  FILTER_INCIDENTS_LIST_BY_TEAM,
  FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_TEAM_ERROR,
  FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY,
  FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_ERROR,
  FILTER_INCIDENTS_LIST_BY_SERVICE,
  FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR,
  FILTER_INCIDENTS_LIST_BY_USER,
  FILTER_INCIDENTS_LIST_BY_USER_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_USER_ERROR,
  FILTER_INCIDENTS_LIST_BY_QUERY,
  FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_QUERY_ERROR,
} from './actions';

const incidents = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_INCIDENTS_REQUESTED:
        draft.fetchingIncidents = true;
        draft.status = FETCH_INCIDENTS_REQUESTED;
        break;

      case FETCH_INCIDENTS_COMPLETED:
        draft.fetchingIncidents = false;
        draft.status = FETCH_INCIDENTS_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FETCH_INCIDENTS_ERROR:
        draft.fetchingIncidents = false;
        draft.status = FETCH_INCIDENTS_ERROR;
        draft.error = action.message;
        break;

        // case REFRESH_INCIDENTS_REQUESTED:
        //   draft.refreshingIncidents = true;
        //   draft.status = REFRESH_INCIDENTS_REQUESTED;
        //   break;

        // case REFRESH_INCIDENTS_COMPLETED:
        //   draft.refreshingIncidents = false;
        //   draft.status = REFRESH_INCIDENTS_COMPLETED;
        //   draft.incidents = action.incidents;
        //   break;

        // case REFRESH_INCIDENTS_ERROR:
        //   draft.refreshingIncidents = false;
        //   draft.status = REFRESH_INCIDENTS_ERROR;
        //   draft.error = action.message;
        //   break;

        // case FETCH_INCIDENT_NOTES_REQUESTED:
        //   draft.fetchingData = true;
        //   draft.fetchingIncidentNotes = true;
        //   draft.status = FETCH_INCIDENT_NOTES_REQUESTED;
        //   draft.incidentId = action.incidentId;
        //   break;

        // case FETCH_INCIDENT_NOTES_COMPLETED:
        //   draft.fetchingData = false;
        //   draft.fetchingIncidentNotes = false;
        //   draft.status = FETCH_INCIDENT_NOTES_COMPLETED;
        //   draft.incidents = action.incidents;
        //   break;

        // case FETCH_INCIDENT_NOTES_ERROR:
        //   draft.fetchingData = false;
        //   draft.fetchingIncidentNotes = false;
        //   draft.status = FETCH_INCIDENT_NOTES_ERROR;
        //   draft.error = action.message;
        //   break;

        // case FETCH_ALL_INCIDENT_NOTES_REQUESTED:
        //   draft.fetchingData = true;
        //   draft.fetchingIncidentNotes = true;
        //   draft.status = FETCH_ALL_INCIDENT_NOTES_REQUESTED;
        //   break;

        // case FETCH_ALL_INCIDENT_NOTES_COMPLETED:
        //   draft.fetchingData = false;
        //   draft.fetchingIncidentNotes = false;
        //   draft.status = FETCH_ALL_INCIDENT_NOTES_COMPLETED;
        //   draft.incidents = action.incidents;
        //   break;

        // case FETCH_ALL_INCIDENT_NOTES_ERROR:
        //   draft.fetchingData = false;
        //   draft.fetchingIncidentNotes = false;
        //   draft.status = FETCH_ALL_INCIDENT_NOTES_ERROR;
        //   draft.error = action.message;
        //   break;

      case FETCH_INCIDENT_ALERTS_REQUESTED:
        draft.incidentAlerts[action.incidentId] = {
          status: 'fetching',
        };
        draft.incidentAlertsCalls += 1;
        draft.status = FETCH_INCIDENT_ALERTS_REQUESTED;
        break;

      case FETCH_INCIDENT_ALERTS_COMPLETED:
        draft.incidentAlerts[action.incidentId] = action.alerts;
        draft.status = FETCH_INCIDENT_ALERTS_COMPLETED;
        break;

      case FETCH_INCIDENT_ALERTS_ERROR:
        draft.incidentAlerts[action.incidentId] = {
          status: 'error',
          error: action.message,
        };
        draft.status = FETCH_INCIDENT_ALERTS_ERROR;
        break;

      case FETCH_INCIDENT_NOTES_REQUESTED:
        draft.incidentNotes[action.incidentId] = {
          status: 'fetching',
        };
        draft.status = FETCH_INCIDENT_NOTES_REQUESTED;
        break;

      case FETCH_INCIDENT_NOTES_COMPLETED:
        draft.incidentNotes[action.incidentId] = action.notes;
        draft.status = FETCH_INCIDENT_NOTES_COMPLETED;
        break;

      case FETCH_INCIDENT_NOTES_ERROR:
        draft.incidentNotes[action.incidentId] = {
          status: 'error',
          error: action.message,
        };
        draft.status = FETCH_INCIDENT_NOTES_ERROR;
        break;

        // case UPDATE_INCIDENTS_LIST:
        //   draft.fetchingData = false;
        //   draft.status = UPDATE_INCIDENTS_LIST;
        //   break;

        // case UPDATE_INCIDENTS_LIST_COMPLETED:
        //   draft.fetchingData = false;
        //   draft.status = UPDATE_INCIDENTS_LIST_COMPLETED;
        //   draft.incidents = action.incidents;
        //   break;

        // case UPDATE_INCIDENTS_LIST_ERROR:
        //   draft.fetchingData = false;
        //   draft.status = UPDATE_INCIDENTS_LIST_ERROR;
        //   draft.error = action.message;
        //   break;

      case PROCESS_LOG_ENTRIES:
        draft.status = PROCESS_LOG_ENTRIES;
        break;

      case PROCESS_LOG_ENTRIES_COMPLETED:
        if (action.incidentInsertList.length > 0) {
          draft.incidents = draft.incidents
            .concat(action.incidentInsertList)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        for (let i = 0; i < draft.incidents.length; i++) {
          if (action.incidentUpdatesMap[draft.incidents[i].id]) {
            draft.incidents[i] = action.incidentUpdatesMap[draft.incidents[i].id];
          }
        }
        for (let i = 0; i < Object.keys(action.incidentAlertsMap).length; i++) {
          const incidentId = Object.keys(action.incidentAlertsMap)[i];
          if (!draft.incidentAlerts[incidentId]) {
            draft.incidentAlerts[incidentId] = [];
          }
          draft.incidentAlerts[incidentId] = draft.incidentAlerts[incidentId]
            .concat(action.incidentAlertsMap[incidentId]);
        }
        for (let i = 0; i < Object.keys(action.incidentNotesMap).length; i++) {
          const incidentId = Object.keys(action.incidentNotesMap)[i];
          if (!draft.incidentNotes[incidentId]) {
            draft.incidentNotes[incidentId] = [];
          }
          draft.incidentNotes[incidentId] = draft.incidentNotes[incidentId]
            .concat(action.incidentNotesMap[incidentId]);
        }
        draft.status = PROCESS_LOG_ENTRIES_COMPLETED;
        break;

      case PROCESS_LOG_ENTRIES_ERROR:
        draft.status = PROCESS_LOG_ENTRIES_ERROR;
        draft.error = action.message;
        break;

      case UPDATE_INCIDENTS:
        draft.status = UPDATE_INCIDENTS;
        break;

      case UPDATE_INCIDENTS_COMPLETED:
        /* eslint-disable no-param-reassign, no-case-declarations */
        const updatedIncidentsMapById = action.updatedIncidents.reduce(
          (map, incident) => {
            map[incident.id] = incident;
            return map;
          },
          {},
        );
        /* eslint-enable no-param-reassign, no-case-declarations */
        Object.keys(updatedIncidentsMapById).forEach((incidentId) => {
          const idx = draft.incidents.findIndex((incident) => incident.id === incidentId);
          if (idx !== -1) {
            draft.incidents[idx] = {
              ...draft.incidents[idx],
              ...updatedIncidentsMapById[incidentId],
            };
          }
        });
        draft.status = UPDATE_INCIDENTS_COMPLETED;
        break;

      case UPDATE_INCIDENTS_ERROR:
        draft.status = UPDATE_INCIDENTS_ERROR;
        draft.error = action.message;
        break;

      case UPDATE_INCIDENT_ALERTS:
        draft.status = UPDATE_INCIDENT_ALERTS;
        break;

      case UPDATE_INCIDENT_ALERTS_COMPLETED:
        if (action.incidentId === 'CLEAR_ALL') {
          draft.incidentAlerts = {};
        } else {
          draft.incidentAlerts[action.incidentId] = action.alerts;
        }
        draft.status = UPDATE_INCIDENT_ALERTS_COMPLETED;
        break;

      case UPDATE_INCIDENT_ALERTS_ERROR:
        draft.status = UPDATE_INCIDENT_ALERTS_ERROR;
        draft.error = action.message;
        break;

      case UPDATE_INCIDENT_NOTES:
        draft.status = UPDATE_INCIDENT_NOTES;
        break;

      case UPDATE_INCIDENT_NOTES_COMPLETED:
        if (action.incidentId === 'CLEAR_ALL') {
          draft.incidentNotes = {};
        } else {
          draft.incidentNotes[action.incidentId] = action.notes;
        }
        draft.status = UPDATE_INCIDENT_NOTES_COMPLETED;
        break;

      case UPDATE_INCIDENT_NOTES_ERROR:
        draft.status = UPDATE_INCIDENT_NOTES_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST;
        break;

      case FILTER_INCIDENTS_LIST_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_COMPLETED;
        draft.filteredIncidentsByQuery = action.filteredIncidentsByQuery;
        break;

      case FILTER_INCIDENTS_LIST_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_PRIORITY:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_PRIORITY;
        break;

      case FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_STATUS:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_STATUS;
        break;

      case FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_STATUS_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_STATUS_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_URGENCY:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_URGENCY;
        break;

      case FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_TEAM:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_TEAM;
        break;

      case FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_TEAM_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_TEAM_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY;
        break;

      case FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_SERVICE:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_SERVICE;
        break;

      case FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_USER:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_USER;
        break;

      case FILTER_INCIDENTS_LIST_BY_USER_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_USER_COMPLETED;
        draft.incidents = action.incidents;
        break;

      case FILTER_INCIDENTS_LIST_BY_USER_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_USER_ERROR;
        draft.error = action.message;
        break;

      case FILTER_INCIDENTS_LIST_BY_QUERY:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_QUERY;
        break;

      case FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED;
        draft.filteredIncidentsByQuery = action.filteredIncidentsByQuery;
        break;

      case FILTER_INCIDENTS_LIST_BY_QUERY_ERROR:
        draft.fetchingData = false;
        draft.status = FILTER_INCIDENTS_LIST_BY_QUERY_ERROR;
        draft.error = action.message;
        break;

      case UPDATE_INCIDENT_REDUCER_STATUS:
        draft.status = UPDATE_INCIDENT_REDUCER_STATUS;
        draft.fetchingData = action.fetchingData ? action.fetchingData : false;
        draft.fetchingIncidents = action.fetchingIncidents ? action.fetchingIncidents : false;
        draft.fetchingIncidentNotes = action.fetchingIncidentNotes
          ? action.fetchingIncidentNotes
          : false;
        draft.fetchingIncidentAlerts = action.fetchingIncidentAlerts
          ? action.fetchingIncidentAlerts
          : false;
        draft.refreshingIncidents = action.refreshingIncidents ? action.refreshingIncidents : false;
        break;

      case UPDATE_INCIDENT_LAST_FETCH_DATE:
        draft.lastFetchDate = new Date(Date.now() - 1000);
        break;

      default:
        break;
    }
  },
  {
    incidents: [],
    incidentAlerts: {},
    incidentAlertsCalls: 0,
    incidentNotes: {},
    filteredIncidentsByQuery: [],
    status: '',
    fetchingData: false,
    fetchingIncidents: false,
    fetchingIncidentNotes: false,
    fetchingIncidentAlerts: false,
    // refreshingIncidents: false,
    lastFetchDate: new Date(),
    error: null,
  },
);

export default incidents;
