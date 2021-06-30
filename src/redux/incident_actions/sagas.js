/* eslint-disable array-callback-return */
import { put, call, select, takeLatest } from "redux-saga/effects";
import { api } from '@pagerduty/pdjs';

import {
  ACKNOWLEDGE_REQUESTED,
  ACKNOWLEDGE_COMPLETED,
  ACKNOWLEDGE_ERROR,
} from "./actions";

import { selectIncidentActions } from "./selectors";
import { selectUsers } from "redux/users/selectors";

import {
  TRIGGERED,
  ACKNOWLEDGED,
  RESOLVED,
  filterIncidentsByField
} from "util/incidents";

// TODO: Update with Bearer token OAuth
const pd = api({ token: process.env.REACT_APP_PD_TOKEN });

export function* acknowledgeAsync() {
  yield takeLatest(ACKNOWLEDGE_REQUESTED, acknowledge);
};

export function* acknowledge(action) {
  try {
    //  Create params and call pd lib
    let { incidents } = action;
    let { currentUser } = yield select(selectUsers);

    let incidentsToBeAcknowledged = filterIncidentsByField(incidents, "status", [TRIGGERED, ACKNOWLEDGED]);
    let incidentsNotToBeAcknowledged = filterIncidentsByField(incidents, "status", [RESOLVED]);

    console.log("TO BE ACK", incidentsToBeAcknowledged);
    console.log("NOT TO BE ACK", incidentsNotToBeAcknowledged);

    // Build request manually given PUT
    let headers = {
      "From": currentUser["email"]
    };

    let data = {
      "incidents": incidentsToBeAcknowledged.map(incident => {
        return {
          "id": incident.id,
          "type": "incident_reference",
          "status": ACKNOWLEDGED
        };
      })
    };

    let response = yield call(pd, {
      method: "put",
      endpoint: "incidents",
      headers,
      data
    });

    // Determine how store is updated based on response
    if (response.ok) {
      yield put({
        type: ACKNOWLEDGE_COMPLETED,
        acknowledgedIncidents: response.resource
      });
      // TODO: Dispatch Action Alert Modal message upon success
    } else {
      if (response.data.error) {
        throw Error(response.data.error.message);
      } else {
        throw Error("Unknown error while using PD API");
      };
    };

  } catch (e) {
    yield put({ type: ACKNOWLEDGE_ERROR, message: e.message });
  }
};