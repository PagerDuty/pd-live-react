// Define Action Types
export const UPDATE_CONNECTION_STATUS_REQUESTED = 'UPDATE_CONNECTION_STATUS_REQUESTED';
export const UPDATE_CONNECTION_STATUS_COMPLETED = 'UPDATE_CONNECTION_STATUS_COMPLETED';

export const UPDATE_QUEUE_STATS_REQUESTED = 'UPDATE_QUEUE_STATS_REQUESTED';
export const UPDATE_QUEUE_STATS_COMPLETED = 'UPDATE_QUEUE_STATS_COMPLETED';

export const CHECK_CONNECTION_STATUS_REQUESTED = 'CHECK_CONNECTION_STATUS_REQUESTED';
export const CHECK_CONNECTION_STATUS_COMPLETED = 'CHECK_CONNECTION_STATUS_COMPLETED';

export const CHECK_ABILITIES_REQUESTED = 'CHECK_ABILITIES_REQUESTED';
export const CHECK_ABILITIES_COMPLETED = 'CHECK_ABILITIES_COMPLETED';
export const CHECK_ABILITIES_ERROR = 'CHECK_ABILITIES_ERROR';

export const SAVE_ERROR_REQUESTED = 'SAVE_ERROR_REQUESTED';
export const SAVE_ERROR_COMPLETED = 'SAVE_ERROR_COMPLETED';

// Define Actions
export const updateConnectionStatus = (
  connectionStatus,
  connectionStatusMessage,
  messageDetail,
) => ({
  type: UPDATE_CONNECTION_STATUS_REQUESTED,
  connectionStatus,
  connectionStatusMessage,
  messageDetail,
});

export const updateQueueStats = (queueStats) => ({
  type: UPDATE_QUEUE_STATS_REQUESTED,
  queueStats,
});

export const checkConnectionStatus = () => ({
  type: CHECK_CONNECTION_STATUS_REQUESTED,
});

export const checkAbilities = () => ({
  type: CHECK_ABILITIES_REQUESTED,
});

export const saveError = (error) => ({
  type: SAVE_ERROR_REQUESTED,
  error,
});
