import {
  produce,
} from 'immer';

import {
  FETCH_EXTENSIONS_REQUESTED,
  FETCH_EXTENSIONS_COMPLETED,
  FETCH_EXTENSIONS_ERROR,
  MAP_SERVICES_TO_EXTENSIONS_REQUESTED,
  MAP_SERVICES_TO_EXTENSIONS_COMPLETED,
  MAP_SERVICES_TO_EXTENSIONS_ERROR,
} from './actions';

const extensions = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_EXTENSIONS_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_EXTENSIONS_REQUESTED;
        break;

      case FETCH_EXTENSIONS_COMPLETED:
        draft.fetchingData = false;
        draft.status = FETCH_EXTENSIONS_COMPLETED;
        draft.extensions = action.extensions;
        break;

      case FETCH_EXTENSIONS_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_EXTENSIONS_ERROR;
        draft.error = action.message;
        break;

      case MAP_SERVICES_TO_EXTENSIONS_REQUESTED:
        draft.status = MAP_SERVICES_TO_EXTENSIONS_REQUESTED;
        break;

      case MAP_SERVICES_TO_EXTENSIONS_COMPLETED:
        draft.status = MAP_SERVICES_TO_EXTENSIONS_COMPLETED;
        draft.serviceExtensionMap = action.serviceExtensionMap;
        break;

      case MAP_SERVICES_TO_EXTENSIONS_ERROR:
        draft.status = MAP_SERVICES_TO_EXTENSIONS_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    extensions: [],
    serviceExtensionMap: {},
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default extensions;
