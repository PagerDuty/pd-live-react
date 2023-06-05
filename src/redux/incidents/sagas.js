import {
  put, call, select, takeLatest, takeEvery, take,
} from 'redux-saga/effects';

import Fuse from 'fuse.js';

import {
  pd,
  // throttledPdAxiosRequest,
  pdParallelFetch,
  resetLimiterWithRateLimit,
} from 'util/pd-api-wrapper';

import {
  filterIncidentsByField,
  filterIncidentsByFieldOfList,
  UPDATE_INCIDENT_REDUCER_STATUS,
  UPDATE_INCIDENT_LAST_FETCH_DATE,
} from 'util/incidents';
// import {
//   pushToArray,
// } from 'util/helpers';
import fuseOptions from 'config/fuse-config';

import selectSettings from 'redux/settings/selectors';
import selectQuerySettings from 'redux/query_settings/selectors';
import selectIncidentTable from 'redux/incident_table/selectors';
import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';

import {
  // UPDATE_RECENT_LOG_ENTRIES_COMPLETED,
  FETCH_LOG_ENTRIES_COMPLETED,
} from 'redux/log_entries/actions';

import {
  INCIDENTS_PAGINATION_LIMIT, DEBUG_SINCE_DATE, DEBUG_UNTIL_DATE,
} from 'config/constants';

import {
  FETCH_INCIDENTS_REQUESTED,
  FETCH_INCIDENTS_COMPLETED,
  FETCH_INCIDENTS_ERROR,
  // REFRESH_INCIDENTS_REQUESTED,
  // REFRESH_INCIDENTS_COMPLETED,
  // REFRESH_INCIDENTS_ERROR,
  FETCH_INCIDENT_ALERTS_REQUESTED,
  FETCH_INCIDENT_ALERTS_COMPLETED,
  FETCH_INCIDENT_ALERTS_ERROR,
  FETCH_INCIDENT_NOTES_REQUESTED,
  FETCH_INCIDENT_NOTES_COMPLETED,
  FETCH_INCIDENT_NOTES_ERROR,
  // FETCH_ALL_INCIDENT_NOTES_REQUESTED,
  // FETCH_ALL_INCIDENT_NOTES_COMPLETED,
  // FETCH_ALL_INCIDENT_NOTES_ERROR,
  // FETCH_ALL_INCIDENT_ALERTS_REQUESTED,
  // FETCH_ALL_INCIDENT_ALERTS_COMPLETED,
  // FETCH_ALL_INCIDENT_ALERTS_ERROR,
  // UPDATE_INCIDENTS_LIST,
  // UPDATE_INCIDENTS_LIST_COMPLETED,
  // UPDATE_INCIDENTS_LIST_ERROR,
  PROCESS_LOG_ENTRIES,
  PROCESS_LOG_ENTRIES_COMPLETED,
  // PROCESS_LOG_ENTRIES_ERROR,
  UPDATE_INCIDENT_ALERTS,
  UPDATE_INCIDENT_ALERTS_COMPLETED,
  // UPDATE_INCIDENT_ALERTS_ERROR,
  UPDATE_INCIDENT_NOTES,
  UPDATE_INCIDENT_NOTES_COMPLETED,
  // UPDATE_INCIDENT_NOTES_ERROR,
  FILTER_INCIDENTS_LIST,
  FILTER_INCIDENTS_LIST_COMPLETED,
  FILTER_INCIDENTS_LIST_ERROR,
  FILTER_INCIDENTS_LIST_BY_PRIORITY,
  FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR,
  FILTER_INCIDENTS_LIST_BY_STATUS,
  FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_STATUS_ERROR,
  FILTER_INCIDENTS_LIST_BY_URGENCY,
  FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR,
  FILTER_INCIDENTS_LIST_BY_TEAM,
  FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_TEAM_ERROR,
  FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY,
  FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_ERROR,
  FILTER_INCIDENTS_LIST_BY_SERVICE,
  FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR,
  FILTER_INCIDENTS_LIST_BY_USER,
  FILTER_INCIDENTS_LIST_BY_USER_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_USER_ERROR,
  FILTER_INCIDENTS_LIST_BY_QUERY,
  FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
  FILTER_INCIDENTS_LIST_BY_QUERY_ERROR,
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
      sinceDate, incidentStatus, incidentUrgency, teamIds, serviceIds, userIds,
    } = yield select(selectQuerySettings);
    const {
      serverSideFiltering,
    } = yield select(selectSettings);

    const baseParams = {
      since: DEBUG_SINCE_DATE ? new Date(DEBUG_SINCE_DATE).toISOString() : sinceDate.toISOString(),
      until: DEBUG_UNTIL_DATE ? new Date(DEBUG_UNTIL_DATE).toISOString() : new Date().toISOString(),
      include: ['first_trigger_log_entries', 'external_references'],
      limit: INCIDENTS_PAGINATION_LIMIT,
      sort_by: 'created_at:desc',
    };

    if (serverSideFiltering) {
      if (incidentStatus) baseParams.statuses = incidentStatus;
      if (incidentUrgency) baseParams.urgencies = incidentUrgency;
      if (teamIds.length) baseParams.team_ids = teamIds;
      if (serviceIds.length) baseParams.service_ids = serviceIds;
      if (userIds.length) baseParams.user_ids = userIds;
    }

    incidents = yield call(pdParallelFetch, 'incidents', baseParams);
  } catch (e) {
    yield put({ type: FETCH_INCIDENTS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: 'Unable to fetch incidents',
    });
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

    // Filter incident list on priority (can't do this from API)
    // yield call(filterIncidentsByPriorityImpl, { incidentPriority });
    // Filter incident list on escalation policy (can't do this from API)
    // yield call(filterIncidentsByEscalationPolicyImpl, { escalationPolicyIds });

    // Filter updated incident list by query; updates memoized data within incidents table
    // yield call(filterIncidentsByQueryImpl, { searchQuery });
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

// export function* refreshIncidentsAsync() {
//   yield takeLatest(REFRESH_INCIDENTS_REQUESTED, refreshIncidents);
// }

// export function* refreshIncidents() {
//   try {
//     // Fetch incidents, notes, and alerts for refresh
//     const {
//       incidentPriority, escalationPolicyIds, searchQuery,
//     } = yield select(
//       selectQuerySettings,
//     );

//     // const {
//     //   maxRateLimit,
//     // } = yield select(selectSettings);

//     // yield call(resetLimiterWithRateLimit, maxRateLimit);
//     const incidents = yield getIncidentsImpl();
//     yield put({
//       type: REFRESH_INCIDENTS_COMPLETED,
//       incidents,
//     });
//     // Filter incident list on priority (can't do this from API)
//     yield call(filterIncidentsByPriorityImpl, { incidentPriority });
//     // Filter incident list on escalation policy (can't do this from API)
//     yield call(filterIncidentsByEscalationPolicyImpl, { escalationPolicyIds });
//     // Filter updated incident list by query; updates memoized data within incidents table
//     yield call(filterIncidentsByQueryImpl, { searchQuery });

//     // yield call(getAllIncidentNotes);
//     // yield call(getAllIncidentAlerts);
//   } catch (e) {
//     yield put({ type: REFRESH_INCIDENTS_ERROR, message: e.message });
//     yield put({
//       type: UPDATE_CONNECTION_STATUS_REQUESTED,
//       connectionStatus: 'neutral',
//       connectionStatusMessage: 'Unable to refresh incidents',
//     });
//   }
// }

export function* getIncidentAlertsAsync() {
  yield takeEvery(FETCH_INCIDENT_ALERTS_REQUESTED, getIncidentAlerts);
}

export function* getIncidentAlerts(action) {
  const {
    incidentId,
  } = action;
  try {
    const alerts = yield call(
      pdParallelFetch, `incidents/${incidentId}/alerts`, undefined, undefined, { priority: 6 },
    );

    yield put({
      type: FETCH_INCIDENT_ALERTS_COMPLETED,
      incidentId,
      alerts,
    });
  } catch (e) {
    yield put({
      type: FETCH_INCIDENT_ALERTS_ERROR,
      incidentId,
      message: e.message,
    });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: 'Unable to fetch incident alerts',
    });
  }
}

export function* getIncidentNotesAsync() {
  yield takeEvery(FETCH_INCIDENT_NOTES_REQUESTED, getIncidentNotes);
}

export function* getIncidentNotes(action) {
  const {
    incidentId,
  } = action;
  try {
    const notes = yield call(
      pdParallelFetch, `incidents/${incidentId}/notes`, undefined, undefined, { priority: 6 },
    );

    yield put({
      type: FETCH_INCIDENT_NOTES_COMPLETED,
      incidentId,
      notes,
    });
  } catch (e) {
    yield put({
      type: FETCH_INCIDENT_NOTES_ERROR,
      incidentId,
      message: e.message,
    });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: 'Unable to fetch incident notes',
    });
  }
}

// export function* getAllIncidentNotesAsync() {
//   yield takeEvery(FETCH_ALL_INCIDENT_NOTES_REQUESTED, getAllIncidentNotes);
// }

// export function* getAllIncidentNotes() {
//   try {
//     yield put({
//       type: UPDATE_INCIDENT_REDUCER_STATUS,
//       status: FETCH_ALL_INCIDENT_NOTES_REQUESTED,
//       fetchingIncidentNotes: true,
//     });

//     // Build list of promises to call PD endpoint
//     const {
//       incidents,
//     } = yield select(selectIncidents);
//     const requests = incidents.map(({
//       id,
//     }) => call(throttledPdAxiosRequest, 'GET', `incidents/${id}/notes`));
//     const results = yield all(requests);

//     // Grab matching incident and apply note update
//     const updatedIncidentsList = incidents.map((incident, idx) => {
//       const tempIncident = { ...incident };
//       tempIncident.notes = results[idx].data.notes;
//       return tempIncident;
//     });

//     // Update store with incident having notes data
//     yield put({
//       type: FETCH_ALL_INCIDENT_NOTES_COMPLETED,
//       incidents: updatedIncidentsList,
//     });

//     /*
//       Apply filters that already are configured down below
//     */
//     const {
//       incidentPriority,
//       incidentStatus,
//       incidentUrgency,
//       teamIds,
//       escalationPolicyIds,
//       serviceIds,
//       userIds,
//       searchQuery,
//     } = yield select(selectQuerySettings);
//     yield call(filterIncidentsByPriorityImpl, { incidentPriority });
//     yield call(filterIncidentsByStatusImpl, { incidentStatus });
//     yield call(filterIncidentsByUrgencyImpl, { incidentUrgency });
//     yield call(filterIncidentsByTeamImpl, { teamIds });
//     yield call(filterIncidentsByEscalationPolicyImpl, { escalationPolicyIds });
//     yield call(filterIncidentsByServiceImpl, { serviceIds });
//     yield call(filterIncidentsByUserImpl, { userIds });
//     yield call(filterIncidentsByQueryImpl, { searchQuery });
//   } catch (e) {
//     yield put({ type: FETCH_ALL_INCIDENT_NOTES_ERROR, message: e.message });
//     yield put({
//       type: UPDATE_CONNECTION_STATUS_REQUESTED,
//       connectionStatus: 'neutral',
//       connectionStatusMessage: 'Unable to fetch all incident notes',
//     });
//   }
// }

// export function* getAllIncidentAlertsAsync() {
//   yield takeEvery(FETCH_ALL_INCIDENT_ALERTS_REQUESTED, getAllIncidentAlerts);
// }

// export function* getAllIncidentAlerts() {
//   try {
//     yield put({
//       type: UPDATE_INCIDENT_REDUCER_STATUS,
//       status: FETCH_ALL_INCIDENT_ALERTS_REQUESTED,
//       fetchingIncidentAlerts: true,
//     });

//     // Build list of promises to call PD endpoint
//     const {
//       incidents,
//     } = yield select(selectIncidents);
//     const requests = incidents.map(({
//       id,
//     }) => call(throttledPdAxiosRequest, 'GET', `incidents/${id}/alerts`));
//     const results = yield all(requests);

//     // Grab matching incident and apply alert update
//     const updatedIncidentsList = incidents.map((incident, idx) => {
//       const tempIncident = { ...incident };
//       tempIncident.alerts = results[idx].data.alerts;
//       return tempIncident;
//     });

//     // Update store with incident having alerts data
//     yield put({
//       type: FETCH_ALL_INCIDENT_ALERTS_COMPLETED,
//       incidents: updatedIncidentsList,
//     });

//     /*
//       Apply filters that already are configured down below
//     */
//     const {
//       incidentPriority,
//       incidentStatus,
//       incidentUrgency,
//       teamIds,
//       escalationPolicyIds,
//       serviceIds,
//       userIds,
//       searchQuery,
//     } = yield select(selectQuerySettings);
//     yield call(filterIncidentsByPriorityImpl, { incidentPriority });
//     yield call(filterIncidentsByStatusImpl, { incidentStatus });
//     yield call(filterIncidentsByUrgencyImpl, { incidentUrgency });
//     yield call(filterIncidentsByTeamImpl, { teamIds });
//     yield call(filterIncidentsByEscalationPolicyImpl, { escalationPolicyIds });
//     yield call(filterIncidentsByServiceImpl, { serviceIds });
//     yield call(filterIncidentsByUserImpl, { userIds });
//     yield call(filterIncidentsByQueryImpl, { searchQuery });
//   } catch (e) {
//     yield put({ type: FETCH_ALL_INCIDENT_ALERTS_ERROR, message: e.message });
//     yield put({
//       type: UPDATE_CONNECTION_STATUS_REQUESTED,
//       connectionStatus: 'neutral',
//       connectionStatusMessage: 'Unable to fetch all incident alerts',
//     });
//   }
// }

// export function* updateIncidentsListAsync() {
//   yield takeEvery(UPDATE_INCIDENTS_LIST, updateIncidentsList);
// }

// export function* updateIncidentsList(action) {
//   try {
//     take(UPDATE_RECENT_LOG_ENTRIES_COMPLETED);
//     const {
//       addList, updateList,
//     } = action;
//     const {
//       incidents,
//     } = yield select(selectIncidents);
//     const {
//       incidentPriority,
//       incidentStatus,
//       incidentUrgency,
//       teamIds,
//       escalationPolicyIds,
//       serviceIds,
//       userIds,
//       searchQuery,
//     } = yield select(selectQuerySettings);
//     let updatedIncidentsList = [...incidents];

//     // Add new incidents to list (need to re-query to get external_references, notes, and alerts)
//     const addListRequests = addList.map((addItem) => {
//       if (addItem.incident) return getIncidentByIdRequest(addItem.incident.id);
//     });
//     const addListResponses = yield all(addListRequests);
//     const addListNoteRequests = addList.map((addItem) => {
//       if (addItem.incident) return call(pd.get, `incidents/${addItem.incident.id}/notes`);
//     });
//     const addListNoteResponses = yield all(addListNoteRequests);
//     const addListAlertRequests = addList.map((addItem) => {
//       if (addItem.incident) return call(pd.get, `incidents/${addItem.incident.id}/alerts`);
//     });
//     const addListAlertResponses = yield all(addListAlertRequests);

//     // Synthetically create notes + alerts object to be added to new incident
//     addListResponses.map((response, idx) => {
//       const {
//         notes,
//       } = addListNoteResponses[idx].response.data;
//       const {
//         alerts,
//       } = addListAlertResponses[idx].response.data;
//       const newIncident = { ...response.data.incident };
//       newIncident.notes = notes;
//       newIncident.alerts = alerts;
//       updatedIncidentsList.push(newIncident);
//     });

//     // Update existing incidents within list including resolved
//     if (incidents.length && updateList.length) {
//       updatedIncidentsList = updatedIncidentsList.map((existingIncident) => {
//         // Iteratively patch incident with multiple associated log entries
//         let updatedIncident = null;
//         const updateItems = updateList.filter((updateItem) => {
//           if (updateItem.incident) return updateItem.incident.id === existingIncident.id;
//         });
//         updateItems.forEach((updateItem) => {
//           updatedIncident = { ...existingIncident, ...updatedIncident, ...updateItem.incident };
//         });
//         return updatedIncident || existingIncident;
//       });
//     }

//     // Handle where new updates come in against an empty incident list or filtered out incidents
//     if (updateList.length) {
//       updateList.map((updateItem) => {
//         if (updateItem.incident) {
//           // Check if item is matched against updatedIncidentsList (skip)
//           if (updatedIncidentsList.find((incident) => incident.id === updateItem.incident.id)) {
//             return;
//           }
//           // Update incident list (push if we haven't updated already)
//           pushToArray(updatedIncidentsList, updateItem.incident, 'id');
//         }
//       });
//     }

//     // Sort incidents by reverse created_at date (i.e. recent incidents at the top)
//     updatedIncidentsList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//     // Remove any unintentional duplicate incidents (i.e. new incident triggered)
//     const updatedIncidentsIds = updatedIncidentsList.map((o) => o.id);
//     const uniqueUpdatedIncidentsList = updatedIncidentsList.filter(
//       ({
//         id,
//       }, index) => !updatedIncidentsIds.includes(id, index + 1),
//     );

//     // Update store with updated list of incidents
//     yield put({
//       type: UPDATE_INCIDENTS_LIST_COMPLETED,
//       incidents: uniqueUpdatedIncidentsList,
//     });

//     /*
//       Apply filters that already are configured down below
//     */

//     // Filter updated incident list on priority (can't do this from API)
//     yield call(filterIncidentsByPriorityImpl, { incidentPriority });
//     yield call(filterIncidentsByStatusImpl, { incidentStatus });
//     yield call(filterIncidentsByUrgencyImpl, { incidentUrgency });
//     yield call(filterIncidentsByTeamImpl, { teamIds });
//     yield call(filterIncidentsByEscalationPolicyImpl, { escalationPolicyIds });
//     yield call(filterIncidentsByServiceImpl, { serviceIds });
//     yield call(filterIncidentsByUserImpl, { userIds });
//     yield call(filterIncidentsByQueryImpl, { searchQuery });
//   } catch (e) {
//     yield put({ type: UPDATE_INCIDENTS_LIST_ERROR, message: e.message });
//   }
// }

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

  for (let i = 0; i < logEntries.length; i += 1) {
    const logEntry = logEntries[i];

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
    }
  }

  yield put({
    type: PROCESS_LOG_ENTRIES_COMPLETED,
    incidentInsertList,
    incidentUpdatesMap,
    incidentNotesMap,
    incidentAlertsMap,
  });
  yield call(filterIncidentsImpl);
}

export function* updateIncidentAlerts() {
  yield takeEvery(UPDATE_INCIDENT_ALERTS, updateIncidentAlertsImpl);
}

export function* updateIncidentAlertsImpl(action) {
  const {
    incidentId,
    alerts,
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
    incidentId,
    notes,
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
    incidents,
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

  let filteredIncidentsByQuery = [...incidents];

  try {
    // Filter current incident list by priority
    if (incidentPriority.length > 0) {
      filteredIncidentsByQuery = filteredIncidentsByQuery.filter((incident) => {
        if (incident.priority && incidentPriority.includes(incident.priority.id)) return true;
        if (!incident.priority && incidentPriority.includes('--')) return true;
        return false;
      });
    }

    // Filter current incident list by status
    if (incidentStatus.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery,
        'status',
        incidentStatus,
      );
    }

    // Filter current incident list by urgency
    if (incidentUrgency.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery,
        'urgency',
        incidentUrgency,
      );
    }

    // Filter current incident list by team
    if (teamIds.length) {
      filteredIncidentsByQuery = filterIncidentsByFieldOfList(
        filteredIncidentsByQuery, 'teams', 'id', teamIds,
      );
    }

    // Filter current incident list by escalation policy
    if (escalationPolicyIds.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery,
        'escalation_policy.id',
        escalationPolicyIds,
      );
    }

    // Filter current incident list by service
    if (serviceIds.length > 0) {
      filteredIncidentsByQuery = filterIncidentsByField(
        filteredIncidentsByQuery, 'service.id', serviceIds,
      );
    }

    // Filter current incident list by user
    if (userIds.length > 0) {
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
            `alerts.body.cef_details.${strippedAccessor}`
              .split('.')
              // Handle case when special character is wrapped in quotation marks
              .map((a) => (a.includes("'") ? a.replaceAll("'", '') : a))
              // Handle empty paths from injection into strippedAccessor
              .filter((a) => a !== '')
          );
        });
      updatedFuseOptions.keys = fuseOptions.keys.concat(customAlertDetailColumnKeys);

      const fuse = new Fuse(filteredIncidentsByQuery, updatedFuseOptions);
      filteredIncidentsByQuery = fuse.search(searchQuery).map((res) => res.item);
    }

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

export function* filterIncidentsByPriority() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_PRIORITY, filterIncidentsByPriorityImpl);
}

export function* filterIncidentsByPriorityImpl(action) {
  // Filter current incident list by priority
  try {
    const {
      incidentPriority,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    const filteredIncidentsByPriorityList = incidents.filter((incident) => {
      // Incident priority is not always defined
      if (incident.priority && incidentPriority.includes(incident.priority.id)) return true;
      if (!incident.priority && incidentPriority.includes('--')) return true;
      return false;
    });
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_PRIORITY_COMPLETED,
      incidents: filteredIncidentsByPriorityList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_PRIORITY_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByStatus() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_STATUS, filterIncidentsByStatusImpl);
}

export function* filterIncidentsByStatusImpl(action) {
  // Filter current incident list by status
  try {
    const {
      incidentStatus,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    const filteredIncidentsByStatusList = filterIncidentsByField(
      incidents,
      'status',
      incidentStatus,
    );
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_STATUS_COMPLETED,
      incidents: filteredIncidentsByStatusList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_STATUS_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByUrgency() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_URGENCY, filterIncidentsByUrgencyImpl);
}

export function* filterIncidentsByUrgencyImpl(action) {
  // Filter current incident list by urgency
  try {
    const {
      incidentUrgency,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    const filteredIncidentsByUrgencyList = filterIncidentsByField(
      incidents,
      'urgency',
      incidentUrgency,
    );
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_URGENCY_COMPLETED,
      incidents: filteredIncidentsByUrgencyList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_URGENCY_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByTeam() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_TEAM, filterIncidentsByTeamImpl);
}

export function* filterIncidentsByTeamImpl(action) {
  // Filter current incident list by team - assume no team set means show everything
  try {
    const {
      teamIds,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    let filteredIncidentsByTeamList;

    // Typically there is no filtered view by teams, so if empty, show all teams.
    if (teamIds.length) {
      filteredIncidentsByTeamList = filterIncidentsByFieldOfList(incidents, 'teams', 'id', teamIds);
    } else {
      filteredIncidentsByTeamList = [...incidents];
    }

    yield put({
      type: FILTER_INCIDENTS_LIST_BY_TEAM_COMPLETED,
      incidents: filteredIncidentsByTeamList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_TEAM_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByEscalationPolicy() {
  yield takeLatest(
    FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY,
    filterIncidentsByEscalationPolicyImpl,
  );
}

export function* filterIncidentsByEscalationPolicyImpl(action) {
  // Filter current incident list by escalation policy
  try {
    const {
      escalationPolicyIds,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    let filteredIncidentsByEscalationPolicyList;

    // eslint-disable-next-line max-len
    // Typically there is no filtered view by escalation policy, so if empty, show all escalation policies.
    if (escalationPolicyIds.length) {
      filteredIncidentsByEscalationPolicyList = filterIncidentsByField(
        incidents,
        'escalation_policy.id',
        escalationPolicyIds,
      );
    } else {
      filteredIncidentsByEscalationPolicyList = [...incidents];
    }

    yield put({
      type: FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_COMPLETED,
      incidents: filteredIncidentsByEscalationPolicyList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_ESCALATION_POLICY_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByService() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_SERVICE, filterIncidentsByServiceImpl);
}

export function* filterIncidentsByServiceImpl(action) {
  // Filter current incident list by service
  try {
    const {
      serviceIds,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    let filteredIncidentsByServiceList;

    // Typically there is no filtered view by services, so if empty, show all services.
    if (serviceIds.length) {
      filteredIncidentsByServiceList = filterIncidentsByField(incidents, 'service.id', serviceIds);
    } else {
      filteredIncidentsByServiceList = [...incidents];
    }

    yield put({
      type: FILTER_INCIDENTS_LIST_BY_SERVICE_COMPLETED,
      incidents: filteredIncidentsByServiceList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_SERVICE_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByUser() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_USER, filterIncidentsByUserImpl);
}

export function* filterIncidentsByUserImpl(action) {
  // Filter current incident list by user
  try {
    const {
      userIds,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    let filteredIncidentsByUserList;

    if (userIds.length) {
      filteredIncidentsByUserList = filterIncidentsByFieldOfList(
        incidents,
        'assignments',
        'assignee.id',
        userIds,
      );
    } else {
      filteredIncidentsByUserList = [...incidents];
    }

    yield put({
      type: FILTER_INCIDENTS_LIST_BY_USER_COMPLETED,
      incidents: filteredIncidentsByUserList,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_USER_ERROR,
      message: e.message,
    });
  }
}

export function* filterIncidentsByQuery() {
  yield takeLatest(FILTER_INCIDENTS_LIST_BY_QUERY, filterIncidentsByQueryImpl);
}

export function* filterIncidentsByQueryImpl(action) {
  // Filter current incident list by query (aka Global Search)
  try {
    const {
      searchQuery,
    } = action;
    const {
      incidents,
    } = yield select(selectIncidents);
    const {
      incidentTableColumns,
    } = yield select(selectIncidentTable);
    let filteredIncidentsByQuery;

    // Update Fuse options to include custom alert JSON to be searched
    const updatedFuseOptions = { ...fuseOptions };
    const customAlertDetailColumnKeys = incidentTableColumns
      .filter((col) => !!col.accessorPath)
      .map((col) => {
        // Handle case when '[*]' accessors are used
        const strippedAccessor = col.accessorPath.replace(/([[*\]])/g, '.');
        return (
          `alerts.body.cef_details.${strippedAccessor}`
            .split('.')
            // Handle case when special character is wrapped in quotation marks
            .map((a) => (a.includes("'") ? a.replaceAll("'", '') : a))
            // Handle empty paths from injection into strippedAccessor
            .filter((a) => a !== '')
        );
      });
    updatedFuseOptions.keys = fuseOptions.keys.concat(customAlertDetailColumnKeys);

    // Run query with non-empty input
    if (searchQuery !== '') {
      const fuse = new Fuse(incidents, updatedFuseOptions);
      filteredIncidentsByQuery = fuse.search(searchQuery).map((res) => res.item);
    } else {
      filteredIncidentsByQuery = [...incidents];
    }

    yield put({
      type: FILTER_INCIDENTS_LIST_BY_QUERY_COMPLETED,
      filteredIncidentsByQuery,
    });
  } catch (e) {
    yield put({
      type: FILTER_INCIDENTS_LIST_BY_QUERY_ERROR,
      message: e.message,
    });
  }
}
