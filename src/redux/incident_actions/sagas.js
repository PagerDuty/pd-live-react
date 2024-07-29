import {
  put, call, select, takeLatest, all,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  handleSagaError,
  handleSingleAPIErrorResponse,
  handleMultipleAPIErrorResponses,
  displayActionModal,
} from 'src/util/sagas';

import {
  SELECT_INCIDENT_TABLE_ROWS_REQUESTED,
} from 'src/redux/incident_table/actions';

import {
  getIncidentByIdRequest, // updateIncidentsList,
} from 'src/redux/incidents/sagas';

import selectPriorities from 'src/redux/priorities/selectors';
import selectIncidentTable from 'src/redux/incident_table/selectors';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  RESOLVED,
  SNOOZED,
  getSnoozeTimes,
  filterIncidentsByField,
  generateIncidentActionModal,
} from 'src/util/incidents';

import {
  getObjectsFromList, chunkArray,
} from 'src/util/helpers';
import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';
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
  MERGE_PROGRESS,
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
  MOVE_ALERTS_COMPLETED,
  MOVE_ALERTS_REQUESTED,
} from './actions';

import {
  PROCESS_LOG_ENTRIES_COMPLETED,
  UPDATE_INCIDENTS,
  getIncidentsAsync,
} from '../incidents/actions';

const chunkedPdAxiosRequestCalls = (
  incidentBodies,
  method = 'PUT',
  endpoint = 'incidents',
  chunkSize = 25,
) => {
  const incidentBodyChunks = chunkArray(incidentBodies, chunkSize);
  const calls = incidentBodyChunks.map((incidentBodyChunk) => call(
    throttledPdAxiosRequest,
    method,
    endpoint,
    null,
    {
      incidents: incidentBodyChunk,
    },
    {
      expiration: 5 * 60 * 1000,
      priority: 1,
    },
  ));
  return calls;
};

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

    const incidentBodies = incidentsToBeAcknowledged.map((incident) => ({
      id: incident.id,
      type: 'incident_reference',
      status: ACKNOWLEDGED,
    }));

    const calls = chunkedPdAxiosRequestCalls(incidentBodies);

    const responses = yield all(calls);

    const acknowledgedIncidents = responses
      .map((response) => (response.status === 200 ? response.data.incidents : []))
      .flat();
    const errors = responses.filter((response) => response.status !== 200);

    if (errors.length > 0) {
      yield call(handleMultipleAPIErrorResponses, errors);
    }

    if (acknowledgedIncidents.length > 0) {
      yield put({
        type: ACKNOWLEDGE_COMPLETED,
        acknowledgedIncidents,
      });
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: acknowledgedIncidents,
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
    }
  } catch (e) {
    yield call(handleSagaError, ACKNOWLEDGE_ERROR, e);
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
    const incidentBodies = selectedIncidents.map((incident) => ({
      id: incident.id,
      type: 'incident_reference',
      escalation_level: escalationLevel,
    }));

    const calls = chunkedPdAxiosRequestCalls(incidentBodies);
    const responses = yield all(calls);

    const escalatedIncidents = responses
      .map((response) => (response.status === 200 ? response.data.incidents : []))
      .flat();
    const errors = responses.filter((response) => response.status !== 200);

    if (errors.length > 0) {
      yield call(handleMultipleAPIErrorResponses, errors);
    }

    if (escalatedIncidents.length > 0) {
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: escalatedIncidents,
      });
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been manually escalated to level')} ${escalationLevel}`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
      yield put({
        type: ESCALATE_COMPLETED,
        escalatedIncidents,
      });
    }
  } catch (e) {
    yield call(handleSagaError, ESCALATE_ERROR, e);
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
    const incidentBodies = selectedIncidents.map((incident) => {
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
    });

    const calls = chunkedPdAxiosRequestCalls(incidentBodies);
    const responses = yield all(calls);

    const reassignedIncidents = responses
      .map((response) => (response.status === 200 ? response.data.incidents : []))
      .flat();
    const errors = responses.filter((response) => response.status !== 200);

    if (errors.length > 0) {
      yield call(handleMultipleAPIErrorResponses, errors);
    }

    if (reassignedIncidents.length > 0) {
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: reassignedIncidents,
      });

      yield toggleDisplayReassignModalImpl();
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been reassigned to')} ${assignment.name}`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
      yield put({
        type: REASSIGN_COMPLETED,
        reassignedIncidents,
      });
    }
  } catch (e) {
    yield call(handleSagaError, REASSIGN_ERROR, e);
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
    const addResponderRequests = selectedIncidents.map((incident) => call(
      throttledPdAxiosRequest,
      'POST',
      `incidents/${incident.id}/responder_requests`,
      null,
      {
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
      {
        priority: 1,
        expiration: 5 * 60 * 1000,
      },
    ));

    // Invoke parallel calls for optimal performance
    const responses = yield all(addResponderRequests);
    if (responses.every((response) => response.status >= 200 && response.status < 300)) {
      yield toggleDisplayAddResponderModalImpl();
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Requested additional response for')}
        ${i18next.t('incident')}(s) ${selectedIncidents.map((i) => i.incident_number).join(', ')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
      yield put({
        type: ADD_RESPONDER_COMPLETED,
        updatedIncidentResponderRequests: responses,
      });
    } else {
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    yield call(handleSagaError, ADD_RESPONDER_ERROR, e);
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
    const snoozeRequests = incidentsToBeSnoozed.map((incident) => call(
      throttledPdAxiosRequest,
      'POST',
      `incidents/${incident.id}/snooze`,
      null,
      {
        // Handle pre-built snoozes as well as custom durations
        duration: snoozeTimes[duration] ? snoozeTimes[duration].seconds : duration,
      },
      {
        priority: 1,
        expiration: 5 * 60 * 1000,
      },
    ));

    // Invoke parallel calls for optimal performance
    const responses = yield all(snoozeRequests);
    if (responses.every((response) => response.status >= 200 && response.status < 300)) {
      const updatedIncidents = responses.map((response) => response.data.incident);
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
      yield put({
        type: SNOOZE_COMPLETED,
        snoozedIncidents: updatedIncidents,
      });
    } else {
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    yield call(handleSagaError, SNOOZE_ERROR, e);
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
      displayMergeModal,
      // mergeProgress,
    } = yield select(selectIncidentActions);
    const {
      targetIncident, incidents, displayModal, addToTitleText,
    } = action;
    const incidentsToBeMerged = [...incidents];

    // split incidentsToBeMerged into chunks
    const incidentChunks = chunkArray(incidentsToBeMerged, 25);
    const incidentBodies = incidentChunks.map((chunk) => ({
      source_incidents: chunk.map((incident) => ({
        id: incident.id,
        type: 'incident_reference',
      })),
    }));

    const numRequests = incidentBodies.length + (addToTitleText ? 1 : 0);
    let complete = 0;
    yield put({
      type: MERGE_PROGRESS,
      mergeProgress: {
        total: numRequests,
        complete,
      },
    });

    const mergeRequests = incidentBodies.map((incidentBody) => call(
      throttledPdAxiosRequest,
      'PUT',
      `incidents/${targetIncident.id}/merge`,
      null,
      incidentBody,
      {
        priority: 1,
        expiration: 5 * 60 * 1000,
      },
    ));

    // eslint-disable-next-line no-restricted-syntax
    for (const mergeRequest of mergeRequests) {
      const response = yield mergeRequest;
      if (response.status !== 200) {
        yield call(handleSingleAPIErrorResponse, response);
        yield put({
          type: MERGE_ERROR,
          message: 'Error merging incidents',
        });
        yield getIncidentsAsync();
        return;
      }
      complete += 1;
      yield put({
        type: MERGE_PROGRESS,
        mergeProgress: {
          total: numRequests,
          complete,
        },
      });
    }

    const mergedIncidentResp = yield getIncidentByIdRequest(targetIncident.id);
    const mergedIncident = mergedIncidentResp.data.incident;
    const resolvedIncidents = incidentsToBeMerged.map((incident) => ({
      id: incident.id,
      status: RESOLVED,
    }));

    yield put({
      type: UPDATE_INCIDENTS,
      updatedIncidents: [...resolvedIncidents, mergedIncident],
    });

    if (addToTitleText) {
      yield put({
        type: MERGE_PROGRESS,
        mergeProgress: {
          total: numRequests,
          complete,
          updatingTitles: true,
        },
      });
      const titleUpdates = incidentsToBeMerged.map((incident) => call(
        throttledPdAxiosRequest,
        'PUT',
        `incidents/${incident.id}`,
        null,
        {
          incident: {
            type: 'incident_reference',
            title: `${addToTitleText} ${incident.title}`,
          },
        },
        {
          priority: 1,
          expiration: 5 * 60 * 1000,
        },
      ));
      const titleResponses = yield all(titleUpdates);

      const successes = titleResponses.filter((r) => r.status >= 200 && r.status < 300);
      if (successes.length !== titleResponses.length) {
        yield call(handleMultipleAPIErrorResponses, titleResponses);
      }
      const updatedIncidents = successes.map((r) => r.data.incident);
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents,
      });
    }
    if (displayModal) {
      const actionAlertsModalType = 'success';
      const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${incidentsToBeMerged
        .map((i) => i.incident_number)
        .join(', ')} ${i18next.t('and their alerts have been merged onto incident')}
        ${targetIncident.incident_number}`;
      yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
    }
    if (displayMergeModal) {
      yield toggleDisplayMergeModalImpl();
    }
    yield put({
      type: MERGE_COMPLETED,
      mergedIncident,
    });
  } catch (e) {
    yield call(handleSagaError, MERGE_ERROR, e);
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

    const incidentBodies = incidentsToBeResolved.map((incident) => ({
      id: incident.id,
      type: 'incident_reference',
      status: RESOLVED,
    }));

    const calls = chunkedPdAxiosRequestCalls(incidentBodies);

    const responses = yield all(calls);

    const resolvedIncidents = responses
      .map((response) => (response.status === 200 ? response.data.incidents : []))
      .flat();
    const errors = responses.filter((response) => response.status !== 200);

    if (errors.length > 0) {
      yield call(handleMultipleAPIErrorResponses, errors);
    }

    if (resolvedIncidents.length > 0) {
      yield put({
        type: RESOLVE_COMPLETED,
        resolvedIncidents,
      });
      yield put({
        type: UPDATE_INCIDENTS,
        updatedIncidents: resolvedIncidents,
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
    }
  } catch (e) {
    yield call(handleSagaError, RESOLVE_ERROR, e);
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
    const updatePriorityRequests = selectedIncidents.map((incident) => call(
      throttledPdAxiosRequest,
      'PUT',
      `incidents/${incident.id}`,
      null,
      {
        incident: {
          type: 'incident',
          priority: priorityData,
        },
      },
      {
        priority: 1,
        expiration: 5 * 60 * 1000,
      },
    ));

    // Invoke parallel calls for optimal performance
    const responses = yield all(updatePriorityRequests);
    if (responses.every((response) => response.status >= 200 && response.status < 300)) {
      yield put({
        type: UPDATE_PRIORITY_COMPLETED,
        updatedIncidentPriorities: responses,
      });
      const updatedIncidents = responses.map((response) => response.data.incident);
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
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    yield call(handleSagaError, UPDATE_PRIORITY_ERROR, e);
  }
}

export function* addNoteAsync() {
  yield takeLatest(ADD_NOTE_REQUESTED, addNote);
}

export function* addNote(action) {
  try {
    const {
      incidents: selectedIncidents, note, displayModal, toggleModal,
    } = action;

    // Build individual requests as the endpoint supports singular POST
    const addNoteRequests = selectedIncidents.map((incident) => call(
      throttledPdAxiosRequest,
      'POST',
      `incidents/${incident.id}/notes`,
      null,
      {
        note: {
          content: note,
        },
      },
      {
        priority: 1,
        expiration: 5 * 60 * 1000,
      },
    ));

    // Invoke parallel calls for optimal performance
    const responses = yield all(addNoteRequests);
    if (responses.every((response) => response.status >= 200 && response.status < 300)) {
      if (toggleModal) yield toggleDisplayAddNoteModalImpl();
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')} ${i18next.t('have been updated with a note')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
      yield put({
        type: ADD_NOTE_COMPLETED,
        updatedIncidentNotes: responses,
      });
    } else {
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    yield call(handleSagaError, ADD_NOTE_ERROR, e);
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
    const customIncidentActionRequests = selectedIncidents.map((incident) => call(
      throttledPdAxiosRequest,
      'POST',
      `incidents/${incident.id}/custom_action`,
      null,
      {
        custom_action: {
          webhook: {
            id: webhook.id,
            type: 'webhook_reference',
          },
        },
      },
      {
        priority: 1,
        expiration: 5 * 60 * 1000,
      },
    ));

    // Invoke parallel calls for optimal performance
    const responses = yield all(customIncidentActionRequests);
    if (responses.every((response) => response.status >= 200 && response.status < 300)) {
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
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    yield call(handleSagaError, RUN_CUSTOM_INCIDENT_ACTION_ERROR, e);
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
      return call(
        throttledPdAxiosRequest,
        'PUT',
        `incidents/${incident.id}`,
        null,
        {
          incident: {
            id: incident.id,
            type: 'incident',
            external_references: tempExternalReferences,
          },
        },
        {
          priority: 1,
          expiration: 5 * 60 * 1000,
        },
      );
    });

    // Invoke parallel calls for optimal performance
    const responses = yield all(externalSystemSyncRequests);
    if (responses.every((response) => response.status >= 200 && response.status < 300)) {
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

      const incidentUpdatesMap = Object.assign(
        {},
        ...updatedSelectedRows.map((incident) => ({
          [incident.id]: incident,
        })),
      );
      yield put({
        type: PROCESS_LOG_ENTRIES_COMPLETED,
        incidentUpdatesMap,
        incidentAlertsMap: {},
        incidentNotesMap: {},
        incidentInsertList: [],
        incidentAlertsUnlinkMap: {},
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
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    yield call(handleSagaError, SYNC_WITH_EXTERNAL_SYSTEM_ERROR, e);
  }
}

export function* moveAlertsAsync() {
  yield takeLatest(MOVE_ALERTS_REQUESTED, moveAlerts);
}

export function* moveAlerts(action) {
  const {
    fromIncidentId, toIncidentId, alerts, options,
  } = action;

  if (!fromIncidentId || !toIncidentId || !alerts || !options) {
    yield displayActionModal('error', 'Unable to move alerts');
    return;
  }

  if (!toIncidentId.startsWith('new')) {
    // move to existing incident
    const data = {
      alerts: alerts.map((alert) => ({
        id: alert.id,
        type: 'alert_reference',
        incident: {
          id: toIncidentId,
          type: 'incident_reference',
        },
      })),
    };
    const response = yield call(
      throttledPdAxiosRequest,
      'PUT',
      `incidents/${fromIncidentId}/alerts`,
      null,
      data,
    );
    if (!response || response.status !== 200) {
      yield displayActionModal('error', 'Unable to move alerts');
      return;
    }
    yield displayActionModal('success', 'Alerts moved');
    yield put({
      type: MOVE_ALERTS_COMPLETED,
    });
  } else {
    // move to new incident
    const incidentResponse = yield getIncidentByIdRequest(fromIncidentId);
    if (!incidentResponse || !incidentResponse.ok) {
      yield displayActionModal('error', 'Unable to retrieve incident');
      return;
    }
    const fromIncident = incidentResponse.data.incident;
    const serviceId = options.serviceId || fromIncident.service.id;
    const epId = options.epId || fromIncident.escalation_policy.id;
    const priorityId = options.priorityId || fromIncident.priority?.id || null;

    if (toIncidentId === 'new-each') {
      // create new incident for each alert
      const createIncidentsCalls = alerts.map((alert, idx) => call(throttledPdAxiosRequest, 'POST', 'incidents', null, {
        incident: {
          type: 'incident',
          title: alerts[idx].summary,
          service: {
            id: serviceId,
            type: 'service_reference',
          },
          escalation_policy: {
            id: epId,
            type: 'escalation_policy_reference',
          },
          urgency: options.urgency || fromIncident.urgency,
          priority: priorityId ? { id: priorityId, type: 'priority_reference' } : null,
        },
      }));
      const createIncidentsResponses = yield all(createIncidentsCalls);
      if (!createIncidentsResponses || createIncidentsResponses.some((r) => r.status !== 201)) {
        yield displayActionModal('error', 'Unable to create incidents');
        return;
      }
      const newIncidents = createIncidentsResponses.map((r) => r.data.incident);
      const newIncidentIds = newIncidents.map((i) => i.id);
      const data = {
        alerts: alerts.map((alert, idx) => ({
          id: alert.id,
          type: 'alert_reference',
          incident: {
            id: newIncidentIds[idx],
            type: 'incident_reference',
          },
        })),
      };
      const response = yield call(
        throttledPdAxiosRequest,
        'PUT',
        `incidents/${fromIncidentId}/alerts`,
        null,
        data,
      );
      if (!response || response.status !== 200) {
        yield displayActionModal('error', 'Unable to move alerts');
        return;
      }
      yield displayActionModal('success', 'Alerts moved');
      yield put({
        type: MOVE_ALERTS_COMPLETED,
      });
    } else if (toIncidentId === 'new') {
      // create new incident for all alerts
      const newIncidentData = {
        incident: {
          type: 'incident',
          title: options.summary || `Moved alerts from ${fromIncident.title}`,
          service: {
            id: serviceId,
            type: 'service_reference',
          },
          escalation_policy: {
            id: epId,
            type: 'escalation_policy_reference',
          },
          urgency: options.urgency || fromIncident.urgency,
          priority: priorityId ? { id: priorityId, type: 'priority_reference' } : null,
        },
      };

      const newIncidentResponse = yield call(
        throttledPdAxiosRequest,
        'POST',
        'incidents',
        null,
        newIncidentData,
      );
      if (!newIncidentResponse || newIncidentResponse.status !== 201) {
        yield displayActionModal('error', 'Unable to create incident');
        return;
      }
      const newIncident = newIncidentResponse.data.incident;
      const newIncidentId = newIncident.id;

      const data = {
        alerts: alerts.map((alert) => ({
          id: alert.id,
          type: 'alert_reference',
          incident: {
            id: newIncidentId,
            type: 'incident_reference',
          },
        })),
      };
      const response = yield call(
        throttledPdAxiosRequest,
        'PUT',
        `incidents/${fromIncidentId}/alerts`,
        null,
        data,
      );
      if (!response || response.status !== 200) {
        yield displayActionModal('error', 'Unable to move alerts');
        return;
      }
      yield displayActionModal('success', 'Alerts moved');
      yield put({
        type: MOVE_ALERTS_COMPLETED,
      });
    }
  }
}
