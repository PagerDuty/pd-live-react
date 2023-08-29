import {
  select,
} from 'redux-saga/effects';
import {
  expectSaga,
} from 'redux-saga-test-plan';

import {
  SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED,
  UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED,
  UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED,
} from './actions';

import incidentTable from './reducers';
import selectIncidentTable from './selectors';
import {
  saveIncidentTableImpl, updateIncidentTableColumns,
} from './sagas';

describe('Sagas: Incident Table', () => {
  const updatedIncidentTableColumns = [
    { Header: '#', width: 60, columnType: 'incident' },
    { Header: 'Status', width: 100, columnType: 'incident' },
  ];
  const persistableColumns = [
    {
      Header: '#',
      accessorPath: undefined,
      width: 80,
      columnType: 'incident',
    },
    {
      Header: 'Status',
      accessorPath: undefined,
      width: 100,
      columnType: 'incident',
    },
  ];

  it('saveIncidentTableImpl', () => expectSaga(saveIncidentTableImpl, { updatedIncidentTableColumns })
    .withReducer(incidentTable)
    .provide([
      [select(selectIncidentTable), { incidentTableColumns: [], incidentTableState: {} }],
    ])
    .silentRun()
    .then((result) => {
      expect(result.storeState.status).toEqual(SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED);
    }));

  it('updateIncidentTableColumns', () => expectSaga(updateIncidentTableColumns)
    .withReducer(incidentTable)
    .dispatch({
      type: UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED,
      incidentTableColumns: persistableColumns,
    })
    .hasFinalState({
      incidentTableState: {
        filters: [],
      },
      incidentTableColumns: persistableColumns,
      allSelected: false,
      selectedCount: 0,
      selectedRows: [],
      status: UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED,
      fetchingData: false,
      error: null,
    })
    .silentRun());
});
