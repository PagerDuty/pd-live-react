import {
  produce,
} from 'immer';

import {
  FETCH_PRIORITIES_REQUESTED,
  FETCH_PRIORITIES_COMPLETED,
  FETCH_PRIORITIES_ERROR,
} from './actions';

const priorities = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_PRIORITIES_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_PRIORITIES_REQUESTED;
        break;

      case FETCH_PRIORITIES_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_PRIORITIES_COMPLETED;
        draft.priorities = action.priorities;
        break;

      case FETCH_PRIORITIES_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_PRIORITIES_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    priorities: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default priorities;
