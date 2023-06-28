import {
  produce,
} from 'immer';

import {
  FETCH_ESCALATION_POLICIES_REQUESTED,
  FETCH_ESCALATION_POLICIES_COMPLETED,
  FETCH_ESCALATION_POLICIES_ERROR,
} from './actions';

const escalationPolicies = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_ESCALATION_POLICIES_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_ESCALATION_POLICIES_REQUESTED;
        break;

      case FETCH_ESCALATION_POLICIES_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_ESCALATION_POLICIES_COMPLETED;
        draft.escalationPolicies = action.escalationPolicies;
        break;

      case FETCH_ESCALATION_POLICIES_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_ESCALATION_POLICIES_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    escalationPolicies: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default escalationPolicies;
