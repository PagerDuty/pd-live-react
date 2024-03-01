import {
  produce,
} from 'immer';

import {
  UPDATE_INCIDENT_REDUCER_STATUS,
  UPDATE_INCIDENT_LAST_FETCH_DATE,
} from 'src/util/incidents';

import {
  FETCH_INCIDENTS_REQUESTED,
  FETCH_INCIDENTS_COMPLETED,
  FETCH_INCIDENTS_ERROR,
  FETCH_ALERTS_FOR_INCIDENTS_REQUESTED,
  FETCH_ALERTS_FOR_INCIDENTS_COMPLETED,
  FETCH_ALERTS_FOR_INCIDENTS_ERROR,
  FETCH_NOTES_FOR_INCIDENTS_REQUESTED,
  FETCH_NOTES_FOR_INCIDENTS_COMPLETED,
  FETCH_NOTES_FOR_INCIDENTS_ERROR,
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
} from './actions';

const uniqOnId = (arr) => {
  const map = new Map();
  arr.forEach((item) => {
    map.set(item.id, item);
  });
  return [...map.values()];
};

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

      case FETCH_ALERTS_FOR_INCIDENTS_REQUESTED:
        if (!(action.isRefetch)) {
          draft.incidentAlerts = {
            ...draft.incidentAlerts,
            // dict with keys as the strings of incident ids array and values as { status: 'fetching' }
            ...action.incidentIds.reduce((acc, incidentId) => {
              // eslint-disable-next-line no-param-reassign
              acc[incidentId] = {
                status: 'fetching',
              };
              return acc;
            }, {}),
          };
        }
        draft.status = FETCH_ALERTS_FOR_INCIDENTS_REQUESTED;
        break;

      case FETCH_ALERTS_FOR_INCIDENTS_COMPLETED:
        Object.entries(action.incidentAlertsMap).forEach(([incidentId, alerts]) => {
          if (draft.incidentAlerts[incidentId] instanceof Array) {
            draft.incidentAlerts[incidentId] = uniqOnId(
              draft.incidentAlerts[incidentId].concat(alerts),
            );
          } else {
            draft.incidentAlerts[incidentId] = alerts;
          }
        });
        draft.status = FETCH_ALERTS_FOR_INCIDENTS_COMPLETED;
        break;

      case FETCH_ALERTS_FOR_INCIDENTS_ERROR:
        draft.incidentAlerts = {
          ...draft.incidentAlerts,
          ...action.incidentIds.reduce((acc, incidentId) => {
            // eslint-disable-next-line no-param-reassign
            acc[incidentId] = {
              status: 'error',
              error: action.message,
            };
            return acc;
          }, {}),
        };
        draft.status = FETCH_ALERTS_FOR_INCIDENTS_ERROR;
        break;

      case FETCH_NOTES_FOR_INCIDENTS_REQUESTED:
        draft.incidentNotes = {
          ...draft.incidentNotes,
          // dict with keys as the strings of incident ids array and values as { status: 'fetching' }
          ...action.incidentIds.reduce((acc, incidentId) => {
            // eslint-disable-next-line no-param-reassign
            acc[incidentId] = {
              status: 'fetching',
            };
            return acc;
          }, {}),
        };
        draft.status = FETCH_NOTES_FOR_INCIDENTS_REQUESTED;
        break;

      case FETCH_NOTES_FOR_INCIDENTS_COMPLETED:
        Object.entries(action.incidentNotesMap).forEach(([incidentId, notes]) => {
          if (draft.incidentNotes[incidentId] instanceof Array) {
            draft.incidentNotes[incidentId] = uniqOnId(
              draft.incidentNotes[incidentId].concat(notes),
            );
          } else {
            draft.incidentNotes[incidentId] = notes;
          }
        });
        draft.status = FETCH_NOTES_FOR_INCIDENTS_COMPLETED;
        break;

      case FETCH_NOTES_FOR_INCIDENTS_ERROR:
        draft.incidentNotes = {
          ...draft.incidentNotes,
          ...action.incidentIds.reduce((acc, incidentId) => {
            // eslint-disable-next-line no-param-reassign
            acc[incidentId] = {
              status: 'error',
              error: action.message,
            };
            return acc;
          }, {}),
        };
        draft.status = FETCH_NOTES_FOR_INCIDENTS_ERROR;
        break;

      case PROCESS_LOG_ENTRIES:
        draft.status = PROCESS_LOG_ENTRIES;
        break;

      case PROCESS_LOG_ENTRIES_COMPLETED:
        if (action.incidentInsertList.length > 0) {
          draft.incidents = draft.incidents
            .concat(action.incidentInsertList)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        for (let i = 0; i < draft.incidents.length; i++) {
          if (action.incidentUpdatesMap[draft.incidents[i].id]) {
            draft.incidents[i] = action.incidentUpdatesMap[draft.incidents[i].id];
          }
        }
        for (let i = 0; i < Object.keys(action.incidentAlertsMap).length; i++) {
          const incidentId = Object.keys(action.incidentAlertsMap)[i];
          if (!(draft.incidentAlerts[incidentId] instanceof Array)) {
            // sometimes it might be undefined which means that incident alerts have not been requested yet
            // or it might be an object with status: 'fetching'
            // this can happen if the incident alerts are being fetched when the incident is created,
            // it can probably also happen if there was a previous error
            // in that case it would be an object with status: 'error'
            // in any case, we want to replace it with an empty array
            // so that we can concat the new alerts in the next step
            draft.incidentAlerts[incidentId] = [];
          }
          draft.incidentAlerts[incidentId] = uniqOnId(
            draft.incidentAlerts[incidentId].concat(action.incidentAlertsMap[incidentId]),
          );
        }
        for (let i = 0; i < Object.keys(action.incidentAlertsUnlinkMap).length; i++) {
          const incidentId = Object.keys(action.incidentAlertsUnlinkMap)[i];
          if (draft.incidentAlerts[incidentId] instanceof Array) {
            const unlinkedAlertIds = action.incidentAlertsUnlinkMap[incidentId].map(
              (alert) => alert.id,
            );
            draft.incidentAlerts[incidentId] = draft.incidentAlerts[incidentId].filter(
              (alert) => !unlinkedAlertIds.includes(alert.id),
            );
          }
        }
        for (let i = 0; i < Object.keys(action.incidentNotesMap).length; i++) {
          const incidentId = Object.keys(action.incidentNotesMap)[i];
          if (!(draft.incidentNotes[incidentId] instanceof Array)) {
            // same as with incident alerts
            draft.incidentNotes[incidentId] = [];
          }
          draft.incidentNotes[incidentId] = draft.incidentNotes[incidentId].concat(
            action.incidentNotesMap[incidentId],
          );
        }
        if (action.incidentLatestLogEntryMap) {
          draft.incidentLatestLogEntries = {
            ...draft.incidentLatestLogEntries,
            ...action.incidentLatestLogEntryMap,
          };
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
        const updatedIncidentsMapById = action.updatedIncidents.reduce((map, incident) => {
          map[incident.id] = incident;
          return map;
        }, {});
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
    incidentLatestLogEntries: {},
    filteredIncidentsByQuery: [],
    status: '',
    fetchingData: false,
    fetchingIncidents: false,
    fetchingIncidentNotes: false,
    fetchingIncidentAlerts: false,
    lastFetchDate: undefined,
    error: null,
  },
);

export default incidents;
