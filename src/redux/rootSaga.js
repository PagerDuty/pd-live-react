import { all } from "redux-saga/effects";

import { getIncidentsAsync, updateIncidentsListAsync } from "./incidents/sagas";
import { getLogEntriesAsync, updateRecentLogEntriesAsync, cleanRecentLogEntriesAsync } from "./log_entries/sagas";

export default function* rootSaga() {
  yield all([
    getIncidentsAsync(),
    getLogEntriesAsync(),
    updateRecentLogEntriesAsync(),
    updateIncidentsListAsync(),
    cleanRecentLogEntriesAsync()
  ]);
};