import {
  put, takeLatest, select,
} from 'redux-saga/effects';

// TODO: Use column-generator
import {
  getReactTableColumnSchemas,
} from 'config/incident-table-columns';

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

import selectIncidentTable from './selectors';

export function* saveIncidentTable() {
  yield takeLatest(SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED, saveIncidentTableImpl);
}

export function* saveIncidentTableImpl(action) {
  // Attempt saving each setting down by dispatching the relevant actions
  try {
    const {
      incidentTableColumns, incidentTableState,
    } = yield select(selectIncidentTable);
    const {
      updatedIncidentTableColumns,
    } = action;

    // Merge state from incident table and defined columns into a format which can be persisted
    const reactTableColumnSchemas = getReactTableColumnSchemas(updatedIncidentTableColumns);
    const existingColumnWidths = incidentTableState.columnResizing
      ? incidentTableState.columnResizing.columnWidths
      : null;
    const persistableColumns = reactTableColumnSchemas.map((columnSchema) => {
      // Get object for column if it already exists in view
      const existingCol = incidentTableColumns.find(
        (column) => column.Header === columnSchema.Header,
      );
      // Patch column width either from incident table state, redux store, or default definition
      const tempCol = { ...columnSchema };
      if (existingColumnWidths && tempCol.accessor in existingColumnWidths) {
        tempCol.width = existingColumnWidths[tempCol.accessor];
      } else if (existingColumnWidths && tempCol.Header in existingColumnWidths) {
        tempCol.width = existingColumnWidths[tempCol.Header];
      } else if (existingCol && existingCol.width) {
        tempCol.width = existingCol.width;
      } else {
        tempCol.width = tempCol.minWidth;
      }
      return {
        Header: tempCol.Header,
        accessorPath: tempCol.accessorPath,
        aggregator: tempCol.aggregator,
        width: tempCol.width,
        columnType: tempCol.columnType,
      };
    });

    // Update incident table columns
    yield put({
      type: UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED,
      incidentTableColumns: persistableColumns,
    });

    // TODO: Other table settings can be dispatched here...

    // Indicate that changes were saved and close down settings modal.
    yield put({ type: SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED });
  } catch (e) {
    yield put({ type: SAVE_INCIDENT_TABLE_SETTINGS_ERROR, message: e.message });
  }
}

export function* updateIncidentTableColumns() {
  yield takeLatest(UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED, updateIncidentTableColumnsImpl);
}

export function* updateIncidentTableColumnsImpl(action) {
  const {
    incidentTableColumns,
  } = action;
  yield put({
    type: UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED,
    incidentTableColumns,
  });
}

export function* updateIncidentTableState() {
  yield takeLatest(UPDATE_INCIDENT_TABLE_STATE_REQUESTED, updateIncidentTableStateImpl);
}

export function* updateIncidentTableStateImpl(action) {
  const {
    incidentTableState,
  } = action;
  yield put({
    type: UPDATE_INCIDENT_TABLE_STATE_COMPLETED,
    incidentTableState,
  });
}

export function* selectIncidentTableRows() {
  yield takeLatest(SELECT_INCIDENT_TABLE_ROWS_REQUESTED, selectIncidentTableRowsImpl);
}

export function* selectIncidentTableRowsImpl(action) {
  const {
    allSelected, selectedCount, selectedRows,
  } = action;
  yield put({
    type: SELECT_INCIDENT_TABLE_ROWS_COMPLETED,
    allSelected,
    selectedCount,
    selectedRows,
  });
}
