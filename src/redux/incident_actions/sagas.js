import {
  put, call, select, takeLatest, all,
} from 'redux-saga/effects';

import i18next from 'i18next';

import {
  handleSagaError,
  handleSingleAPIErrorResponse,
  handleMultipleAPIErrorResponses,
  displayActionModal,
} from 'util/sagas';

import {
  SELECT_INCIDENT_TABLE_ROWS_REQUESTED,
} from 'redux/incident_table/actions';

import {
  getIncidentByIdRequest, // updateIncidentsList,
} from 'redux/incidents/sagas';

import selectPriorities from 'redux/priorities/selectors';
import selectIncidentTable from 'redux/incident_table/selectors';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  RESOLVED,
  SNOOZED,
  getSnoozeTimes,
  filterIncidentsByField,
  generateIncidentActionModal,
} from 'util/incidents';

import {
  getObjectsFromList,
} from 'util/helpers';
import {
  pd,
} from 'util/pd-api-wrapper';
import selectIncidentActions from './selectors';
import {
  ACTION_REQUESTED,
  ACTION_COMPLETED,
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

import {
  PROCESS_LOG_ENTRIES_COMPLETED,
  UPDATE_INCIDENTS,
} from '../incidents/actions';

export function* doAction() {
  yield takeLatest(ACTION_REQUESTED, doActionImpl);
}

export function* doActionImpl() {
  yield put({
    type: ACTION_COMPLETED,
  });
}

export function* acknowledgeAsync() {
  yield takeLatest(ACKNOWLEDGE_REQUESTED, acknowledge);
}

export function* acknowledge(action) {
  try {
    const {
      incidents, displayModal,
    } = action;
    const incidentsToBeAcknowledged = filterIncidentsByField(incidents, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);

    // Build request manually given PUT
    const data = {
      incidents: incidentsToBeAcknowledged.map((incident) => ({
        id: incident.id,
        type: 'incident_reference',
        status: ACKNOWLEDGED,
      })),
    };

    const response = yield call(pd, {
      method: 'put',
      endpoint: 'incidents',
      data,
    });

    if (response.ok) {
      yield put({
        type: ACKNOWLEDGE_COMPLETED,
        acknowledgedIncidents: response.data.incidents,
      });
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: response.data.incidents,
      });
      if (displayModal) {
        const {
          actionAlertsModalType, actionAlertsModalMessage,
        } = generateIncidentActionModal(
          incidents,
          ACKNOWLEDGED,
        );
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleSingleAPIErrorResponse(response);
    }
  } catch (e) {
    handleSagaError(ACKNOWLEDGE_ERROR, e);
  }
}

export function* escalateAsync() {
  yield takeLatest(ESCALATE_REQUESTED, escalate);
}

export function* escalate(action) {
  try {
    const {
      incidents: selectedIncidents, escalationLevel, displayModal,
    } = action;

    // Build request manually given PUT
    const data = {
      incidents: selectedIncidents.map((incident) => ({
        id: incident.id,
        type: 'incident_reference',
        escalation_level: escalationLevel,
      })),
    };

    const response = yield call(pd, {
      method: 'put',
      endpoint: 'incidents',
      data,
    });

    if (response.ok) {
      yield put({
        type: ESCALATE_COMPLETED,
        escalatedIncidents: response.data.incidents,
      });
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: response.data.incidents,
      });
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been manually escalated to level')} ${escalationLevel}`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleSingleAPIErrorResponse(response);
    }
  } catch (e) {
    handleSagaError(ESCALATE_ERROR, e);
  }
}

export function* reassignAsync() {
  yield takeLatest(REASSIGN_REQUESTED, reassign);
}

export function* reassign(action) {
  try {
    const {
      incidents: selectedIncidents, assignment, displayModal,
    } = action;

    // Build request manually given PUT
    const data = {
      incidents: selectedIncidents.map((incident) => {
        const updatedIncident = {
          id: incident.id,
          type: 'incident_reference',
        };
        // Determine if EP or User Assignment
        if (assignment.type === 'escalation_policy') {
          updatedIncident.escalation_policy = {
            id: assignment.value,
            type: 'escalation_policy',
          };
        } else if (assignment.type === 'user') {
          updatedIncident.assignments = [
            {
              assignee: {
                id: assignment.value,
                type: 'user',
              },
            },
          ];
        }
        return updatedIncident;
      }),
    };

    const response = yield call(pd, {
      method: 'put',
      endpoint: 'incidents',
      data,
    });

    if (response.ok) {
      yield put({
        type: REASSIGN_COMPLETED,
        reassignedIncidents: response.data.incidents,
      });
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: response.data.incidents,
      });

      yield toggleDisplayReassignModalImpl();
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been reassigned to')} ${assignment.name}`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleSingleAPIErrorResponse(response);
    }
  } catch (e) {
    handleSagaError(REASSIGN_ERROR, e);
  }
}

export function* toggleDisplayReassignModal() {
  yield takeLatest(TOGGLE_DISPLAY_REASSIGN_MODAL_REQUESTED, toggleDisplayReassignModalImpl);
}

export function* toggleDisplayReassignModalImpl() {
  const {
    displayReassignModal,
  } = yield select(selectIncidentActions);
  yield put({
    type: TOGGLE_DISPLAY_REASSIGN_MODAL_COMPLETED,
    displayReassignModal: !displayReassignModal,
  });
}

export function* addResponderAsync() {
  yield takeLatest(ADD_RESPONDER_REQUESTED, addResponder);
}

export function* addResponder(action) {
  try {
    const {
      incidents: selectedIncidents,
      requesterId,
      responderRequestTargets,
      message,
      displayModal,
    } = action;

    // Build individual requests as the endpoint supports singular POST
    const addResponderRequests = selectedIncidents.map((incident) => call(pd, {
      method: 'post',
      endpoint: `incidents/${incident.id}/responder_requests`,
      data: {
        requester_id: requesterId,
        message,
        responder_request_targets: responderRequestTargets.map((target) => ({
          responder_request_target: {
            id: target.value,
            summary: target.name,
            type: target.type,
          },
        })),
      },
    }));

    // Invoke parallel calls for optimal performance
    const responses = yield all(addResponderRequests);
    if (responses.every((response) => response.ok)) {
      yield put({
        type: ADD_RESPONDER_COMPLETED,
        updatedIncidentResponderRequests: responses,
      });
      yield toggleDisplayAddResponderModalImpl();
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Requested additional response for')}
        ${i18next.t('incident')}(s) ${selectedIncidents.map((i) => i.incident_number).join(', ')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleMultipleAPIErrorResponses(responses);
    }
  } catch (e) {
    handleSagaError(ADD_RESPONDER_ERROR, e);
  }
}

export function* toggleDisplayAddResponderModal() {
  yield takeLatest(
    TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_REQUESTED,
    toggleDisplayAddResponderModalImpl,
  );
}

export function* toggleDisplayAddResponderModalImpl() {
  const {
    displayAddResponderModal,
  } = yield select(selectIncidentActions);
  yield put({
    type: TOGGLE_DISPLAY_ADD_RESPONDER_MODAL_COMPLETED,
    displayAddResponderModal: !displayAddResponderModal,
  });
}

export function* snoozeAsync() {
  yield takeLatest(SNOOZE_REQUESTED, snooze);
}

export function* snooze(action) {
  try {
    const {
      incidents, duration, displayModal,
    } = action;
    const snoozeTimes = getSnoozeTimes();
    const incidentsToBeSnoozed = filterIncidentsByField(incidents, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);

    // In order to snooze, triggered incidents must be acknowledged first; modal will be hidden.
    yield put({ type: ACKNOWLEDGE_REQUESTED, incidents, displayModal: false });

    // Build individual requests as the endpoint supports singular POST
    const snoozeRequests = incidentsToBeSnoozed.map((incident) => call(pd, {
      method: 'post',
      endpoint: `incidents/${incident.id}/snooze`,
      data: {
        // Handle pre-built snoozes as well as custom durations
        duration: snoozeTimes[duration] ? snoozeTimes[duration].seconds : duration,
      },
    }));

    // Invoke parallel calls for optimal performance
    const responses = yield all(snoozeRequests);
    if (responses.every((response) => response.ok)) {
      yield put({
        type: SNOOZE_COMPLETED,
        snoozedIncidents: responses,
      });
      const updatedIncidents = responses.map((response) => response.resource);
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents,
      });
      if (displayModal) {
        const {
          actionAlertsModalType, actionAlertsModalMessage,
        } = generateIncidentActionModal(
          incidents,
          SNOOZED,
        );
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleMultipleAPIErrorResponses(responses);
    }
  } catch (e) {
    handleSagaError(SNOOZE_ERROR, e);
  }
}

export function* toggleDisplayCustomSnoozeModal() {
  yield takeLatest(
    TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_REQUESTED,
    toggleDisplayCustomSnoozeModalImpl,
  );
}

export function* toggleDisplayCustomSnoozeModalImpl() {
  const {
    displayCustomSnoozeModal,
  } = yield select(selectIncidentActions);
  yield put({
    type: TOGGLE_DISPLAY_CUSTOM_SNOOZE_MODAL_COMPLETED,
    displayCustomSnoozeModal: !displayCustomSnoozeModal,
  });
}

export function* mergeAsync() {
  yield takeLatest(MERGE_REQUESTED, merge);
}

export function* merge(action) {
  try {
    const {
      targetIncident, incidents, displayModal, addToTitleText,
    } = action;
    const incidentsToBeMerged = [...incidents];

    // Build request manually given PUT
    const data = {
      source_incidents: incidentsToBeMerged.map((incident) => ({
        id: incident.id,
        type: 'incident_reference',
      })),
    };

    const response = yield call(pd, {
      method: 'put',
      endpoint: `incidents/${targetIncident.id}/merge`,
      data,
    });

    if (response.ok) {
      yield put({
        type: MERGE_COMPLETED,
        mergedIncident: response.resource,
      });
      yield toggleDisplayMergeModalImpl();

      const mergedIncident = response.resource;
      const resolvedIncidents = incidentsToBeMerged.map((incident) => ({
        id: incident.id,
        status: RESOLVED,
      }));
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: [...resolvedIncidents, mergedIncident],
      });

      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${incidentsToBeMerged
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('and their alerts have been merged onto incident')}
          ${targetIncident.incident_number}`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleSingleAPIErrorResponse(response);
    }

    if (addToTitleText) {
      const titleUpdates = incidentsToBeMerged.map((incident) => (
        call(pd, {
          method: 'put',
          endpoint: `incidents/${incident.id}`,
          data: {
            incident: {
              type: 'incident_reference',
              title: `${addToTitleText} ${incident.title}`,
            },
          },
        })
      ));
      const titleResponses = yield all(titleUpdates);
      const successes = titleResponses.filter((r) => r.ok);
      if (successes.length !== titleResponses.length) {
        handleMultipleAPIErrorResponses(titleResponses.filter((r) => !r.ok));
      }
      const updatedIncidents = successes.map((r) => r.resource);
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents,
      });
    }
  } catch (e) {
    handleSagaError(MERGE_ERROR, e);
  }
}

export function* toggleDisplayMergeModal() {
  yield takeLatest(TOGGLE_DISPLAY_MERGE_MODAL_REQUESTED, toggleDisplayMergeModalImpl);
}

export function* toggleDisplayMergeModalImpl() {
  const {
    displayMergeModal,
  } = yield select(selectIncidentActions);
  yield put({
    type: TOGGLE_DISPLAY_MERGE_MODAL_COMPLETED,
    displayMergeModal: !displayMergeModal,
  });
}

export function* resolveAsync() {
  yield takeLatest(RESOLVE_REQUESTED, resolve);
}

export function* resolve(action) {
  try {
    const {
      incidents, displayModal,
    } = action;
    const incidentsToBeResolved = filterIncidentsByField(incidents, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);

    // Build request manually given PUT
    const data = {
      incidents: incidentsToBeResolved.map((incident) => ({
        id: incident.id,
        type: 'incident_reference',
        status: RESOLVED,
      })),
    };

    const response = yield call(pd, {
      method: 'put',
      endpoint: 'incidents',
      data,
    });

    if (response.ok) {
      yield put({
        type: RESOLVE_COMPLETED,
        resolvedIncidents: response.resource,
      });
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: response.data.incidents,
      });
      if (displayModal) {
        const {
          actionAlertsModalType, actionAlertsModalMessage,
        } = generateIncidentActionModal(
          incidents,
          RESOLVED,
        );
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleSingleAPIErrorResponse(response);
    }
  } catch (e) {
    handleSagaError(RESOLVE_ERROR, e);
  }
}

export function* updatePriorityAsync() {
  yield takeLatest(UPDATE_PRIORITY_REQUESTED, updatePriority);
}

export function* updatePriority(action) {
  try {
    const {
      incidents: selectedIncidents, priorityId, displayModal,
    } = action;
    const {
      priorities,
    } = yield select(selectPriorities);
    const priorityName = priorities.filter((p) => p.id === priorityId)[0].name;

    // Build priority data object - handle unset priority
    let priorityData = {};
    if (priorityName === '--') {
      priorityData = null;
    } else {
      priorityData = {
        id: priorityId,
        type: 'priority_reference',
      };
    }

    // Build individual requests as the endpoint supports singular PUT
    const updatePriorityRequests = selectedIncidents.map((incident) => call(pd, {
      method: 'put',
      endpoint: `incidents/${incident.id}`,
      data: {
        incident: {
          type: 'incident',
          priority: priorityData,
        },
      },
    }));

    // Invoke parallel calls for optimal performance
    const responses = yield all(updatePriorityRequests);
    if (responses.every((response) => response.ok)) {
      yield put({
        type: UPDATE_PRIORITY_COMPLETED,
        updatedIncidentPriorities: responses,
      });
      const updatedIncidents = responses.map((response) => response.resource);
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents,
      });

      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been updated with priority')} = ${priorityName}`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleMultipleAPIErrorResponses(responses);
    }
  } catch (e) {
    handleSagaError(UPDATE_PRIORITY_ERROR, e);
  }
}

export function* addNoteAsync() {
  yield takeLatest(ADD_NOTE_REQUESTED, addNote);
}

export function* addNote(action) {
  try {
    const {
      incidents: selectedIncidents, note, displayModal,
    } = action;

    // Build individual requests as the endpoint supports singular POST
    const addNoteRequests = selectedIncidents.map((incident) => call(pd, {
      method: 'post',
      endpoint: `incidents/${incident.id}/notes`,
      data: { note: { content: note } },
    }));

    // Invoke parallel calls for optimal performance
    const responses = yield all(addNoteRequests);
    if (responses.every((response) => response.ok)) {
      yield put({
        type: ADD_NOTE_COMPLETED,
        updatedIncidentNotes: responses,
      });
      yield toggleDisplayAddNoteModalImpl();
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been updated with a note')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleMultipleAPIErrorResponses(responses);
    }
  } catch (e) {
    handleSagaError(ADD_NOTE_ERROR, e);
  }
}

export function* toggleDisplayAddNoteModal() {
  yield takeLatest(TOGGLE_DISPLAY_ADD_NOTE_MODAL_REQUESTED, toggleDisplayAddNoteModalImpl);
}

export function* toggleDisplayAddNoteModalImpl() {
  const {
    displayAddNoteModal,
  } = yield select(selectIncidentActions);
  yield put({
    type: TOGGLE_DISPLAY_ADD_NOTE_MODAL_COMPLETED,
    displayAddNoteModal: !displayAddNoteModal,
  });
}

export function* runCustomIncidentActionAsync() {
  yield takeLatest(RUN_CUSTOM_INCIDENT_ACTION_REQUESTED, runCustomIncidentAction);
}

export function* runCustomIncidentAction(action) {
  try {
    const {
      incidents: selectedIncidents, webhook, displayModal,
    } = action;

    // Build individual requests as the endpoint supports singular POST
    const customIncidentActionRequests = selectedIncidents.map((incident) => call(pd, {
      method: 'post',
      endpoint: `incidents/${incident.id}/custom_action`,
      data: {
        custom_action: {
          webhook: {
            id: webhook.id,
            type: 'webhook_reference',
          },
        },
      },
    }));

    // Invoke parallel calls for optimal performance
    const responses = yield all(customIncidentActionRequests);
    if (responses.every((response) => response.ok)) {
      yield put({
        type: RUN_CUSTOM_INCIDENT_ACTION_COMPLETED,
        customIncidentActionRequests: responses,
      });
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Custom Incident Action')} "${
          webhook.name
        }" ${i18next.t('triggered for')} ${i18next.t('incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleMultipleAPIErrorResponses(responses);
    }
  } catch (e) {
    handleSagaError(RUN_CUSTOM_INCIDENT_ACTION_ERROR, e);
  }
}

export function* syncWithExternalSystemAsync() {
  yield takeLatest(SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED, syncWithExternalSystem);
}

export function* syncWithExternalSystem(action) {
  try {
    const {
      incidents: selectedIncidents, webhook, displayModal,
    } = action;
    const {
      allSelected, selectedCount,
    } = yield select(selectIncidentTable);

    // Build individual requests as the endpoint supports singular PUT
    const externalSystemSyncRequests = selectedIncidents.map((incident) => {
      // Update existing references (assumption is there could be more than 1 system)
      const tempExternalReferences = [...incident.external_references];
      tempExternalReferences.push({
        type: 'external_reference',
        webhook: {
          type: 'webhook',
          id: webhook.id,
        },
        sync: true,
      });
      return call(pd, {
        method: 'put',
        endpoint: `incidents/${incident.id}`,
        data: {
          incident: {
            id: incident.id,
            type: 'incident',
            external_references: tempExternalReferences,
          },
        },
      });
    });

    // Invoke parallel calls for optimal performance
    const responses = yield all(externalSystemSyncRequests);
    if (responses.every((response) => response.ok)) {
      // Re-request incident data as external_reference is not available under ILE
      // eslint-disable-next-line max-len
      const updatedIncidentRequests = selectedIncidents.map((incident) => getIncidentByIdRequest(incident.id));
      const updatedIncidentResponses = yield all(updatedIncidentRequests);
      const updatedIncidents = updatedIncidentResponses.map((response) => response.data.incident);

      // Update selected incidents with newer incident data (to re-render components)
      const updatedSelectedRows = getObjectsFromList(
        updatedIncidents,
        selectedIncidents.map((incident) => incident.id),
        'id',
      );
      yield put({
        type: SELECT_INCIDENT_TABLE_ROWS_REQUESTED,
        allSelected,
        selectedCount,
        selectedRows: updatedSelectedRows,
      });

      const incidentUpdatesMap = Object.assign({}, ...updatedSelectedRows.map((incident) => ({
        [incident.id]: incident,
      })));
      yield put({
        type: PROCESS_LOG_ENTRIES_COMPLETED,
        incidentUpdatesMap,
        incidentAlertsMap: {},
        incidentNotesMap: {},
      });
      // Render modal
      yield put({
        type: SYNC_WITH_EXTERNAL_SYSTEM_COMPLETED,
        externalSystemSyncRequests: responses,
      });
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Synced with')} "${webhook.name}" ${i18next.t(
          'on',
        )} ${i18next.t('incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      handleMultipleAPIErrorResponses(responses);
    }
  } catch (e) {
    handleSagaError(SYNC_WITH_EXTERNAL_SYSTEM_ERROR, e);
  }
}
