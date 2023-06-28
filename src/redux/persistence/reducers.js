import {
  produce,
} from 'immer';

import {
  PURGE, REHYDRATE,
} from 'redux-persist';

const persistence = produce(
  (draft, action) => {
    switch (action.type) {
      case REHYDRATE:
        draft.persistedState = action.payload;
        break;
      case PURGE:
        draft.persistedState = {};
        break;
      default:
        break;
    }
  },
  {
    persistedState: {},
  },
);

export default persistence;
