import {
  expectSaga,
} from 'redux-saga-test-plan';

import {
  faker,
} from '@faker-js/faker';

import {
  MAX_RATE_LIMIT_LOWER,
  MAX_RATE_LIMIT_UPPER,
  REFRESH_INTERVAL_LOWER,
  REFRESH_INTERVAL_UPPER,
} from 'src/config/constants';

import settings from './reducers';
import {
  SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED,
  SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED,
  SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED,
  SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED,
  SET_MAX_RATE_LIMIT_REQUESTED,
  SET_MAX_RATE_LIMIT_COMPLETED,
  SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED,
  SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED,
  SET_AUTO_REFRESH_INTERVAL_REQUESTED,
  SET_AUTO_REFRESH_INTERVAL_COMPLETED,
  SET_DARK_MODE_REQUESTED,
  SET_DARK_MODE_COMPLETED,
  SET_RELATIVE_DATES_REQUESTED,
  SET_RELATIVE_DATES_COMPLETED,
} from './actions';
import {
  setDefaultSinceDateTenor,
  setAlertCustomDetailColumns,
  setMaxRateLimit,
  setAutoAcceptIncidentsQuery,
  setAutoRefreshInterval,
  setDarkMode,
  setRelativeDates,
} from './sagas';

describe('Sagas: Settings', () => {
  it('setDefaultSinceDateTenor', () => {
    const tenor = '1M';
    return expectSaga(setDefaultSinceDateTenor)
      .withReducer(settings)
      .dispatch({
        type: SET_DEFAULT_SINCE_DATE_TENOR_REQUESTED,
        defaultSinceDateTenor: tenor,
      })
      .put({
        type: SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED,
        defaultSinceDateTenor: tenor,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: tenor,
        maxRateLimit: 200,
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval: 5,
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
        showIncidentAlertsModalForIncidentId: null,
        darkMode: false,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: false,
        status: SET_DEFAULT_SINCE_DATE_TENOR_COMPLETED,
      })
      .silentRun();
  });
  it('setAlertCustomDetailColumns', () => {
    const alertCustomDetailFields = [
      {
        label: faker.git.branch(),
        value: faker.git.branch(),
        columnType: 'alert',
        Header: 'Environment',
        accessorPath: 'details.env',
        aggregator: null,
      },
    ];
    return expectSaga(setAlertCustomDetailColumns)
      .withReducer(settings)
      .dispatch({
        type: SET_ALERT_CUSTOM_DETAIL_COLUMNS_REQUESTED,
        alertCustomDetailFields,
      })
      .put({
        type: SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED,
        alertCustomDetailFields,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit: 200,
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval: 5,
        alertCustomDetailFields,
        showIncidentAlertsModalForIncidentId: null,
        darkMode: false,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: false,
        status: SET_ALERT_CUSTOM_DETAIL_COLUMNS_COMPLETED,
      })
      .silentRun();
  });
  it('setMaxRateLimit', () => {
    const maxRateLimit = faker.number.int({
      min: MAX_RATE_LIMIT_LOWER,
      max: MAX_RATE_LIMIT_UPPER,
    });
    return expectSaga(setMaxRateLimit)
      .withReducer(settings)
      .dispatch({
        type: SET_MAX_RATE_LIMIT_REQUESTED,
        maxRateLimit,
      })
      .put({
        type: SET_MAX_RATE_LIMIT_COMPLETED,
        maxRateLimit,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit,
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval: 5,
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
        showIncidentAlertsModalForIncidentId: null,
        darkMode: false,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: false,
        status: SET_MAX_RATE_LIMIT_COMPLETED,
      })
      .silentRun();
  });
  it('setAutoAcceptIncidentsQuery', () => {
    const autoAcceptIncidentsQuery = true;
    return expectSaga(setAutoAcceptIncidentsQuery)
      .withReducer(settings)
      .dispatch({
        type: SET_AUTO_ACCEPT_INCIDENTS_QUERY_REQUESTED,
        autoAcceptIncidentsQuery,
      })
      .put({
        type: SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED,
        autoAcceptIncidentsQuery,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit: 200,
        autoAcceptIncidentsQuery,
        autoRefreshInterval: 5,
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
        showIncidentAlertsModalForIncidentId: null,
        darkMode: false,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: false,
        status: SET_AUTO_ACCEPT_INCIDENTS_QUERY_COMPLETED,
      })
      .silentRun();
  });
  it('setAutoRefreshInterval', () => {
    const autoRefreshInterval = faker.number.int({
      min: REFRESH_INTERVAL_LOWER,
      max: REFRESH_INTERVAL_UPPER,
    });
    return expectSaga(setAutoRefreshInterval)
      .withReducer(settings)
      .dispatch({
        type: SET_AUTO_REFRESH_INTERVAL_REQUESTED,
        autoRefreshInterval,
      })
      .put({
        type: SET_AUTO_REFRESH_INTERVAL_COMPLETED,
        autoRefreshInterval,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit: 200,
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval,
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
        showIncidentAlertsModalForIncidentId: null,
        darkMode: false,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: false,
        status: SET_AUTO_REFRESH_INTERVAL_COMPLETED,
      })
      .silentRun();
  });
  it('setDarkMode', () => {
    const darkMode = true;
    return expectSaga(setDarkMode)
      .withReducer(settings)
      .dispatch({
        type: SET_DARK_MODE_REQUESTED,
        darkMode,
      })
      .put({
        type: SET_DARK_MODE_COMPLETED,
        darkMode,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit: 200,
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval: 5,
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
        showIncidentAlertsModalForIncidentId: null,
        darkMode: true,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: false,
        status: SET_DARK_MODE_COMPLETED,
      })
      .silentRun();
  });
  it('setRelativeDates', () => {
    const relativeDates = true;
    return expectSaga(setRelativeDates)
      .withReducer(settings)
      .dispatch({
        type: SET_RELATIVE_DATES_REQUESTED,
        relativeDates,
      })
      .put({
        type: SET_RELATIVE_DATES_COMPLETED,
        relativeDates,
      })
      .hasFinalState({
        displaySettingsModal: false,
        displayLoadSavePresetsModal: false,
        displayColumnsModal: false,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit: 200,
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval: 5,
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
        showIncidentAlertsModalForIncidentId: null,
        darkMode: false,
        searchAllCustomDetails: false,
        fuzzySearch: false,
        respondersInEpFilter: false,
        relativeDates: true,
        status: SET_RELATIVE_DATES_COMPLETED,
      })
      .silentRun();
  });
});
