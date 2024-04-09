/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

import {
  put, call, select, takeLatest, take, delay, race,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  handleSingleAPIErrorResponse,
} from 'src/util/sagas';

import {
  LOG_ENTRIES_POLLING_INTERVAL_SECONDS,
  LOG_ENTRIES_CLEARING_INTERVAL_SECONDS,
  DEBUG_DISABLE_POLLING,
} from 'src/config/constants';

import {
  pd, pdParallelFetch,
} from 'src/util/pd-api-wrapper';

import {
  CATASTROPHE,
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'src/redux/connection/actions';
import {
  FETCH_INCIDENTS_REQUESTED, PROCESS_LOG_ENTRIES,
} from 'src/redux/incidents/actions';

import {
  FETCH_LOG_ENTRIES_REQUESTED,
  FETCH_LOG_ENTRIES_COMPLETED,
  FETCH_LOG_ENTRIES_ERROR,
  CLEAN_RECENT_LOG_ENTRIES,
  CLEAN_RECENT_LOG_ENTRIES_COMPLETED,
  CLEAN_RECENT_LOG_ENTRIES_ERROR,
  START_CLEAN_RECENT_LOG_ENTRIES_POLLING,
  STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING,
  START_LOG_ENTRIES_POLLING,
  UPDATE_LOG_ENTRIES_POLLING,
  STOP_LOG_ENTRIES_POLLING,
} from './actions';

import selectLogEntries from './selectors';

export function* getLogEntriesAsync() {
  yield takeLatest(FETCH_LOG_ENTRIES_REQUESTED, getLogEntries);
}

export function* getLogEntries(action) {
  const {
    recentLogEntries,
    pollingStatus: {
      errors: pollingErrors,
    },
  } = yield select(selectLogEntries);
  try {
    //  Create params and call pd lib
    const {
      since,
    } = action;

    const params = {
      since: since.toISOString().replace(/\.[\d]{3}/, ''),
      'include[]': ['incidents', 'linked_incidents', 'external_references', 'channels'],
    };
    let logEntries;
    try {
      logEntries = yield call(pdParallelFetch, 'log_entries', params, null, {
        priority: 5,
        maxRecords: 5000,
      });
    } catch (e) {
      if (e.message && e.message.startsWith('Too many records')) {
        // eslint-disable-next-line no-console
        console.error(`getLogEntries: ${e.message} - fetching incidents instead`);
        yield put({
          type: UPDATE_LOG_ENTRIES_POLLING,
          pollingStatus: {
            errors: [...pollingErrors, e].slice(-25),
          },
        });
        yield put({
          type: FETCH_LOG_ENTRIES_ERROR,
          message: e.message,
        });
        yield put({
          type: FETCH_INCIDENTS_REQUESTED,
        });
        return;
      }
      throw e;
    }

    // Filter out log entries that are already in recent log entries map
    // sort by date ascending (oldest first)
    logEntries = logEntries
      .filter((x) => !recentLogEntries[x.id])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Add new log entries to recent log entries map by id
    const recentLogEntriesLocal = {
      ...recentLogEntries,
      ...Object.assign(
        {},
        ...logEntries.map((x) => ({
          [x.id]: new Date(x.created_at),
        })),
      ),
    };

    const latestLogEntryDate = logEntries.length > 0
      ? new Date(Math.max(...logEntries.map((x) => new Date(x.created_at))))
      : undefined;

    yield put({
      type: FETCH_LOG_ENTRIES_COMPLETED,
      logEntries,
      recentLogEntries: recentLogEntriesLocal,
      latestLogEntryDate,
    });

    if (logEntries.length === 0) {
      // No new log entries, so no need to process
      return;
    }

    yield put({
      type: PROCESS_LOG_ENTRIES,
      logEntries,
    });
  } catch (e) {
    yield put({
      type: UPDATE_LOG_ENTRIES_POLLING,
      pollingStatus: {
        errors: [...pollingErrors, e].slice(-25),
      },
    });
    yield put({ type: FETCH_LOG_ENTRIES_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
    // Handle API failure
    if (e.response) {
      yield call(handleSingleAPIErrorResponse, e.response);
    } else {
      throw e;
    }
  }
}

export function* pollLogEntriesTask() {
  while (true) {
    const {
      logEntries: {
        latestLogEntryDate,
      },
      users: {
        userAuthorized,
        userAcceptedDisclaimer,
      },
      incidents: {
        fetchingIncidents,
      },
    } = yield select();
    if (userAuthorized && userAcceptedDisclaimer && !fetchingIncidents && !DEBUG_DISABLE_POLLING) {
      const lastPollStarted = new Date();
      yield put({
        type: UPDATE_LOG_ENTRIES_POLLING,
        pollingStatus: {
          lastPollStarted,
        },
      });
      yield call(getLogEntries, { since: latestLogEntryDate });
      const lastPollCompleted = new Date();
      yield put({
        type: UPDATE_LOG_ENTRIES_POLLING,
        pollingStatus: {
          lastPollCompleted,
        },
      });

      let timeTaken = lastPollCompleted - lastPollStarted;
      if (timeTaken > LOG_ENTRIES_POLLING_INTERVAL_SECONDS * 1000) {
        // if the time taken to fetch log entries is greater than the polling interval,
        // then we should start the next poll immediately
        timeTaken = LOG_ENTRIES_POLLING_INTERVAL_SECONDS * 1000;
      } else if (timeTaken < 0) {
        timeTaken = 0;
      }
      yield delay((LOG_ENTRIES_POLLING_INTERVAL_SECONDS * 1000) - timeTaken);
    } else {
      // eslint-disable-next-line no-console
      console.log('skipping poll', { userAuthorized, userAcceptedDisclaimer, fetchingIncidents, DEBUG_DISABLE_POLLING });
      yield delay(LOG_ENTRIES_POLLING_INTERVAL_SECONDS * 1000);
    }
  }
}

export function* pollLogEntriesTaskWatcher() {
  while (true) {
    yield take(START_LOG_ENTRIES_POLLING);
    yield race([call(pollLogEntriesTask), take(STOP_LOG_ENTRIES_POLLING)]);
  }
}

export function* cleanRecentLogEntriesAsync() {
  yield takeLatest(CLEAN_RECENT_LOG_ENTRIES, cleanRecentLogEntries);
}

export function* cleanRecentLogEntries() {
  const {
    recentLogEntries,
  } = yield select(selectLogEntries);

  // filter recentLogEntries to include only those that are less than 4 hours old
  // recentLogEntries has the format { logEntryId: date }
  const recentLogEntriesFiltered = Object.keys(recentLogEntries)
    .filter((x) => new Date(recentLogEntries[x]) > new Date(new Date() - 4 * 60 * 60 * 1000))
    .reduce((obj, key) => {
      // eslint-disable-next-line no-param-reassign
      obj[key] = recentLogEntries[key];
      return obj;
    }, {});

  try {
    yield put({
      type: CLEAN_RECENT_LOG_ENTRIES_COMPLETED,
      recentLogEntries: recentLogEntriesFiltered,
    });
  } catch (e) {
    yield put({ type: CLEAN_RECENT_LOG_ENTRIES_ERROR, message: e.message });
  }
}

export function* cleanRecentLogEntriesTask() {
  while (true) {
    yield call(cleanRecentLogEntries);
    yield delay(LOG_ENTRIES_CLEARING_INTERVAL_SECONDS * 1000);
  }
}

export function* cleanRecentLogEntriesTaskWatcher() {
  while (true) {
    yield take(START_CLEAN_RECENT_LOG_ENTRIES_POLLING);
    yield race([call(cleanRecentLogEntriesTask), take(STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING)]);
  }
}
