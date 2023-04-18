/* eslint-disable max-len */
// Define Action Types
export const TOGGLE_SETTINGS_REQUESTED = 'TOGGLE_SETTINGS_REQUESTED';
export const TOGGLE_SETTINGS_COMPLETED = 'TOGGLE_SETTINGS_COMPLETED';

export const SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED = 'SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED';
export const SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED = 'SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED';

export const SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED = 'SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED';
export const SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED = 'SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED';

export const SET_MAX_INCIDENTS_LIMIT_REQUESTED = 'SET_MAX_INCIDENTS_LIMIT_REQUESTED';
export const SET_MAX_INCIDENTS_LIMIT_COMPLETED = 'SET_MAX_INCIDENTS_LIMIT_COMPLETED';

export const SET_MAX_RATE_LIMIT_REQUESTED = 'SET_MAX_RATE_LIMIT_REQUESTED';
export const SET_MAX_RATE_LIMIT_COMPLETED = 'SET_MAX_RATE_LIMIT_COMPLETED';

export const SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED = 'SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED';
export const SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED = 'SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED';

export const SET_AUTO_REFRESH_INTERVAL_REQUESTED = 'SET_AUTO_REFRESH_INTERVAL_REQUESTED';
export const SET_AUTO_REFRESH_INTERVAL_COMPLETED = 'SET_AUTO_REFRESH_INTERVAL_COMPLETED';

export const CLEAR_LOCAL_CACHE_REQUESTED = 'CLEAR_LOCAL_CACHE_REQUESTED';
export const CLEAR_LOCAL_CACHE_COMPLETED = 'CLEAR_LOCAL_CACHE_COMPLETED';

export const SET_DARK_MODE_REQUESTED = 'SET_DARK_MODE_REQUESTED';
export const SET_DARK_MODE_COMPLETED = 'SET_DARK_MODE_COMPLETED';

// Define Actions
export const toggleSettingsModal = () => ({
  type: TOGGLE_SETTINGS_REQUESTED,
});

export const setDefaultSinceDateTenor = (defaultSinceDateTenor) => ({
  type: SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED,
  defaultSinceDateTenor,
});

export const setAlertCustomDetailColumns = (alertCustomDetailFields) => ({
  type: SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED,
  alertCustomDetailFields,
});

export const setMaxIncidentsLimit = (maxIncidentsLimit) => ({
  type: SET_MAX_INCIDENTS_LIMIT_REQUESTED,
  maxIncidentsLimit,
});

export const setMaxRateLimit = (maxRateLimit) => ({
  type: SET_MAX_RATE_LIMIT_REQUESTED,
  maxRateLimit,
});

export const setAutoAcceptIncidentsQuery = (autoAcceptIncidentsQuery) => ({
  type: SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED,
  autoAcceptIncidentsQuery,
});

export const setAutoRefreshInterval = (autoRefreshInterval) => ({
  type: SET_AUTO_REFRESH_INTERVAL_REQUESTED,
  autoRefreshInterval,
});

export const clearLocalCache = () => ({
  type: CLEAR_LOCAL_CACHE_REQUESTED,
});

export const setDarkMode = (darkMode) => ({
  type: SET_DARK_MODE_REQUESTED,
  darkMode,
});
