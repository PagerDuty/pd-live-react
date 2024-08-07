/* eslint-disable import/no-cycle */

import {
  put, select, takeLatest,
} from 'redux-saga/effects';

import {
  persistor,
} from 'src/redux/store';

import {
  resetLimiterWithRateLimit,
} from 'src/util/pd-api-wrapper';

import {
  FILTER_INCIDENTS_LIST,
} from 'src/redux/incidents/actions';

import {
  TOGGLE_SETTINGS_REQUESTED,
  TOGGLE_SETTINGS_COMPLETED,
  TOGGLE_LOAD_SAVE_PRESETS_REQUESTED,
  TOGGLE_LOAD_SAVE_PRESETS_COMPLETED,
  TOGGLE_COLUMNS_REQUESTED,
  TOGGLE_COLUMNS_COMPLETED,
  SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED,
  SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED,
  SET_SEARCH_ALL_CUSTOM_DETAILS_REQUESTED,
  SET_SEARCH_ALL_CUSTOM_DETAILS_COMPLETED,
  SET_FUZZY_SEARCH_REQUESTED,
  SET_FUZZY_SEARCH_COMPLETED,
  SET_RESPONDERS_IN_EP_FILTER_REQUESTED,
  SET_RESPONDERS_IN_EP_FILTER_COMPLETED,
  SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED,
  SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED,
  SET_COMPUTED_COLUMNS_REQUESTED,
  SET_COMPUTED_COLUMNS_COMPLETED,
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
  SET_RELATIVE_DATES_REQUESTED,
  SET_RELATIVE_DATES_COMPLETED,
  SET_SHOW_INCIDENT_ALERTS_MODAL_FOR_INCIDENT_ID_REQUESTED,
  SET_SHOW_INCIDENT_ALERTS_MODAL_FOR_INCIDENT_ID_COMPLETED,
} from './actions';

import selectSettings from './selectors';

export function* toggleSettingsModal() {
  yield takeLatest(TOGGLE_SETTINGS_REQUESTED, toggleSettingsModalImpl);
}

export function* toggleSettingsModalImpl() {
  const {
    displaySettingsModal,
  } = yield select(selectSettings);
  yield put({
    type: TOGGLE_SETTINGS_COMPLETED,
    displaySettingsModal: !displaySettingsModal,
  });
}

export function* toggleLoadSavePresetsModal() {
  yield takeLatest(TOGGLE_LOAD_SAVE_PRESETS_REQUESTED, toggleLoadSavePresetsModalImpl);
}

export function* toggleLoadSavePresetsModalImpl() {
  const {
    displayLoadSavePresetsModal,
  } = yield select(selectSettings);
  yield put({
    type: TOGGLE_LOAD_SAVE_PRESETS_COMPLETED,
    displayLoadSavePresetsModal: !displayLoadSavePresetsModal,
  });
}

export function* toggleColumnsModal() {
  yield takeLatest(TOGGLE_COLUMNS_REQUESTED, toggleColumnsModalImpl);
}

export function* toggleColumnsModalImpl() {
  const {
    displayColumnsModal,
  } = yield select(selectSettings);
  yield put({
    type: TOGGLE_COLUMNS_COMPLETED,
    displayColumnsModal: !displayColumnsModal,
  });
}

export function* setDefaultSinceDateTenor() {
  yield takeLatest(SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED, setDefaultSinceDateTenorImpl);
}

export function* setDefaultSinceDateTenorImpl(action) {
  const {
    defaultSinceDateTenor,
  } = action;
  yield put({
    type: SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED,
    defaultSinceDateTenor,
  });
}

export function* setSearchAllCustomDetails() {
  yield takeLatest(SET_SEARCH_ALL_CUSTOM_DETAILS_REQUESTED, setSearchAllCustomDetailsImpl);
}

export function* setSearchAllCustomDetailsImpl(action) {
  const {
    searchAllCustomDetails,
  } = action;
  yield put({
    type: SET_SEARCH_ALL_CUSTOM_DETAILS_COMPLETED,
    searchAllCustomDetails,
  });
}

export function* setFuzzySearch() {
  yield takeLatest(SET_FUZZY_SEARCH_REQUESTED, setFuzzySearchImpl);
}

export function* setFuzzySearchImpl(action) {
  const {
    fuzzySearch,
  } = action;
  yield put({
    type: SET_FUZZY_SEARCH_COMPLETED,
    fuzzySearch,
  });
}

export function* setRespondersInEpFilter() {
  yield takeLatest(SET_RESPONDERS_IN_EP_FILTER_REQUESTED, setRespondersInEpFilterImpl);
}

export function* setRespondersInEpFilterImpl(action) {
  const {
    respondersInEpFilter,
  } = action;
  yield put({
    type: SET_RESPONDERS_IN_EP_FILTER_COMPLETED,
    respondersInEpFilter,
  });
  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
}

export function* setAlertCustomDetailColumns() {
  yield takeLatest(SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED, setAlertCustomDetailColumnsImpl);
}

export function* setAlertCustomDetailColumnsImpl(action) {
  const {
    alertCustomDetailFields,
  } = action;
  yield put({
    type: SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED,
    alertCustomDetailFields,
  });
}

export function* setComputedColumns() {
  yield takeLatest(SET_COMPUTED_COLUMNS_REQUESTED, setComputedColumnsImpl);
}

export function* setComputedColumnsImpl(action) {
  const {
    computedFields,
  } = action;
  yield put({
    type: SET_COMPUTED_COLUMNS_COMPLETED,
    computedFields,
  });
}

export function* setShowIncidentAlertsModalForIncidentId() {
  yield takeLatest(
    SET_SHOW_INCIDENT_ALERTS_MODAL_FOR_INCIDENT_ID_REQUESTED,
    setShowIncidentAlertsModalForIncidentIdImpl,
  );
}

export function* setShowIncidentAlertsModalForIncidentIdImpl(action) {
  const {
    incidentId,
  } = action;
  yield put({
    type: SET_SHOW_INCIDENT_ALERTS_MODAL_FOR_INCIDENT_ID_COMPLETED,
    incidentId,
  });
}

export function* setMaxRateLimit() {
  yield takeLatest(SET_MAX_RATE_LIMIT_REQUESTED, setMaxRateLimitImpl);
}

export function* setMaxRateLimitImpl(action) {
  const {
    maxRateLimit,
  } = action;
  resetLimiterWithRateLimit(maxRateLimit);
  yield put({
    type: SET_MAX_RATE_LIMIT_COMPLETED,
    maxRateLimit,
  });
}

export function* setAutoAcceptIncidentsQuery() {
  yield takeLatest(SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED, setAutoAcceptIncidentsQueryImpl);
}

export function* setAutoAcceptIncidentsQueryImpl(action) {
  const {
    autoAcceptIncidentsQuery,
  } = action;
  yield put({
    type: SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED,
    autoAcceptIncidentsQuery,
  });
}

export function* setAutoRefreshInterval() {
  yield takeLatest(SET_AUTO_REFRESH_INTERVAL_REQUESTED, setAutoRefreshIntervalImpl);
}

export function* setAutoRefreshIntervalImpl(action) {
  const {
    autoRefreshInterval,
  } = action;
  yield put({
    type: SET_AUTO_REFRESH_INTERVAL_COMPLETED,
    autoRefreshInterval,
  });
}

export function* clearLocalCache() {
  yield takeLatest(CLEAR_LOCAL_CACHE_REQUESTED, clearLocalCacheImpl);
}

export function* clearLocalCacheImpl() {
  // Ref: https://github.com/wwayne/redux-reset/issues/7#issuecomment-496404924
  yield put({
    type: 'RESET',
  });
  yield persistor.pause();
  yield persistor.flush().then(() => persistor.purge());
  yield persistor.persist();
  localStorage.clear();
  sessionStorage.clear();
  yield put({
    type: CLEAR_LOCAL_CACHE_COMPLETED,
  });
}

export function* setDarkMode() {
  yield takeLatest(SET_DARK_MODE_REQUESTED, setDarkModeImpl);
}

export function* setDarkModeImpl(action) {
  const {
    darkMode,
  } = action;
  yield put({
    type: SET_DARK_MODE_COMPLETED,
    darkMode,
  });
}

export function* setRelativeDates() {
  yield takeLatest(SET_RELATIVE_DATES_REQUESTED, setRelativeDatesImpl);
}

export function* setRelativeDatesImpl(action) {
  const {
    relativeDates,
  } = action;
  yield put({
    type: SET_RELATIVE_DATES_COMPLETED,
    relativeDates,
  });
}
