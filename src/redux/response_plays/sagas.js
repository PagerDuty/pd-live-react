import {
  put, call, takeLatest, all,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  handleSagaError,
  handleMultipleAPIErrorResponses,
  displayActionModal,
} from 'src/util/sagas';

import {
  pd, pdParallelFetch,
} from 'src/util/pd-api-wrapper';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'src/redux/connection/actions';
import {
  FETCH_RESPONSE_PLAYS_REQUESTED,
  FETCH_RESPONSE_PLAYS_COMPLETED,
  FETCH_RESPONSE_PLAYS_ERROR,
  RUN_RESPONSE_PLAY_REQUESTED,
  RUN_RESPONSE_PLAY_COMPLETED,
  RUN_RESPONSE_PLAY_ERROR,
} from './actions';

export function* getResponsePlaysAsync() {
  yield takeLatest(FETCH_RESPONSE_PLAYS_REQUESTED, getResponsePlays);
}

export function* getResponsePlays() {
  try {
    const params = {
      filter_for_manual_run: true,
    };
    const responsePlays = yield call(pdParallelFetch, 'response_plays', params);

    yield put({
      type: FETCH_RESPONSE_PLAYS_COMPLETED,
      responsePlays,
    });
  } catch (e) {
    // Handle API auth failure
    if (e.response?.status === 401) {
      e.message = i18next.t('Unauthorized Access');
      throw e;
    }
    if (e.response?.status === 301) {
      // user just doesn't have response plays
      yield put({
        type: FETCH_RESPONSE_PLAYS_COMPLETED,
        responsePlays: [],
      });
      return;
    }
    yield put({ type: FETCH_RESPONSE_PLAYS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}

export function* runResponsePlayAsync() {
  yield takeLatest(RUN_RESPONSE_PLAY_REQUESTED, runResponsePlay);
}

export function* runResponsePlay(action) {
  try {
    const {
      incidents: selectedIncidents, responsePlay, displayModal,
    } = action;

    // Build individual requests as the endpoint supports singular POST
    const responsePlayRequests = selectedIncidents.map((incident) => call(pd, {
      method: 'post',
      endpoint: `response_plays/${responsePlay.id}/run`,
      data: {
        incident: {
          id: incident.id,
          type: 'incident_reference',
        },
      },
    }));

    // Invoke parallel calls for optimal performance
    const responses = yield all(responsePlayRequests);
    if (responses.every((response) => response.ok)) {
      yield put({
        type: RUN_RESPONSE_PLAY_COMPLETED,
        responsePlayRequests: responses,
      });
      if (displayModal) {
        const actionAlertsModalType = 'success';
        const actionAlertsModalMessage = `${i18next.t('Ran')} "${responsePlay.summary}" ${i18next.t(
          'response play for',
        )} ${i18next.t('incident')}(s) ${selectedIncidents
          .map((i) => i.incident_number)
          .join(', ')}.`;
        yield displayActionModal(actionAlertsModalType, actionAlertsModalMessage);
      }
    } else {
      yield call(handleMultipleAPIErrorResponses, responses);
    }
  } catch (e) {
    handleSagaError(RUN_RESPONSE_PLAY_ERROR, e);
  }
}
