import {
  produce,
} from 'immer';

import {
  FETCH_RESPONSE_PLAYS_REQUESTED,
  FETCH_RESPONSE_PLAYS_COMPLETED,
  FETCH_RESPONSE_PLAYS_ERROR,
  RUN_RESPONSE_PLAY_REQUESTED,
  RUN_RESPONSE_PLAY_COMPLETED,
  RUN_RESPONSE_PLAY_ERROR,
} from './actions';

const responsePlays = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_RESPONSE_PLAYS_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_RESPONSE_PLAYS_REQUESTED;
        break;

      case FETCH_RESPONSE_PLAYS_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_RESPONSE_PLAYS_COMPLETED;
        draft.responsePlays = action.responsePlays;
        break;

      case FETCH_RESPONSE_PLAYS_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_RESPONSE_PLAYS_ERROR;
        draft.error = action.message;
        break;

      case RUN_RESPONSE_PLAY_REQUESTED:
        draft.status = RUN_RESPONSE_PLAY_REQUESTED;
        break;

      case RUN_RESPONSE_PLAY_COMPLETED:
        draft.status = RUN_RESPONSE_PLAY_COMPLETED;
        draft.responsePlayRequests = action.responsePlayRequests;
        break;

      case RUN_RESPONSE_PLAY_ERROR:
        draft.status = RUN_RESPONSE_PLAY_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    responsePlays: [],
    responsePlayRequests: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default responsePlays;
