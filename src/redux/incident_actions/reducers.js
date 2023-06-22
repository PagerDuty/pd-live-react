import produce from 'immer';

import {
  ACTION_REQUESTED,
  ACTION_COMPLETED,
  ACTION_ERROR,
  ACKNOWLEDGE_REQUESTED,
  ACKNOWLEDGE_COMPLETED,
  ACKNOWLEDGE_ERROR,
  ESCALATE_REQUESTED,
  ESCALATE_COMPLETED,
  ESCALATE_ERROR,
  REASSIGN_REQUESTED,
  REASSIGN_COMPLETED,
  REASSIGN_ERROR,
  TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED,
  TOGGLE_DISPLAY_REASSIGN_MODAL_COMPLETED,
  ADD_RESPONDER_REQUESTED,
  ADD_RESPONDER_COMPLETED,
  ADD_RESPONDER_ERROR,
  TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED,
  TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_COMPLETED,
  SNOOZE_REQUESTED,
  SNOOZE_COMPLETED,
  SNOOZE_ERROR,
  TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED,
  TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_COMPLETED,
  MERGE_REQUESTED,
  MERGE_COMPLETED,
  MERGE_ERROR,
  TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED,
  TOGGLE_DISPLAY_MERGE_MODAL_COMPLETED,
  RESOLVE_REQUESTED,
  RESOLVE_COMPLETED,
  RESOLVE_ERROR,
  UPDATE_PRIORITY_REQUESTED,
  UPDATE_PRIORITY_COMPLETED,
  UPDATE_PRIORITY_ERROR,
  ADD_NOTE_REQUESTED,
  ADD_NOTE_COMPLETED,
  ADD_NOTE_ERROR,
  TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED,
  TOGGLE_DISPLAY_ADD_NOTE_MODAL_COMPLETED,
  RUN_CUSTOM_INCIDENT_ACTION_REQUESTED,
  RUN_CUSTOM_INCIDENT_ACTION_COMPLETED,
  RUN_CUSTOM_INCIDENT_ACTION_ERROR,
  SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED,
  SYNC_WITH_EXTERNAL_SYSTEM_COMPLETED,
  SYNC_WITH_EXTERNAL_SYSTEM_ERROR,
} from './actions';

const incidentActions = produce(
  (draft, action) => {
    switch (action.type) {
      case ACTION_REQUESTED:
        draft.status = ACTION_REQUESTED;
        break;

      case ACTION_COMPLETED:
        draft.status = ACTION_COMPLETED;
        break;

      case ACTION_ERROR:
        draft.status = ACTION_ERROR;
        break;

      case ACKNOWLEDGE_REQUESTED:
        draft.status = ACKNOWLEDGE_REQUESTED;
        break;

      case ACKNOWLEDGE_COMPLETED:
        draft.acknowledgedIncidents = action.acknowledgedIncidents;
        draft.status = ACKNOWLEDGE_COMPLETED;
        break;

      case ACKNOWLEDGE_ERROR:
        draft.status = ACKNOWLEDGE_ERROR;
        draft.error = action.message;
        break;

      case ESCALATE_REQUESTED:
        draft.status = ESCALATE_REQUESTED;
        break;

      case ESCALATE_COMPLETED:
        draft.escalatedIncidents = action.escalatedIncidents;
        draft.status = ESCALATE_COMPLETED;
        break;

      case ESCALATE_ERROR:
        draft.status = ESCALATE_ERROR;
        draft.error = action.message;
        break;

      case REASSIGN_REQUESTED:
        draft.status = REASSIGN_REQUESTED;
        break;

      case REASSIGN_COMPLETED:
        draft.reassignedIncidents = action.reassignedIncidents;
        draft.status = REASSIGN_COMPLETED;
        break;

      case REASSIGN_ERROR:
        draft.status = REASSIGN_ERROR;
        draft.error = action.message;
        break;

      case TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED:
        draft.status = TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED;
        break;

      case TOGGLE_DISPLAY_REASSIGN_MODAL_COMPLETED:
        draft.displayReassignModal = action.displayReassignModal;
        draft.status = TOGGLE_DISPLAY_REASSIGN_MODAL_COMPLETED;
        break;

      case ADD_RESPONDER_REQUESTED:
        draft.status = ADD_RESPONDER_REQUESTED;
        break;

      case ADD_RESPONDER_COMPLETED:
        draft.updatedIncidentResponderRequests = action.updatedIncidentResponderRequests;
        draft.status = ADD_RESPONDER_COMPLETED;
        break;

      case ADD_RESPONDER_ERROR:
        draft.status = ADD_RESPONDER_ERROR;
        draft.error = action.message;
        break;

      case TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED:
        draft.status = TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED;
        break;

      case TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_COMPLETED:
        draft.displayAddResponderModal = action.displayAddResponderModal;
        draft.status = TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_COMPLETED;
        break;

      case SNOOZE_REQUESTED:
        draft.status = SNOOZE_REQUESTED;
        break;

      case SNOOZE_COMPLETED:
        draft.snoozedIncidents = action.snoozedIncidents;
        draft.status = SNOOZE_COMPLETED;
        break;

      case SNOOZE_ERROR:
        draft.status = SNOOZE_ERROR;
        draft.error = action.message;
        break;

      case TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED:
        draft.status = TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED;
        break;

      case TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_COMPLETED:
        draft.displayCustomSnoozeModal = action.displayCustomSnoozeModal;
        draft.status = TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_COMPLETED;
        break;

      case MERGE_REQUESTED:
        draft.status = MERGE_REQUESTED;
        break;

      case MERGE_COMPLETED:
        draft.mergedIncident = action.mergedIncident;
        draft.status = MERGE_COMPLETED;
        break;

      case MERGE_ERROR:
        draft.status = MERGE_ERROR;
        draft.error = action.message;
        break;

      case TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED:
        draft.status = TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED;
        break;

      case TOGGLE_DISPLAY_MERGE_MODAL_COMPLETED:
        draft.displayMergeModal = action.displayMergeModal;
        draft.status = TOGGLE_DISPLAY_MERGE_MODAL_COMPLETED;
        break;

      case RESOLVE_REQUESTED:
        draft.status = RESOLVE_REQUESTED;
        break;

      case RESOLVE_COMPLETED:
        draft.resolvedIncidents = action.resolvedIncidents;
        draft.status = RESOLVE_COMPLETED;
        break;

      case RESOLVE_ERROR:
        draft.status = RESOLVE_ERROR;
        draft.error = action.message;
        break;

      case UPDATE_PRIORITY_REQUESTED:
        draft.status = UPDATE_PRIORITY_REQUESTED;
        break;

      case UPDATE_PRIORITY_COMPLETED:
        draft.updatedIncidentPriorities = action.updatedIncidentPriorities;
        draft.status = UPDATE_PRIORITY_COMPLETED;
        break;

      case UPDATE_PRIORITY_ERROR:
        draft.status = UPDATE_PRIORITY_ERROR;
        draft.error = action.message;
        break;

      case ADD_NOTE_REQUESTED:
        draft.status = ADD_NOTE_REQUESTED;
        break;

      case ADD_NOTE_COMPLETED:
        draft.updatedIncidentNotes = action.updatedIncidentNotes;
        draft.status = ADD_NOTE_COMPLETED;
        break;

      case ADD_NOTE_ERROR:
        draft.status = ADD_NOTE_ERROR;
        draft.error = action.message;
        break;

      case TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED:
        draft.status = TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED;
        break;

      case TOGGLE_DISPLAY_ADD_NOTE_MODAL_COMPLETED:
        draft.displayAddNoteModal = action.displayAddNoteModal;
        draft.status = TOGGLE_DISPLAY_ADD_NOTE_MODAL_COMPLETED;
        break;

      case RUN_CUSTOM_INCIDENT_ACTION_REQUESTED:
        draft.status = RUN_CUSTOM_INCIDENT_ACTION_REQUESTED;
        break;

      case RUN_CUSTOM_INCIDENT_ACTION_COMPLETED:
        draft.customIncidentActionRequests = action.customIncidentActionRequests;
        draft.status = RUN_CUSTOM_INCIDENT_ACTION_COMPLETED;
        break;

      case RUN_CUSTOM_INCIDENT_ACTION_ERROR:
        draft.status = RUN_CUSTOM_INCIDENT_ACTION_ERROR;
        draft.error = action.message;
        break;

      case SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED:
        draft.status = SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED;
        break;

      case SYNC_WITH_EXTERNAL_SYSTEM_COMPLETED:
        draft.externalSystemSyncRequests = action.externalSystemSyncRequests;
        draft.status = SYNC_WITH_EXTERNAL_SYSTEM_COMPLETED;
        break;

      case SYNC_WITH_EXTERNAL_SYSTEM_ERROR:
        draft.status = SYNC_WITH_EXTERNAL_SYSTEM_ERROR;
        draft.error = action.message;
        break;

      default:
        break;
    }
  },
  {
    acknowledgedIncidents: [],
    escalatedIncidents: [],
    reassignedIncidents: [],
    snoozedIncidents: [],
    mergedIncident: {},
    resolvedIncidents: [],
    updatedIncidentResponderRequests: [],
    updatedIncidentNotes: [],
    updatedIncidentPriorities: [],
    customIncidentActionRequests: [],
    externalSystemSyncRequests: [],
    displayReassignModal: false,
    displayAddResponderModal: false,
    displayCustomSnoozeModal: false,
    displayAddNoteModal: false,
    displayMergeModal: false,
    status: '',
    fetchingData: false,
    error: null,
  },
);

export default incidentActions;
