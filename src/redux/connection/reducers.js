import {
  produce,
} from 'immer';
import i18next from 'src/i18n';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
  UPDATE_CONNECTION_STATUS_COMPLETED,
  UPDATE_QUEUE_STATS_REQUESTED,
  UPDATE_QUEUE_STATS_COMPLETED,
  CHECK_CONNECTION_STATUS_REQUESTED,
  CHECK_CONNECTION_STATUS_COMPLETED,
  CHECK_ABILITIES_REQUESTED,
  CHECK_ABILITIES_COMPLETED,
  CHECK_ABILITIES_ERROR,
  SAVE_ERROR_REQUESTED,
  SAVE_ERROR_COMPLETED,
} from './actions';

const connection = produce(
  (draft, action) => {
    switch (action.type) {
      case UPDATE_CONNECTION_STATUS_REQUESTED:
        draft.status = UPDATE_CONNECTION_STATUS_REQUESTED;
        break;

      case UPDATE_CONNECTION_STATUS_COMPLETED:
        draft.status = UPDATE_CONNECTION_STATUS_COMPLETED;
        draft.connectionStatus = action.connectionStatus;
        draft.connectionStatusMessage = action.connectionStatusMessage;
        if (action.messageDetail) {
          draft.errors.push(action.messageDetail);
          if (draft.errors.length > 25) {
            draft.errors.shift();
          }
        }
        break;

      case UPDATE_QUEUE_STATS_REQUESTED:
        draft.status = UPDATE_QUEUE_STATS_REQUESTED;
        break;

      case UPDATE_QUEUE_STATS_COMPLETED:
        draft.status = UPDATE_QUEUE_STATS_COMPLETED;
        draft.queueStats = action.queueStats;
        break;

      case CHECK_CONNECTION_STATUS_REQUESTED:
        draft.status = CHECK_CONNECTION_STATUS_REQUESTED;
        break;

      case CHECK_CONNECTION_STATUS_COMPLETED:
        draft.status = CHECK_CONNECTION_STATUS_COMPLETED;
        break;

      case CHECK_ABILITIES_REQUESTED:
        draft.status = CHECK_ABILITIES_REQUESTED;
        break;

      case CHECK_ABILITIES_COMPLETED:
        draft.status = CHECK_ABILITIES_COMPLETED;
        draft.abilities = action.abilities;
        break;

      case CHECK_ABILITIES_ERROR:
        draft.status = CHECK_ABILITIES_ERROR;
        break;

      case SAVE_ERROR_REQUESTED:
        draft.status = SAVE_ERROR_REQUESTED;
        break;

      case SAVE_ERROR_COMPLETED:
        draft.status = SAVE_ERROR_COMPLETED;
        draft.errors.push(action.error);
        if (draft.errors.length > 25) {
          draft.errors.shift();
        }
        break;

      default:
        break;
    }
  },
  {
    connectionStatus: 'dormant',
    connectionStatusMessage: i18next.t('Connecting'),
    queueStats: { RECEIVED: 0, QUEUED: 0, RUNNING: 0, EXECUTING: 0 },
    abilities: [],
    status: '',
    errors: [],
  },
);

export default connection;
