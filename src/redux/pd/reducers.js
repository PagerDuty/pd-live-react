import {
  produce,
} from 'immer';

import {
  PD_API_SET_AUTH,
  PD_API_CALL_REQUESTED,
  PD_API_CALL_COMPLETED,
  PD_API_CALL_ERROR,
} from './actions';

const pd = produce(
  (draft, action) => {
    switch (action.type) {
      case PD_API_SET_AUTH:
        draft.accessToken = action.accessToken;
        draft.refreshToken = action.refreshToken;
        draft.expiresAt = action.expiresAt;
        break;

      case PD_API_CALL_REQUESTED:
        draft.status = PD_API_CALL_REQUESTED;
        break;

      case PD_API_CALL_COMPLETED:
        draft.status = PD_API_CALL_COMPLETED;
        break;

      case PD_API_CALL_ERROR:
        draft.status = PD_API_CALL_ERROR;
        draft.errors.push(action.error);
        break;

      default:
        break;
    }
  },
  {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    status: '',
    errors: [],
  },
);

export default pd;
