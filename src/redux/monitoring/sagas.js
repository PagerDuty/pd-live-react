import {
  put, select, take, takeLatest,
} from 'redux-saga/effects';

import RealUserMonitoring from 'src/config/monitoring';

import selectUsers from 'src/redux/users/selectors';

import {
  USER_AUTHORIZE_COMPLETED, USER_UNAUTHORIZE_COMPLETED,
} from 'src/redux/users/actions';

import {
  START_MONITORING_REQUESTED,
  START_MONITORING_COMPLETED,
  START_MONITORING_ERROR,
  STOP_MONITORING_REQUESTED,
  STOP_MONITORING_COMPLETED,
  STOP_MONITORING_ERROR,
} from './actions';

export function* startMonitoring() {
  yield takeLatest(START_MONITORING_REQUESTED, startMonitoringImpl);
}

export function* startMonitoringImpl() {
  try {
    // Wait for current user to be authorized
    yield take([USER_AUTHORIZE_COMPLETED, USER_UNAUTHORIZE_COMPLETED]);
    const {
      currentUser, subdomain,
    } = yield select(selectUsers);

    // Initialise RUM
    RealUserMonitoring.init();
    RealUserMonitoring.setUser(currentUser, subdomain);
    RealUserMonitoring.start();

    yield put({
      type: START_MONITORING_COMPLETED,
    });
  } catch (e) {
    yield put({ type: START_MONITORING_ERROR });
  }
}

export function* stopMonitoring() {
  yield takeLatest(STOP_MONITORING_REQUESTED, stopMonitoringImpl);
}

export function* stopMonitoringImpl() {
  try {
    RealUserMonitoring.stop();
    yield put({
      type: STOP_MONITORING_COMPLETED,
    });
  } catch (e) {
    yield put({ type: STOP_MONITORING_ERROR });
  }
}
