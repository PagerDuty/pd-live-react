import {
  produce,
} from 'immer';

import {
  FETCH_SERVICES_REQUESTED,
  FETCH_SERVICES_COMPLETED,
  FETCH_SERVICES_ERROR,
} from './actions';

const services = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_SERVICES_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_SERVICES_REQUESTED;
        break;

      case FETCH_SERVICES_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_SERVICES_COMPLETED;
        draft.services = action.services;
        break;

      case FETCH_SERVICES_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_SERVICES_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    services: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default services;
