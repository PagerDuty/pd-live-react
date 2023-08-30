import {
  produce,
} from 'immer';

import {
  SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED,
  SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED,
  SAVE_INCIDENT_TABLE_SETTINGS_ERROR,
  UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED,
  UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED,
  UPDATE_INCIDENT_TABLE_STATE_REQUESTED,
  UPDATE_INCIDENT_TABLE_STATE_COMPLETED,
  SELECT_INCIDENT_TABLE_ROWS_REQUESTED,
  SELECT_INCIDENT_TABLE_ROWS_COMPLETED,
} from './actions';

const defaultColumns = [
  { Header: '#', width: 60, columnType: 'incident' },
  { Header: 'Status', width: 100, columnType: 'incident' },
  { Header: 'Priority', width: 90, columnType: 'incident' },
  { Header: 'Title', width: 400, columnType: 'incident' },
  { Header: 'Assignees', width: 160, columnType: 'incident' },
  { Header: 'Created At', width: 180, columnType: 'incident' },
  { Header: 'Service', width: 300, columnType: 'incident' },
  { Header: 'Latest Note', width: 200, columnType: 'incident' },
];

const incidentTable = produce(
  (draft, action) => {
    switch (action.type) {
      case SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED:
        draft.status = SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED;
        break;

      case SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED:
        draft.status = SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED;
        break;

      case SAVE_INCIDENT_TABLE_SETTINGS_ERROR:
        draft.error = action.message;
        draft.status = SAVE_INCIDENT_TABLE_SETTINGS_ERROR;
        break;

      case UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED:
        draft.status = UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED;
        break;

      case UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED:
        draft.incidentTableColumns = action.incidentTableColumns;
        draft.status = UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED;
        break;

      case UPDATE_INCIDENT_TABLE_STATE_REQUESTED:
        draft.status = UPDATE_INCIDENT_TABLE_STATE_REQUESTED;
        break;

      case UPDATE_INCIDENT_TABLE_STATE_COMPLETED:
        draft.incidentTableState = action.incidentTableState;
        draft.status = UPDATE_INCIDENT_TABLE_STATE_COMPLETED;
        break;

      case SELECT_INCIDENT_TABLE_ROWS_REQUESTED:
        draft.status = SELECT_INCIDENT_TABLE_ROWS_REQUESTED;
        break;

      case SELECT_INCIDENT_TABLE_ROWS_COMPLETED:
        draft.allSelected = action.allSelected;
        draft.selectedCount = action.selectedCount;
        draft.selectedRows = action.selectedRows;
        draft.status = SELECT_INCIDENT_TABLE_ROWS_COMPLETED;
        break;

      default:
        break;
    }
  },
  {
    incidentTableState: {
      filters: [],
    },
    incidentTableColumns: defaultColumns,
    allSelected: false,
    selectedCount: 0,
    selectedRows: [],
    status: null,
    fetchingData: false,
    error: null,
  },
);

export default incidentTable;
