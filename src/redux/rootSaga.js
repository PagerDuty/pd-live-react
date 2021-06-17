import { all } from "redux-saga/effects";

import { getIncidentsAsync, updateIncidentsListAsync } from "./incidents/sagas";
import { getLogEntriesAsync, updateRecentLogEntriesAsync, cleanRecentLogEntriesAsync } from "./log_entries/sagas";
import { toggleDisplayQuerySettings } from "./query_settings/sagas";
import { updateIncidentTableColumns } from "./incident_table/sagas";
import { getServicesAsync } from "./services/sagas";


export default function* rootSaga() {
  yield all([
    getIncidentsAsync(),
    getLogEntriesAsync(),
    updateRecentLogEntriesAsync(),
    updateIncidentsListAsync(),
    cleanRecentLogEntriesAsync(),
    toggleDisplayQuerySettings(),
    updateIncidentTableColumns(),
    getServicesAsync(),
  ]);
};