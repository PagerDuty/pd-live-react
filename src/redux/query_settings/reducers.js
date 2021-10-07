import produce from 'immer';
import moment from 'moment';

import {
  TRIGGERED, ACKNOWLEDGED, RESOLVED, HIGH, LOW,
} from 'util/incidents';
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
  UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED,
  UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED,
  UPDATE_SEARCH_QUERY_REQUESTED,
  UPDATE_SEARCH_QUERY_COMPLETED,
} from './actions';

const querySettings = produce(
  (draft, action) => {
    switch (action.type) {
      case TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED:
        draft.status = TOGGLE_DISPLAY_QUERY_SETTINGS_REQUESTED;
        break;

      case TOGGLE_DISPLAY_QUERY_SETTINGS_COMPLETED:
        draft.displayQuerySettings = action.displayQuerySettings;
        draft.status = TOGGLE_DISPLAY_QUERY_SETTINGS_COMPLETED;
        break;

      case UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED:
        draft.status = UPDATE_QUERY_SETTING_SINCE_DATE_REQUESTED;
        break;

      case UPDATE_QUERY_SETTING_SINCE_DATE_COMPLETED:
        draft.sinceDate = action.sinceDate;
        draft.status = UPDATE_QUERY_SETTING_SINCE_DATE_COMPLETED;
        break;

      case UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED:
        draft.status = UPDATE_QUERY_SETTING_INCIDENT_STATUS_REQUESTED;
        break;

      case UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED:
        draft.incidentStatus = action.incidentStatus;
        draft.status = UPDATE_QUERY_SETTING_INCIDENT_STATUS_COMPLETED;
        break;

      case UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED:
        draft.status = UPDATE_QUERY_SETTING_INCIDENT_URGENCY_REQUESTED;
        break;

      case UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED:
        draft.incidentUrgency = action.incidentUrgency;
        draft.status = UPDATE_QUERY_SETTING_INCIDENT_URGENCY_COMPLETED;
        break;

      case UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED:
        draft.status = UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_REQUESTED;
        break;

      case UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_COMPLETED:
        draft.incidentPriority = action.incidentPriority;
        draft.status = UPDATE_QUERY_SETTING_INCIDENT_PRIORITY_COMPLETED;
        break;

      case UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED:
        draft.status = UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED;
        break;

      case UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED:
        draft.teamIds = action.teamIds;
        draft.status = UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED;
        break;

      case UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED:
        draft.status = UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED;
        break;

      case UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED:
        draft.serviceIds = action.serviceIds;
        draft.status = UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED;
        break;

      case UPDATE_SEARCH_QUERY_REQUESTED:
        draft.status = UPDATE_SEARCH_QUERY_REQUESTED;
        break;

      case UPDATE_SEARCH_QUERY_COMPLETED:
        draft.searchQuery = action.searchQuery;
        draft.status = UPDATE_SEARCH_QUERY_COMPLETED;
        break;
      default:
        break;
    }
  },
  {
    displayQuerySettings: true,
    sinceDate: moment().subtract(1, 'days').toDate(),
    untilDate: new Date(),
    incidentStatus: [TRIGGERED, ACKNOWLEDGED],
    incidentUrgency: [HIGH, LOW],
    incidentPriority: [],
    teamIds: [],
    serviceIds: [],
    searchQuery: '',
    status: null,
    fetchingData: false,
    error: null,
  },
);

export default querySettings;
