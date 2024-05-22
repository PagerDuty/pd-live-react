/* eslint-disable max-len */
// Define Action Types
export const ACTION_REQUESTED = 'ACTION_REQUESTED';
export const ACTION_COMPLETED = 'ACTION_COMPLETED';
export const ACTION_ERROR = 'ACTION_ERROR';

export const ACKNOWLEDGE_REQUESTED = 'ACKNOWLEDGE_REQUESTED';
export const ACKNOWLEDGE_COMPLETED = 'ACKNOWLEDGE_COMPLETED';
export const ACKNOWLEDGE_ERROR = 'ACKNOWLEDGE_ERROR';

export const ESCALATE_REQUESTED = 'ESCALATE_REQUESTED';
export const ESCALATE_COMPLETED = 'ESCALATE_COMPLETED';
export const ESCALATE_ERROR = 'ESCALATE_ERROR';

export const REASSIGN_REQUESTED = 'REASSIGN_REQUESTED';
export const REASSIGN_COMPLETED = 'REASSIGN_COMPLETED';
export const REASSIGN_ERROR = 'REASSIGN_ERROR';

export const TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED = 'TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED';
export const TOGGLE_DISPLAY_REASSIGN_MODAL_COMPLETED = 'TOGGLE_DISPLAY_REASSIGN_MODAL_COMPLETED';

export const ADD_RESPONDER_REQUESTED = 'ADD_RESPONDER_REQUESTED';
export const ADD_RESPONDER_COMPLETED = 'ADD_RESPONDER_COMPLETED';
export const ADD_RESPONDER_ERROR = 'ADD_RESPONDER_ERROR';

export const TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED = 'TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED';
export const TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_COMPLETED = 'TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_COMPLETED';

export const SNOOZE_REQUESTED = 'SNOOZE_REQUESTED';
export const SNOOZE_COMPLETED = 'SNOOZE_COMPLETED';
export const SNOOZE_ERROR = 'SNOOZE_ERROR';

export const TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED = 'TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED';
export const TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_COMPLETED = 'TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_COMPLETED';

export const MERGE_REQUESTED = 'MERGE_REQUESTED';
export const MERGE_PROGRESS = 'MERGE_PROGRESS';
export const MERGE_COMPLETED = 'MERGE_COMPLETED';
export const MERGE_ERROR = 'MERGE_ERROR';

export const TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED = 'TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED';
export const TOGGLE_DISPLAY_MERGE_MODAL_COMPLETED = 'TOGGLE_DISPLAY_MERGE_MODAL_COMPLETED';

export const RESOLVE_REQUESTED = 'RESOLVE_REQUESTED';
export const RESOLVE_COMPLETED = 'RESOLVE_COMPLETED';
export const RESOLVE_ERROR = 'RESOLVE_ERROR';

export const UPDATE_PRIORITY_REQUESTED = 'UPDATE_PRIORITY_REQUESTED';
export const UPDATE_PRIORITY_COMPLETED = 'UPDATE_PRIORITY_COMPLETED';
export const UPDATE_PRIORITY_ERROR = 'UPDATE_PRIORITY_ERROR';

export const ADD_NOTE_REQUESTED = 'ADD_NOTE_REQUESTED';
export const ADD_NOTE_COMPLETED = 'ADD_NOTE_COMPLETED';
export const ADD_NOTE_ERROR = 'ADD_NOTE_ERROR';

export const TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED = 'TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED';
export const TOGGLE_DISPLAY_ADD_NOTE_MODAL_COMPLETED = 'TOGGLE_DISPLAY_ADD_NOTE_MODAL_COMPLETED';

export const RUN_CUSTOM_INCIDENT_ACTION_REQUESTED = 'RUN_CUSTOM_INCIDENT_ACTION_REQUESTED';
export const RUN_CUSTOM_INCIDENT_ACTION_COMPLETED = 'RUN_CUSTOM_INCIDENT_ACTION_COMPLETED';
export const RUN_CUSTOM_INCIDENT_ACTION_ERROR = 'RUN_CUSTOM_INCIDENT_ACTION_ERROR';

export const SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED = 'SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED';
export const SYNC_WITH_EXTERNAL_SYSTEM_COMPLETED = 'SYNC_WITH_EXTERNAL_SYSTEM_COMPLETED';
export const SYNC_WITH_EXTERNAL_SYSTEM_ERROR = 'SYNC_WITH_EXTERNAL_SYSTEM_ERROR';

export const MOVE_ALERTS_REQUESTED = 'MOVE_ALERTS_REQUESTED';
export const MOVE_ALERTS_COMPLETED = 'MOVE_ALERTS_COMPLETED';
export const MOVE_ALERTS_ERROR = 'MOVE_ALERTS_ERROR';

export const doAction = () => ({
  type: ACTION_REQUESTED,
});

export const acknowledge = (incidents, displayModal = true) => ({
  type: ACKNOWLEDGE_REQUESTED,
  incidents,
  displayModal,
});

export const escalate = (incidents, escalationLevel, displayModal = true) => ({
  type: ESCALATE_REQUESTED,
  incidents,
  escalationLevel,
  displayModal,
});

export const reassign = (incidents, assignment, displayModal = true) => ({
  type: REASSIGN_REQUESTED,
  incidents,
  assignment,
  displayModal,
});

export const toggleDisplayReassignModal = () => ({
  type: TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED,
});

export const addResponder = (
  incidents,
  requesterId,
  responderRequestTargets,
  message,
  displayModal = true,
) => ({
  type: ADD_RESPONDER_REQUESTED,
  incidents,
  requesterId,
  responderRequestTargets,
  message,
  displayModal,
});

export const toggleDisplayAddResponderModal = () => ({
  type: TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED,
});

export const snooze = (incidents, duration, displayModal = true) => ({
  type: SNOOZE_REQUESTED,
  incidents,
  duration,
  displayModal,
});

export const toggleDisplayCustomSnoozeModal = () => ({
  type: TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED,
});

export const merge = (targetIncident, incidents, displayModal = true, addToTitleText) => ({
  type: MERGE_REQUESTED,
  targetIncident,
  incidents,
  displayModal,
  addToTitleText,
});

export const toggleDisplayMergeModal = () => ({
  type: TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED,
});

export const resolve = (incidents, displayModal = true) => ({
  type: RESOLVE_REQUESTED,
  incidents,
  displayModal,
});

export const updatePriority = (incidents, priorityId, displayModal = true) => ({
  type: UPDATE_PRIORITY_REQUESTED,
  incidents,
  priorityId,
  displayModal,
});

export const addNote = (incidents, note, displayModal = true, toggleModal = true) => ({
  type: ADD_NOTE_REQUESTED,
  incidents,
  note,
  displayModal,
  toggleModal,
});

export const toggleDisplayAddNoteModal = () => ({
  type: TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED,
});

export const runCustomIncidentAction = (incidents, webhook, displayModal = true) => ({
  type: RUN_CUSTOM_INCIDENT_ACTION_REQUESTED,
  incidents,
  webhook,
  displayModal,
});

export const syncWithExternalSystem = (incidents, webhook, displayModal = true) => ({
  type: SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED,
  incidents,
  webhook,
  displayModal,
});

export const moveAlerts = (fromIncidentId, toIncidentId, alerts, options) => ({
  type: MOVE_ALERTS_REQUESTED,
  fromIncidentId,
  toIncidentId,
  alerts,
  options,
});
