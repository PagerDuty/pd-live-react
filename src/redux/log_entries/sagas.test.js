import {
  select,
} from 'redux-saga/effects';

import {
  expectSaga,
} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import {
  throwError,
} from 'redux-saga-test-plan/providers';

import {
  generateMockLogEntries,
} from 'mocks/log_entries.test';

import {
  pdParallelFetch,
} from 'src/util/pd-api-wrapper';

import {
  FETCH_LOG_ENTRIES_REQUESTED,
  FETCH_LOG_ENTRIES_COMPLETED,
  // FETCH_LOG_ENTRIES_ERROR,
  UPDATE_LOG_ENTRIES_POLLING,
} from './actions';

import {
  FETCH_INCIDENTS_REQUESTED, PROCESS_LOG_ENTRIES,
} from '../incidents/actions';

import logEntries from './reducers';

import selectLogEntries from './selectors';

import {
  getLogEntriesAsync,
} from './sagas';

// FIXME: Need to complete this test
describe('Sagas: Log Entries', () => {
  const mockLogEntries = generateMockLogEntries(10);
  const mockRecentLogEntries = Object.assign(
    {},
    ...mockLogEntries.map((logEntry) => ({ [logEntry.id]: new Date(logEntry.created_at) })),
  );
  const mockLatestLogEntryDate = new Date(Math.max(...Object.values(mockRecentLogEntries)));

  it('fetches log entries', () => expectSaga(getLogEntriesAsync)
    .withReducer(logEntries)
    .provide([
      [select(selectLogEntries), { logEntries: [], recentLogEntries: {}, pollingStatus: { errors: [] } }],
      [matchers.call.fn(pdParallelFetch), mockLogEntries],
    ])
    .dispatch({
      type: FETCH_LOG_ENTRIES_REQUESTED,
      since: new Date(),
    })
    .run()
    .then((result) => {
      const {
        storeState, effects,
      } = result;
      expect(effects.call).toHaveLength(1);
      expect(effects.put).toHaveLength(2);
      expect(effects.put[0].payload.action.type).toEqual(FETCH_LOG_ENTRIES_COMPLETED);
      expect(effects.put[1].payload.action.type).toEqual(PROCESS_LOG_ENTRIES);
      expect(storeState.status).toEqual(FETCH_LOG_ENTRIES_COMPLETED);
      expect(storeState.logEntries).toHaveLength(mockLogEntries.length);
      expect(storeState.recentLogEntries).toEqual(mockRecentLogEntries);
      expect(storeState.latestLogEntryDate).toEqual(mockLatestLogEntryDate);
    }));

  it('fetches incidents instead when log entries is too long', () => expectSaga(getLogEntriesAsync)
    .withReducer(logEntries)
    .provide([
      [select(selectLogEntries), { logEntries: [], recentLogEntries: {}, pollingStatus: { errors: [] } }],
      [matchers.call.fn(pdParallelFetch), throwError(new Error('Too many records: 1001 > 1000'))],
    ])
    .dispatch({
      type: FETCH_LOG_ENTRIES_REQUESTED,
      since: new Date(),
    })
    .run()
    .then((result) => {
      const {
        effects,
      } = result;
      expect(effects.call).toHaveLength(1);
      expect(effects.put).toHaveLength(3);
      expect(effects.put[0].payload.action.type).toEqual(UPDATE_LOG_ENTRIES_POLLING);
      expect(effects.put[1].payload.action.type).toEqual(FETCH_LOG_ENTRIES_COMPLETED);
      expect(effects.put[2].payload.action.type).toEqual(FETCH_INCIDENTS_REQUESTED);
    }));
});
