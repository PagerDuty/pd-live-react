import {
  produce,
} from 'immer';

import {
  TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_REQUESTED,
  TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_COMPLETED,
  UPDATE_ACTION_ALERTS_MODAL_REQUESTED,
  UPDATE_ACTION_ALERTS_MODAL_COMPLETED,
} from './actions';

const actionAlertsModalData = produce(
  (draft, action) => {
    switch (action.type) {
      case TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_REQUESTED:
        draft.status = TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_REQUESTED;
        break;

      case TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_COMPLETED:
        draft.displayActionAlertsModal = action.displayActionAlertsModal;
        draft.status = TOGGLE_DISPLAY_ACTION_ALERTS_MODAL_COMPLETED;
        break;

      case UPDATE_ACTION_ALERTS_MODAL_REQUESTED:
        draft.status = UPDATE_ACTION_ALERTS_MODAL_REQUESTED;
        break;

      case UPDATE_ACTION_ALERTS_MODAL_COMPLETED:
        draft.actionAlertsModalType = action.actionAlertsModalType;
        draft.actionAlertsModalMessage = action.actionAlertsModalMessage;
        draft.status = UPDATE_ACTION_ALERTS_MODAL_COMPLETED;
        break;

      default:
        break;
    }
  },
  {
    displayActionAlertsModal: false,
    actionAlertsModalType: 'success',
    actionAlertsModalMessage: 'N/A',
    status: null,
    fetchingData: false,
    error: null,
  },
);

export default actionAlertsModalData;
