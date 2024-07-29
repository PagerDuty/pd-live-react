import {
  produce,
} from 'immer';

import {
  LOG_ENTRIES_POLLING_INTERVAL_SECONDS,
} from 'src/config/constants';

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
  START_CLEAN_RECENT_LOG_ENTRIES_POLLING,
  STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING,
  START_LOG_ENTRIES_POLLING,
  UPDATE_LOG_ENTRIES_POLLING,
  STOP_LOG_ENTRIES_POLLING,
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

      case START_CLEAN_RECENT_LOG_ENTRIES_POLLING:
        draft.status = START_CLEAN_RECENT_LOG_ENTRIES_POLLING;
        break;

      case STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING:
        draft.status = STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING;
        break;

      case CLEAN_RECENT_LOG_ENTRIES_ERROR:
        draft.fetchingData = false;
        draft.status = CLEAN_RECENT_LOG_ENTRIES_ERROR;
        draft.error = action.message;
        break;

      case START_LOG_ENTRIES_POLLING:
        draft.pollingStatus.polling = true;
        draft.status = START_LOG_ENTRIES_POLLING;
        break;

      case UPDATE_LOG_ENTRIES_POLLING:
        draft.pollingStatus = {
          ...draft.pollingStatus,
          ...action.pollingStatus,
        };
        draft.status = UPDATE_LOG_ENTRIES_POLLING;
        break;

      case STOP_LOG_ENTRIES_POLLING:
        draft.pollingStatus.polling = false;
        draft.status = STOP_LOG_ENTRIES_POLLING;
        break;

      default:
        break;
    }
  },
  {
    latestLogEntryDate: new Date(new Date() - 2 * LOG_ENTRIES_POLLING_INTERVAL_SECONDS * 1000),
    logEntries: [],
    recentLogEntries: {},
    addList: [],
    updateList: [],
    removeList: [],
    status: '',
    fetchingData: false,
    error: null,
    pollingStatus: {
      polling: false,
      lastPollStarted: null,
      lastPollCompleted: null,
      errors: [],
    },
  },
);

export default logEntries;
