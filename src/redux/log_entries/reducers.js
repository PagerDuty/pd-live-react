import produce from 'immer';

import {
  FETCH_LOG_ENTRIES_REQUESTED,
  FETCH_LOG_ENTRIES_COMPLETED,
  FETCH_LOG_ENTRIES_ERROR,
  UPDATE_RECENT_LOG_ENTRIES,
  UPDATE_RECENT_LOG_ENTRIES_COMPLETED,
  UPDATE_RECENT_LOG_ENTRIES_ERROR,
  CLEAN_RECENT_LOG_ENTRIES,
  CLEAN_RECENT_LOG_ENTRIES_COMPLETED,
  CLEAN_RECENT_LOG_ENTRIES_ERROR,
} from './actions';

const logEntries = produce(
  (draft, action) => {
    switch (action.type) {
      case FETCH_LOG_ENTRIES_REQUESTED:
        draft.fetchingData = true;
        draft.status = FETCH_LOG_ENTRIES_REQUESTED;
        break;

      case FETCH_LOG_ENTRIES_COMPLETED:
        if (action.latestLogEntryDate) {
          draft.latestLogEntryDate = action.latestLogEntryDate;
        }
        draft.logEntries = action.logEntries;
        draft.recentLogEntries = action.recentLogEntries;
        draft.fetchingData = false;
        draft.status = FETCH_LOG_ENTRIES_COMPLETED;
        break;

      case FETCH_LOG_ENTRIES_ERROR:
        draft.fetchingData = false;
        draft.status = FETCH_LOG_ENTRIES_ERROR;
        draft.error = action.message;
        break;

      case UPDATE_RECENT_LOG_ENTRIES:
        draft.fetchingData = false;
        draft.status = UPDATE_RECENT_LOG_ENTRIES;
        break;

      case UPDATE_RECENT_LOG_ENTRIES_COMPLETED:
        draft.fetchingData = false;
        draft.status = UPDATE_RECENT_LOG_ENTRIES_COMPLETED;
        break;

      case UPDATE_RECENT_LOG_ENTRIES_ERROR:
        draft.fetchingData = false;
        draft.status = UPDATE_RECENT_LOG_ENTRIES_ERROR;
        draft.error = action.message;
        break;

      case CLEAN_RECENT_LOG_ENTRIES:
        draft.fetchingData = false;
        draft.status = CLEAN_RECENT_LOG_ENTRIES;
        break;

      case CLEAN_RECENT_LOG_ENTRIES_COMPLETED:
        draft.fetchingData = false;
        draft.status = CLEAN_RECENT_LOG_ENTRIES_COMPLETED;
        draft.recentLogEntries = action.recentLogEntries;
        break;

      case CLEAN_RECENT_LOG_ENTRIES_ERROR:
        draft.fetchingData = false;
        draft.status = CLEAN_RECENT_LOG_ENTRIES_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    latestLogEntryDate: null,
    logEntries: [],
    recentLogEntries: {},
    addList: [],
    updateList: [],
    removeList: [],
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default logEntries;
