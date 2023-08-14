/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

import {
  put, call, select, takeLatest, take,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  pd, pdParallelFetch,
} from 'util/pd-api-wrapper';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
import {
  FETCH_INCIDENTS_REQUESTED, PROCESS_LOG_ENTRIES,
} from 'redux/incidents/actions';

import {
  FETCH_LOG_ENTRIES_REQUESTED,
  FETCH_LOG_ENTRIES_COMPLETED,
  FETCH_LOG_ENTRIES_ERROR,
  CLEAN_RECENT_LOG_ENTRIES,
  CLEAN_RECENT_LOG_ENTRIES_COMPLETED,
  CLEAN_RECENT_LOG_ENTRIES_ERROR,
} from './actions';

import selectLogEntries from './selectors';

export function* getLogEntriesAsync() {
  yield takeLatest(FETCH_LOG_ENTRIES_REQUESTED, getLogEntries);
}

export function* getLogEntries(action) {
  const {
    recentLogEntries,
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
        maxRecords: 1000,
      });
    } catch (e) {
      if (e.message && e.message.startsWith('Too many records')) {
        // eslint-disable-next-line no-console
        console.log(`getLogEntries: ${e.message} - fetching incidents instead`);
        yield put({
          type: FETCH_LOG_ENTRIES_ERROR,
          message: e.message,
        });
        yield put({
          type: FETCH_INCIDENTS_REQUESTED,
        });
        return;
      }
      throw Error(i18next.t('Unable to fetch log entries') + e.message ? `: ${e.message}` : '');
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

    // Call to update recent log entries with this data.
    // yield call(updateRecentLogEntries);
  } catch (e) {
    // Handle API auth failure
    if (e.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({ type: FETCH_LOG_ENTRIES_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
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
