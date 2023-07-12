import {
  produce,
} from 'immer';

import {
  FETCH_FIELDS_REQUESTED, FETCH_FIELDS_COMPLETED, FETCH_FIELDS_ERROR,
} from './actions';

const fields = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_FIELDS_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_FIELDS_REQUESTED;
        break;

      case FETCH_FIELDS_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_FIELDS_COMPLETED;
        draft.fields = action.fields;
        break;

      case FETCH_FIELDS_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_FIELDS_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    fields: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default fields;
