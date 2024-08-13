import {
  put, call, select, takeLatest, takeEvery, take,
} from 'redux-saga/effects';

import Fuse from 'fuse.js';

import RealUserMonitoring from 'src/config/monitoring';
import {
  pd,
  // throttledPdAxiosRequest,
  pdParallelFetch,
  resetLimiterWithRateLimit,
} from 'src/util/pd-api-wrapper';

import {
  filterIncidentsByField,
  filterIncidentsByFieldOfList,
  UPDATE_INCIDENT_REDUCER_STATUS,
  UPDATE_INCIDENT_LAST_FETCH_DATE,
} from 'src/util/incidents';

import {
  flattenObject,
} from 'src/util/helpers';

import fuseOptions from 'src/config/fuse-config';

import selectSettings from 'src/redux/settings/selectors';
import selectQuerySettings from 'src/redux/query_settings/selectors';
import selectIncidentTable from 'src/redux/incident_table/selectors';
import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'src/redux/connection/actions';

import {
  // UPDATE_RECENT_LOG_ENTRIES_COMPLETED,
  FETCH_LOG_ENTRIES_COMPLETED,
} from 'src/redux/log_entries/actions';

import {
  INCIDENTS_PAGINATION_LIMIT,
  DEBUG_SINCE_DATE,
  DEBUG_UNTIL_DATE,
} from 'src/config/constants';

import {
  FETCH_INCIDENTS_REQUESTED,
  FETCH_INCIDENTS_COMPLETED,
  FETCH_INCIDENTS_ERROR,
  FETCH_ALERTS_FOR_INCIDENTS_REQUESTED,
  FETCH_ALERTS_FOR_INCIDENTS_COMPLETED,
  // FETCH_ALERTS_FOR_INCIDENTS_ERROR,
  FETCH_NOTES_FOR_INCIDENTS_REQUESTED,
  FETCH_NOTES_FOR_INCIDENTS_COMPLETED,
  // FETCH_NOTES_FOR_INCIDENTS_ERROR,
  PROCESS_LOG_ENTRIES,
  PROCESS_LOG_ENTRIES_COMPLETED,
  // PROCESS_LOG_ENTRIES_ERROR,
  UPDATE_INCIDENTS,
  UPDATE_INCIDENTS_COMPLETED,
  // UPDATE_INCIDENTS_ERROR,
  UPDATE_INCIDENT_ALERTS,
  UPDATE_INCIDENT_ALERTS_COMPLETED,
  // UPDATE_INCIDENT_ALERTS_ERROR,
  UPDATE_INCIDENT_NOTES,
  UPDATE_INCIDENT_NOTES_COMPLETED,
  // UPDATE_INCIDENT_NOTES_ERROR,
  FILTER_INCIDENTS_LIST,
  FILTER_INCIDENTS_LIST_COMPLETED,
  FILTER_INCIDENTS_LIST_ERROR,
} from './actions';
import selectIncidents from './selectors';

export const getIncidentByIdRequest = (incidentId) => call(pd, {
  method: 'get',
  endpoint: `incidents/${incidentId}`,
  data: {
    'include[]': ['external_references'],
  },
});

export function* getIncidentsImpl() {
  //  Build params from query settings and call pd lib
  let incidents = [];
  try {
    yield put({
      type: UPDATE_INCIDENT_LAST_FETCH_DATE,
    });
    const {
      sinceDate, untilDate, incidentStatus, incidentUrgency, teamIds, serviceIds, userIds,
    } = yield select(selectQuerySettings);

    const since = DEBUG_SINCE_DATE
      ? new Date(DEBUG_SINCE_DATE).toISOString()
      : sinceDate.toISOString();
    let until;
    if (DEBUG_UNTIL_DATE) {
      until = new Date(DEBUG_UNTIL_DATE).toISOString();
    } else if (untilDate) {
      until = untilDate.toISOString();
    } else {
      until = new Date().toISOString();
    }

    const baseParams = {
      since,
      until,
      include: ['first_trigger_log_entries', 'external_references'],
      limit: INCIDENTS_PAGINATION_LIMIT,
      sort_by: 'incident_number:desc',
    };

    if (incidentStatus) baseParams.statuses = incidentStatus;
    if (incidentUrgency) baseParams.urgencies = incidentUrgency;
    if (teamIds.length) baseParams.team_ids = teamIds;
    if (serviceIds.length) baseParams.service_ids = serviceIds;
    if (userIds.length) baseParams.user_ids = userIds;

    incidents = yield call(pdParallelFetch, 'incidents', baseParams, null, {
      priority: 5,
      skipSort: true,
      maxRecords: 10000,
    });
  } catch (e) {
    yield put({ type: FETCH_INCIDENTS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: 'Unable to fetch incidents',
    });
  }
  // The incident list API may return duplicate incidents under some circumstances, so as a precaution we'll dedupe the list by incident.id
  // Also log a RUM error if we find any duplicates
  const duplicateIncidents = incidents.filter((incident, index, self) => self.findIndex((t) => t.id === incident.id) !== index);
  const numDuplicateIncidents = duplicateIncidents.length;
  if (numDuplicateIncidents > 0) {
    // eslint-disable-next-line no-console
    console.error('Duplicate incidents found', numDuplicateIncidents);
    RealUserMonitoring.trackError(new Error('Duplicate incidents found'), numDuplicateIncidents);
    incidents = incidents.filter((incident, index, self) => self.findIndex((t) => t.id === incident.id) === index);
  }

  return incidents;
}

export function* getIncidentsAsync() {
  yield takeLatest(FETCH_INCIDENTS_REQUESTED, getIncidents);
}

export function* getIncidents() {
  try {
    // Update status and fetch; this is required because we're manually calling getIncidents()
    yield put({
      type: UPDATE_INCIDENT_REDUCER_STATUS,
      status: FETCH_INCIDENTS_REQUESTED,
      fetchingIncidents: true,
    });

    const {
      maxRateLimit,
    } = yield select(selectSettings);
    yield call(resetLimiterWithRateLimit, maxRateLimit);

    const incidents = yield getIncidentsImpl();
    yield put({
      type: FETCH_INCIDENTS_COMPLETED,
      incidents,
    });

    yield call(filterIncidentsImpl);
  } catch (e) {
    yield put({ type: FETCH_INCIDENTS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: 'Unable to fetch incidents',
    });
  }
}

export function* getAlertsForIncidentsAsync() {
  yield takeEvery(FETCH_ALERTS_FOR_INCIDENTS_REQUESTED, getAlertsForIncidents);
}

export function* getAlertsForIncidents(action) {
  const {
    incidentIds,
  } = action;
  // split incident ids into chunks of 100
  const incidentIdChunks = [];
  for (let i = 0; i < incidentIds.length; i += 100) {
    incidentIdChunks.push(incidentIds.slice(i, i + 100));
  }
  // call pdParallelFetch for each chunk
  for (let i = 0; i < incidentIdChunks.length; i += 1) {
    const incidentIdChunk = incidentIdChunks[i];
    const alertsChunk = yield call(
      pdParallelFetch,
      'alerts',
      {
        incident_ids: incidentIdChunk,
        date_range: 'all',
      },
      undefined,
      { priority: 6 },
    );
    if (!(alertsChunk instanceof Array)) {
      RealUserMonitoring.trackError(new Error('alertsChunk is not an array'), alertsChunk);
      // eslint-disable-next-line no-continue
      continue;
    }
    const alertsChunkByIncidentId = incidentIdChunk.reduce((acc, incidentId) => {
      if (typeof incidentId !== 'string') {
        RealUserMonitoring.trackError(new Error('incidentId is not a string'), incidentId);
      } else {
        // eslint-disable-next-line no-param-reassign
        acc[incidentId] = [];
      }
      return acc;
    }, {});
    alertsChunk.forEach((alert) => {
      if (!alert?.incident?.id || !(alertsChunkByIncidentId[alert.incident.id] instanceof Array)) {
        RealUserMonitoring.trackError(
          new Error('alert is missing incident id or alertsChunkByIncidentId is not an array'),
          alert,
        );
        return;
      }
      alertsChunkByIncidentId[alert.incident.id].push(alert);
    });
    yield put({
      type: FETCH_ALERTS_FOR_INCIDENTS_COMPLETED,
      incidentAlertsMap: alertsChunkByIncidentId,
    });
  }
}

export function* getNotesForIncidentsAsync() {
  yield takeEvery(FETCH_NOTES_FOR_INCIDENTS_REQUESTED, getNotesForIncidents);
}

export function* getNotesForIncidents(action) {
  const {
    incidentIds,
  } = action;
  // split incident ids into chunks of 100
  const incidentIdChunks = [];
  for (let i = 0; i < incidentIds.length; i += 100) {
    incidentIdChunks.push(incidentIds.slice(i, i + 100));
  }
  // call pdParallelFetch for each chunk
  for (let i = 0; i < incidentIdChunks.length; i += 1) {
    const incidentIdChunk = incidentIdChunks[i];
    const notesChunk = yield call(
      pdParallelFetch,
      'notes',
      {
        incident_ids: incidentIdChunk,
      },
      undefined,
      { priority: 6 },
    );
    if (!(notesChunk instanceof Array)) {
      RealUserMonitoring.trackError(new Error('notesChunk is not an array'), notesChunk);
      // eslint-disable-next-line no-continue
      continue;
    }
    const notesChunkByIncidentId = incidentIdChunk.reduce((acc, incidentId) => {
      if (typeof incidentId !== 'string') {
        RealUserMonitoring.trackError(new Error('incidentId is not a string'), incidentId);
      } else {
        // eslint-disable-next-line no-param-reassign
        acc[incidentId] = [];
      }
      return acc;
    }, {});
    notesChunk.forEach((note) => {
      if (!note?.incident?.id || !(notesChunkByIncidentId[note.incident.id] instanceof Array)) {
        RealUserMonitoring.trackError(
          new Error('note is missing incident id or notesChunkByIncidentId is not an array'),
          note,
        );
        return;
      }
      notesChunkByIncidentId[note.incident.id].push(note);
    });
    // dispatch FETCH_NOTES_FOR_INCIDENTS_COMPLETED
    yield put({
      type: FETCH_NOTES_FOR_INCIDENTS_COMPLETED,
      incidentNotesMap: notesChunkByIncidentId,
    });
  }
}

export function* processLogEntries() {
  yield takeEvery(PROCESS_LOG_ENTRIES, processLogEntriesImpl);
}

export function* processLogEntriesImpl(action) {
  const {
    logEntries,
  } = action;

  take(FETCH_LOG_ENTRIES_COMPLETED);
  if (logEntries.length === 0) {
    // no log entries to process
    return;
  }

  const incidentInsertList = [];
  const incidentUpdatesMap = {};
  const incidentNotesMap = {};
  const incidentAlertsMap = {};
  const incidentAlertsUnlinkMap = {};
  const incidentLatestLogEntryMap = {};

  for (let i = 0; i < logEntries.length; i += 1) {
    const logEntry = logEntries[i];

    if (!logEntry.incident) {
      // log entry does not have an incident, skip
      RealUserMonitoring.trackError(new Error('Log entry does not have an incident'), logEntry);
      // eslint-disable-next-line no-continue
      continue;
    }
    // update latest log entry
    if (
      !incidentLatestLogEntryMap[logEntry.incident.id]
      || incidentLatestLogEntryMap[logEntry.incident.id].created_at < logEntry.created_at
    ) {
      incidentLatestLogEntryMap[logEntry.incident.id] = logEntry;
    }

    if (logEntry.type === 'trigger_log_entry') {
      // add new incident
      incidentInsertList.push(logEntry.incident);
    } else {
      // update incident -- because the log entries are sorted by created_at, we can just
      // update the incident in the map and it will be the latest version
      incidentUpdatesMap[logEntry.incident.id] = logEntry.incident;
    }

    if (logEntry.type === 'annotate_log_entry') {
      // update incident notes
      const note = {
        id: null, // This is missing in log_entries
        user: logEntry.agent,
        channel: {
          summary: 'The PagerDuty website or APIs',
        },
        content: logEntry.channel.summary,
        created_at: logEntry.created_at,
      };
      if (!incidentNotesMap[logEntry.incident.id]) {
        incidentNotesMap[logEntry.incident.id] = [];
      }
      incidentNotesMap[logEntry.incident.id].push(note);
    } else if (logEntry.type === 'link_log_entry') {
      // update incident alerts
      incidentUpdatesMap[logEntry.incident.id] = logEntry.incident;
      if (!incidentAlertsMap[logEntry.incident.id]) {
        incidentAlertsMap[logEntry.incident.id] = [];
      }
      incidentAlertsMap[logEntry.incident.id].push(logEntry.linked_incident);
    } else if (logEntry.type === 'unlink_log_entry') {
      // update incident alerts
      incidentUpdatesMap[logEntry.incident.id] = logEntry.incident;
      if (!incidentAlertsUnlinkMap[logEntry.incident.id]) {
        incidentAlertsUnlinkMap[logEntry.incident.id] = [];
      }
      incidentAlertsUnlinkMap[logEntry.incident.id].push(logEntry.linked_incident);
    }
  }

  yield put({
    type: PROCESS_LOG_ENTRIES_COMPLETED,
    incidentInsertList,
    incidentUpdatesMap,
    incidentNotesMap,
    incidentAlertsMap,
    incidentAlertsUnlinkMap,
    incidentLatestLogEntryMap,
  });
  yield call(filterIncidentsImpl);
}
export function* updateIncidents() {
  yield takeEvery(UPDATE_INCIDENTS, updateIncidentsImpl);
}

export function* updateIncidentsImpl(action) {
  const {
    updatedIncidents,
  } = action;
  yield put({
    type: UPDATE_INCIDENTS_COMPLETED,
    updatedIncidents,
  });
  yield put({
    type: FILTER_INCIDENTS_LIST,
  });
}

export function* updateIncidentAlerts() {
  yield takeEvery(UPDATE_INCIDENT_ALERTS, updateIncidentAlertsImpl);
}

export function* updateIncidentAlertsImpl(action) {
  const {
    incidentId, alerts,
  } = action;
  yield put({
    type: UPDATE_INCIDENT_ALERTS_COMPLETED,
    incidentId,
    alerts,
  });
}

export function* updateIncidentNotes() {
  yield takeEvery(UPDATE_INCIDENT_NOTES, updateIncidentNotesImpl);
}

export function* updateIncidentNotesImpl(action) {
  const {
    incidentId, notes,
  } = action;
  yield put({
    type: UPDATE_INCIDENT_NOTES_COMPLETED,
    incidentId,
    notes,
  });
}

export function* filterIncidents() {
  yield takeLatest(FILTER_INCIDENTS_LIST, filterIncidentsImpl);
}

export function* filterIncidentsImpl() {
  const {
    incidents, incidentNotes, incidentAlerts,
  } = yield select(selectIncidents);
  const {
    incidentPriority,
    incidentStatus,
    incidentUrgency,
    teamIds,
    escalationPolicyIds,
    serviceIds,
    userIds,
    searchQuery,
  } = yield select(selectQuerySettings);

  const {
    incidentTableColumns,
  } = yield select(selectIncidentTable);
  const {
    searchAllCustomDetails, respondersInEpFilter, fuzzySearch,
  } = yield select(selectSettings);

  let filteredIncidentsByQuery = [...incidents];

  try {
    // Filter current incident list by priority
    if (incidentPriority?.length > 0) {
      filteredIncidentsByQuery = filteredIncidentsByQuery.filter((incident) => {
        if (incident.priority && incidentPriority.includes(incident.priority.id)) return true;
        if (!incident.priority && incidentPriority.includes('--')) return true;
        return false;
      });
    }

    // Filter current incident list by status
    if (incidentStatus?.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery,
        'status',
        incidentStatus,
      );
    }

    // Filter current incident list by urgency
    if (incidentUrgency?.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery,
        'urgency',
        incidentUrgency,
      );
    }

    // Filter current incident list by team
    if (teamIds?.length) {
      filteredIncidentsByQuery = filterIncidentsByFieldOfList(
        filteredIncidentsByQuery,
        'teams',
        'id',
        teamIds,
      );
    }

    // Filter current incident list by escalation policy
    if (escalationPolicyIds?.length > 0) {
      filteredIncidentsByQuery = filteredIncidentsByQuery.filter((incident) => {
        if (escalationPolicyIds.includes(incident.escalation_policy.id)) return true;
        if (respondersInEpFilter && incident.responder_requests.length > 0) {
          const responderRequestTargets = incident.responder_requests
            .map((responderRequest) => responderRequest.responder_request_targets
              .filter(
                // eslint-disable-next-line max-len
                (responderRequestTarget) => responderRequestTarget.responder_request_target.type === 'escalation_policy',
              )
              .map((responderRequestTarget) => responderRequestTarget.responder_request_target.id)
              .flat())
            .flat();
          if (
            escalationPolicyIds.some((escalationPolicyId) => responderRequestTargets.includes(escalationPolicyId))
          ) return true;
        }

        return false;
      });
    }

    // Filter current incident list by service
    if (serviceIds?.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery,
        'service.id',
        serviceIds,
      );
    }

    // Filter current incident list by user
    if (userIds?.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByFieldOfList(
        filteredIncidentsByQuery,
        'assignments',
        'assignee.id',
        userIds,
      );
    }

    // Filter current incident list by search query
    // Update Fuse options to include custom alert JSON to be searched
    if (searchQuery && searchQuery.trim() !== '') {
      const updatedFuseOptions = { ...fuseOptions };
      const customAlertDetailColumnKeys = incidentTableColumns
        .filter((col) => !!col.accessorPath)
        .map((col) => {
          // Handle case when '[*]' accessors are used
          const strippedAccessor = col.accessorPath.replace(/([[*\]])/g, '.');
          return (
            // custom details are in both body.cef_details.details and body.details for events
            // but only body.details is guaranteed to exist, and won't be null
            // body.cef_details.details can be null if the alert is from an email
            `alerts.body.${strippedAccessor}`
              .split('.')
              // Handle case when special character is wrapped in quotation marks
              .map((a) => (a.includes("'") ? a.replaceAll("'", '') : a))
              // Handle empty paths from injection into strippedAccessor
              .filter((a) => a !== '')
          );
        });
      updatedFuseOptions.keys = [...fuseOptions.keys, ...customAlertDetailColumnKeys];

      if (searchAllCustomDetails) {
        updatedFuseOptions.keys = [...updatedFuseOptions.keys, 'alerts.flattedCustomDetails'];
      }

      if (!fuzzySearch) {
        updatedFuseOptions.threshold = 0.0;
      }

      try {
        const incidentsForSearch = filteredIncidentsByQuery.map((incident) => {
          const incidentNotesForSearch = incidentNotes[incident.id] instanceof Array ? incidentNotes[incident.id] : [];
          // eslint-disable-next-line max-len
          const incidentAlertsForSearch = incidentAlerts[incident.id] instanceof Array ? incidentAlerts[incident.id] : [];
          const incidentAlertsForSearchWithFlattedCustomDetails = incidentAlertsForSearch.map(
            (alert) => {
              // custom details are in both body.cef_details.details and body.details for events
              // but only body.details is guaranteed to exist, and won't be null
              // body.cef_details.details can be null if the alert is from an email
              const flattedCustomDetails = alert.body?.details
                ? Object.values(flattenObject(alert.body.details)).join(' ')
                : '';
              return {
                ...alert,
                flattedCustomDetails,
              };
            },
          );
          return {
            ...incident,
            notes: incidentNotesForSearch,
            alerts: incidentAlertsForSearchWithFlattedCustomDetails,
          };
        });

        const fuse = new Fuse(incidentsForSearch, updatedFuseOptions);
        filteredIncidentsByQuery = fuse
          .search(searchQuery)
          .map((res) => filteredIncidentsByQuery[res.refIndex]);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error in Fuse search', e);
      }
    }

    const incidentIdsNeedingAlertsFetched = filteredIncidentsByQuery
      .filter((incident) => !incidentAlerts[incident.id])
      .map((incident) => incident.id);

    yield put({
      type: FETCH_ALERTS_FOR_INCIDENTS_REQUESTED,
      incidentIds: incidentIdsNeedingAlertsFetched,
    });

    const incidentIdsNeedingNotesFetched = filteredIncidentsByQuery
      .filter((incident) => !incidentNotes[incident.id])
      .map((incident) => incident.id);

    yield put({
      type: FETCH_NOTES_FOR_INCIDENTS_REQUESTED,
      incidentIds: incidentIdsNeedingNotesFetched,
    });
    yield put({
      type: FILTER_INCIDENTS_LIST_COMPLETED,
      filteredIncidentsByQuery,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_ERROR,
      message: e.message,
    });
  }
}
