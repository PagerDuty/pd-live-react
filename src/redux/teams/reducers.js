import {
  produce,
} from 'immer';

import {
  FETCH_TEAMS_REQUESTED, FETCH_TEAMS_COMPLETED, FETCH_TEAMS_ERROR,
} from './actions';

const teams = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_TEAMS_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_TEAMS_REQUESTED;
        break;

      case FETCH_TEAMS_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_TEAMS_COMPLETED;
        draft.teams = action.teams;
        break;

      case FETCH_TEAMS_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_TEAMS_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    teams: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default teams;
