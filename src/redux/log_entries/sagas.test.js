import {
  select,
} from 'redux-saga/effects';
import {
  expectSaga,
} from 'redux-saga-test-plan';

import {
  generateMockLogEntries,
} from 'mocks/log_entries.test';

import {
  FETCH_LOG_ENTRIES_REQUESTED, FETCH_LOG_ENTRIES_COMPLETED,
} from './actions';

import logEntries from './reducers';

import selectLogEntries from './selectors';

import {
  getLogEntriesAsync,
} from './sagas';

// FIXME: Need to complete this test
xdescribe('Sagas: Log Entries', () => {
  const mockLogEntries = generateMockLogEntries(10);

  it('should be tested', () => expectSaga(getLogEntriesAsync)
    .withReducer(logEntries)
    .provide([[select(selectLogEntries), { logEntries: mockLogEntries }]])
    .dispatch({
      type: FETCH_LOG_ENTRIES_REQUESTED,
      since: new Date(),
    })
    .put({
      type: FETCH_LOG_ENTRIES_COMPLETED,
      logEntries: mockLogEntries,
      // FIXME: recentLogEntries has the format { logEntryId: date }
      recentLogEntries: mockLogEntries,
      latestLogEntryDate: new Date(),
    })
    .silentRun()
    .then((result) => {
      expect(result.storeState.status).toEqual(FETCH_LOG_ENTRIES_COMPLETED);
      expect(result.storeState.log_entries).toEqual(mockLogEntries);
    }));
});
