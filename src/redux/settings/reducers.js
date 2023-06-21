import produce from 'immer';

import {
  TOGGLE_SETTINGS_REQUESTED,
  TOGGLE_SETTINGS_COMPLETED,
  TOGGLE_COLUMNS_REQUESTED,
  TOGGLE_COLUMNS_COMPLETED,
  SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED,
  SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED,
  SET_SEARCH_ALL_CUSTOM_DETAILS_REQUESTED,
  SET_SEARCH_ALL_CUSTOM_DETAILS_COMPLETED,
  SET_RESPONDERS_IN_EP_FILTER_REQUESTED,
  SET_RESPONDERS_IN_EP_FILTER_COMPLETED,
  SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED,
  SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED,
  SET_MAX_RATE_LIMIT_REQUESTED,
  SET_MAX_RATE_LIMIT_COMPLETED,
  SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED,
  SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED,
  SET_AUTO_REFRESH_INTERVAL_REQUESTED,
  SET_AUTO_REFRESH_INTERVAL_COMPLETED,
  CLEAR_LOCAL_CACHE_REQUESTED,
  CLEAR_LOCAL_CACHE_COMPLETED,
  SET_DARK_MODE_REQUESTED,
  SET_DARK_MODE_COMPLETED,
  SET_SERVER_SIDE_FILTERING_REQUESTED,
  SET_SERVER_SIDE_FILTERING_COMPLETED,
} from './actions';

const settings = produce(
  (draft, action) => {
    switch (action.type) {
      case TOGGLE_SETTINGS_REQUESTED:
        draft.status = TOGGLE_SETTINGS_REQUESTED;
        break;

      case TOGGLE_SETTINGS_COMPLETED:
        draft.displaySettingsModal = action.displaySettingsModal;
        draft.status = TOGGLE_SETTINGS_COMPLETED;
        break;

      case TOGGLE_COLUMNS_REQUESTED:
        draft.status = TOGGLE_COLUMNS_REQUESTED;
        break;

      case TOGGLE_COLUMNS_COMPLETED:
        draft.displayColumnsModal = action.displayColumnsModal;
        draft.status = TOGGLE_COLUMNS_COMPLETED;
        break;

      case SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED:
        draft.status = SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED;
        break;

      case SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED:
        draft.defaultSinceDateTenor = action.defaultSinceDateTenor;
        draft.status = SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED;
        break;

      case SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED:
        draft.status = SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED;
        break;

      case SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED:
        draft.alertCustomDetailFields = action.alertCustomDetailFields;
        draft.status = SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED;
        break;

      case SET_SEARCH_ALL_CUSTOM_DETAILS_REQUESTED:
        draft.status = SET_SEARCH_ALL_CUSTOM_DETAILS_REQUESTED;
        break;

      case SET_SEARCH_ALL_CUSTOM_DETAILS_COMPLETED:
        draft.searchAllCustomDetails = action.searchAllCustomDetails;
        draft.status = SET_SEARCH_ALL_CUSTOM_DETAILS_COMPLETED;
        break;

      case SET_RESPONDERS_IN_EP_FILTER_REQUESTED:
        draft.status = SET_RESPONDERS_IN_EP_FILTER_REQUESTED;
        break;

      case SET_RESPONDERS_IN_EP_FILTER_COMPLETED:
        draft.respondersInEpFilter = action.respondersInEpFilter;
        draft.status = SET_RESPONDERS_IN_EP_FILTER_COMPLETED;
        break;

      case SET_MAX_RATE_LIMIT_REQUESTED:
        draft.status = SET_MAX_RATE_LIMIT_REQUESTED;
        break;

      case SET_MAX_RATE_LIMIT_COMPLETED:
        draft.maxRateLimit = action.maxRateLimit;
        draft.status = SET_MAX_RATE_LIMIT_COMPLETED;
        break;

      case SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED:
        draft.status = SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED;
        break;

      case SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED:
        draft.autoAcceptIncidentsQuery = action.autoAcceptIncidentsQuery;
        draft.status = SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED;
        break;

      case SET_AUTO_REFRESH_INTERVAL_REQUESTED:
        draft.status = SET_AUTO_REFRESH_INTERVAL_REQUESTED;
        break;

      case SET_AUTO_REFRESH_INTERVAL_COMPLETED:
        draft.autoRefreshInterval = action.autoRefreshInterval;
        draft.status = SET_AUTO_REFRESH_INTERVAL_COMPLETED;
        break;

      case CLEAR_LOCAL_CACHE_REQUESTED:
        draft.status = CLEAR_LOCAL_CACHE_REQUESTED;
        break;

      case CLEAR_LOCAL_CACHE_COMPLETED:
        draft.status = CLEAR_LOCAL_CACHE_COMPLETED;
        break;

      case SET_DARK_MODE_REQUESTED:
        draft.status = SET_DARK_MODE_REQUESTED;
        break;

      case SET_DARK_MODE_COMPLETED:
        draft.darkMode = action.darkMode;
        draft.status = SET_DARK_MODE_COMPLETED;
        break;

      case SET_SERVER_SIDE_FILTERING_REQUESTED:
        draft.status = SET_SERVER_SIDE_FILTERING_REQUESTED;
        break;

      case SET_SERVER_SIDE_FILTERING_COMPLETED:
        draft.serverSideFiltering = action.serverSideFiltering;
        draft.status = SET_SERVER_SIDE_FILTERING_COMPLETED;
        break;

      default:
        break;
    }
  },
  {
    displaySettingsModal: false,
    displayColumnsModal: false,
    defaultSinceDateTenor: '1 Day',
    maxRateLimit: 200,
    autoAcceptIncidentsQuery: true,
    autoRefreshInterval: 5,
    serverSideFiltering: true,
    searchAllCustomDetails: false,
    respondersInEpFilter: false,
    alertCustomDetailFields: [
      {
        label: 'Environment:details.env',
        value: 'Environment:details.env',
        columnType: 'alert',
        Header: 'Environment',
        accessorPath: 'details.env',
        aggregator: null,
      },
    ],
    darkMode: false,
    status: '',
  },
);

export default settings;
