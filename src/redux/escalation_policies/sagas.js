/* eslint-disable array-callback-return */
import { put, call, select, takeLatest } from "redux-saga/effects";
import { api } from '@pagerduty/pdjs';

import {
  FETCH_ESCALATION_POLICIES_REQUESTED,
  FETCH_ESCALATION_POLICIES_COMPLETED,
  FETCH_ESCALATION_POLICIES_ERROR,
} from "./actions";

import { selectEscalationPolicies } from "./selectors";

// TODO: Update with Bearer token OAuth
const pd = api({ token: process.env.REACT_APP_PD_TOKEN });

export function* getEscalationPoliciesAsync() {
  yield takeLatest(FETCH_ESCALATION_POLICIES_REQUESTED, getEscalationPolicies);
};

export function* getEscalationPolicies() {
  try {
    //  Create params and call pd lib
    let response = yield call(pd.all, "escalation_policies");
    let escalationPolicies = response.resource;

    yield put({
      type: FETCH_ESCALATION_POLICIES_COMPLETED,
      escalationPolicies
    });

  } catch (e) {
    yield put({ type: FETCH_ESCALATION_POLICIES_ERROR, message: e.message });
  }
};