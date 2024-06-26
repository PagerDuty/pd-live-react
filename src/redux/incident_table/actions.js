// Define Action Types
export const SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED = 'SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED';
export const SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED = 'SAVE_INCIDENT_TABLE_SETTINGS_COMPLETED';
export const SAVE_INCIDENT_TABLE_SETTINGS_ERROR = 'SAVE_INCIDENT_TABLE_SETTINGS_ERROR';

export const UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED = 'UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED';
export const UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED = 'UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED';

export const UPDATE_INCIDENT_TABLE_STATE_REQUESTED = 'UPDATE_INCIDENT_TABLE_STATE_REQUESTED';
export const UPDATE_INCIDENT_TABLE_STATE_COMPLETED = 'UPDATE_INCIDENT_TABLE_STATE_COMPLETED';

export const SELECT_INCIDENT_TABLE_ROWS_REQUESTED = 'SELECT_INCIDENT_TABLE_ROWS_REQUESTED';
export const SELECT_INCIDENT_TABLE_ROWS_COMPLETED = 'SELECT_INCIDENT_TABLE_ROWS_COMPLETED';

export const CLEAR_INCIDENT_TABLE_FILTERS_REQUESTED = 'CLEAR_INCIDENT_TABLE_FILTERS_REQUESTED';
export const CLEAR_INCIDENT_TABLE_FILTERS_COMPLETED = 'CLEAR_INCIDENT_TABLE_FILTERS_COMPLETED';

// Define Actions

export const saveIncidentTable = (updatedIncidentTableColumns) => ({
  type: SAVE_INCIDENT_TABLE_SETTINGS_REQUESTED,
  updatedIncidentTableColumns,
});

export const updateIncidentTableColumns = (incidentTableColumns) => ({
  type: UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED,
  incidentTableColumns,
});

export const updateIncidentTableState = (incidentTableState) => ({
  type: UPDATE_INCIDENT_TABLE_STATE_REQUESTED,
  incidentTableState,
});

export const selectIncidentTableRows = (allSelected, selectedCount, selectedRows) => ({
  type: SELECT_INCIDENT_TABLE_ROWS_REQUESTED,
  allSelected,
  selectedCount,
  selectedRows,
});

export const clearIncidentTableFilters = () => ({
  type: CLEAR_INCIDENT_TABLE_FILTERS_REQUESTED,
});
