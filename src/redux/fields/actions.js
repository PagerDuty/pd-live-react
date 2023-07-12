// Define Action Types
export const FETCH_FIELDS_REQUESTED = 'FETCH_FIELDS_REQUESTED';
export const FETCH_FIELDS_COMPLETED = 'FETCH_FIELDS_COMPLETED';
export const FETCH_FIELDS_ERROR = 'FETCH_FIELDS_ERROR';

// Define Actions
export const getFieldsAsync = () => ({
  type: FETCH_FIELDS_REQUESTED,
});
