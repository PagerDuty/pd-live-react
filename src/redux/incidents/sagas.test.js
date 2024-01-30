import {
  select,
} from 'redux-saga/effects';
import {
  expectSaga,
} from 'redux-saga-test-plan';

import {
  ACKNOWLEDGED,
  HIGH,
  LOW,
  RESOLVED,
  TRIGGERED,
} from 'src/util/incidents';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import selectIncidentTable from 'src/redux/incident_table/selectors';
import selectQuerySettings from 'src/redux/query_settings/selectors';
import selectSettings from 'src/redux/settings/selectors';

import {
  FILTER_INCIDENTS_LIST,
  FILTER_INCIDENTS_LIST_COMPLETED,
  FETCH_ALERTS_FOR_INCIDENTS_REQUESTED,
  FETCH_NOTES_FOR_INCIDENTS_REQUESTED,
} from './actions';

import incidents from './reducers';
import selectIncidents from './selectors';
import {
  filterIncidents,
} from './sagas';

const initialQuerySettings = {
  incidentStatus: [TRIGGERED, ACKNOWLEDGED, RESOLVED],
  incidentUrgency: [HIGH, LOW],
  incidentPriority: [],
  teamIds: [],
  escalationPolicyIds: [],
  serviceIds: [],
  userIds: [],
  searchQuery: '',
  status: null,
  fetchingData: false,
  error: null,
};

const initialSettings = {
  displaySettingsModal: false,
  displayLoadSavePresetsModal: false,
  displayColumnsModal: false,
  defaultSinceDateTenor: '1 Day',
  maxRateLimit: 200,
  autoAcceptIncidentsQuery: true,
  autoRefreshInterval: 5,
  searchAllCustomDetails: false,
  fuzzySearch: false,
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
  relativeDates: false,
  status: '',
};

describe('Sagas: Incidents', () => {
  const mockIncidents = generateMockIncidents(10);
  const initialIncidents = {
    incidents: mockIncidents,
    filteredIncidentsByQuery: [],
    incidentAlerts: {},
    incidentNotes: {},
  };
  it('filterIncidents: Empty Search', () => expectSaga(filterIncidents)
    .withReducer(incidents)
    .provide([
      [select(selectIncidents), initialIncidents],
      [select(selectIncidentTable), { incidentTableColumns: [] }],
      [select(selectQuerySettings), initialQuerySettings],
      [select(selectSettings), initialSettings],
    ])
    .dispatch({
      type: FILTER_INCIDENTS_LIST,
    })
    .put.like({
      action: {
        type: FETCH_ALERTS_FOR_INCIDENTS_REQUESTED,
      },
    })
    .put.like({
      action: {
        type: FETCH_NOTES_FOR_INCIDENTS_REQUESTED,
      },
    })
    .put({
      type: FILTER_INCIDENTS_LIST_COMPLETED,
      filteredIncidentsByQuery: mockIncidents,
    })
    .silentRun()
    .then((result) => {
      expect(result.storeState.status).toEqual(FILTER_INCIDENTS_LIST_COMPLETED);
      expect(result.storeState.filteredIncidentsByQuery).toEqual(mockIncidents);
    }));

  it('filterIncidents: Exact Incident Match', () => {
    const mockIncident = mockIncidents[0];
    const expectedIncidentResult = [mockIncident];

    return expectSaga(filterIncidents)
      .withReducer(incidents)
      .provide([
        [select(selectIncidents), initialIncidents],
        [select(selectIncidentTable), { incidentTableColumns: [] }],
        [select(selectQuerySettings), {
          ...initialQuerySettings,
          searchQuery: mockIncident.title,
        }],
        [select(selectSettings), initialSettings],
      ])
      .dispatch({
        type: FILTER_INCIDENTS_LIST,
      })
      .put.like({
        action: {
          type: FETCH_ALERTS_FOR_INCIDENTS_REQUESTED,
        },
      })
      .put.like({
        action: {
          type: FETCH_NOTES_FOR_INCIDENTS_REQUESTED,
        },
      })
      .put({
        type: FILTER_INCIDENTS_LIST_COMPLETED,
        filteredIncidentsByQuery: expectedIncidentResult,
      })
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(FILTER_INCIDENTS_LIST_COMPLETED);
        expect(result.storeState.filteredIncidentsByQuery).toEqual(expectedIncidentResult);
      });
  });

  it('filterIncidents: Search by Alert Custom Detail Field', () => {
    const mockIncident = mockIncidents[0];
    const customField = 'some obsecure field';
    const customFieldValue = mockIncident.alerts[0].body.cef_details.details[customField];
    const expectedIncidentResult = [mockIncident];
    return expectSaga(filterIncidents)
      .withReducer(incidents)
      .provide([
        [select(selectIncidents), {
          ...initialIncidents,
          incidentAlerts: {
            [mockIncident.id]: mockIncident.alerts,
          },
        }],
        [
          select(selectIncidentTable),
          {
            incidentTableColumns: [
              {
                Header: customField,
                accessorPath: `details['${customField}']`,
                width: 150,
                columnType: 'alert',
              },
            ],
          },
        ],
        [select(selectQuerySettings), {
          ...initialQuerySettings,
          searchQuery: customFieldValue,
        }],
        [select(selectSettings), initialSettings],
      ])
      .dispatch({
        type: FILTER_INCIDENTS_LIST,
      })
      .put({
        type: FILTER_INCIDENTS_LIST_COMPLETED,
        filteredIncidentsByQuery: expectedIncidentResult,
      })
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(FILTER_INCIDENTS_LIST_COMPLETED);
        expect(result.storeState.filteredIncidentsByQuery).toEqual(expectedIncidentResult);
      });
  });
});
