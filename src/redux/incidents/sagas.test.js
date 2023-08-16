import {
  select,
} from 'redux-saga/effects';
import {
  expectSaga,
} from 'redux-saga-test-plan';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import selectIncidentTable from 'src/redux/incident_table/selectors';

import {
  FILTER_INCIDENTS_LIST_BY_QUERY,
  FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
} from './actions';

import incidents from './reducers';
import selectIncidents from './selectors';
import {
  filterIncidentsByQuery,
} from './sagas';

describe('Sagas: Incidents', () => {
  const mockIncidents = generateMockIncidents(10);

  it('filterIncidentsByQuery: Empty Search', () => expectSaga(filterIncidentsByQuery)
    .withReducer(incidents)
    .provide([
      [select(selectIncidents), { incidents: mockIncidents, filteredIncidentsByQuery: [] }],
      [select(selectIncidentTable), { incidentTableColumns: [] }],
    ])
    .dispatch({
      type: FILTER_INCIDENTS_LIST_BY_QUERY,
      searchQuery: '',
    })
    .put({
      type: FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
      filteredIncidentsByQuery: mockIncidents,
    })
    .silentRun()
    .then((result) => {
      expect(result.storeState.status).toEqual(FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED);
      expect(result.storeState.filteredIncidentsByQuery).toEqual(mockIncidents);
    }));

  it('filterIncidentsByQuery: Exact Incident Match', () => {
    const mockIncident = mockIncidents[0];
    const expectedIncidentResult = [mockIncident];
    return expectSaga(filterIncidentsByQuery)
      .withReducer(incidents)
      .provide([
        [select(selectIncidents), { incidents: mockIncidents, filteredIncidentsByQuery: [] }],
        [select(selectIncidentTable), { incidentTableColumns: [] }],
      ])
      .dispatch({
        type: FILTER_INCIDENTS_LIST_BY_QUERY,
        searchQuery: mockIncident.title,
      })
      .put({
        type: FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
        filteredIncidentsByQuery: expectedIncidentResult,
      })
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED);
        expect(result.storeState.filteredIncidentsByQuery).toEqual(expectedIncidentResult);
      });
  });

  it('filterIncidentsByQuery: Search by Alert Custom Detail Field', () => {
    const mockIncident = mockIncidents[0];
    const customField = 'some obsecure field';
    const customFieldValue = mockIncident.alerts[0].body.cef_details.details[customField];
    const expectedIncidentResult = [mockIncident];
    return expectSaga(filterIncidentsByQuery)
      .withReducer(incidents)
      .provide([
        [select(selectIncidents), { incidents: mockIncidents, filteredIncidentsByQuery: [] }],
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
      ])
      .dispatch({
        type: FILTER_INCIDENTS_LIST_BY_QUERY,
        searchQuery: customFieldValue,
      })
      .put({
        type: FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
        filteredIncidentsByQuery: expectedIncidentResult,
      })
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED);
        expect(result.storeState.filteredIncidentsByQuery).toEqual(expectedIncidentResult);
      });
  });
});
