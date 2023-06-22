import {
  put, call, select, takeLatest, take,
} from 'redux-saga/effects';

import i18next from 'i18n';

import {
  formatError,
} from 'pretty-print-error';

import {
  PD_SUBDOMAIN_ALLOW_LIST,
} from 'config/constants';

import {
  // pd,
  throttledPdAxiosRequest,
  pdParallelFetch,
} from 'util/pd-api-wrapper';

import {
  convertListToMapById, getSubdomainFromUserUrl,
} from 'util/helpers';

import {
  updateConnectionStatusRequested,
} from 'util/sagas';

import {
  USER_AUTHORIZE_REQUESTED,
  USER_AUTHORIZE_COMPLETED,
  USER_AUTHORIZE_ERROR,
  USER_UNAUTHORIZE_REQUESTED,
  USER_UNAUTHORIZE_COMPLETED,
  USER_UNAUTHORIZE_ERROR,
  USER_ACCEPT_DISCLAIMER_REQUESTED,
  USER_ACCEPT_DISCLAIMER_COMPLETED,
  USER_ACCEPT_DISCLAIMER_ERROR,
  GET_USERS_REQUESTED,
  GET_USERS_COMPLETED,
  GET_USERS_ERROR,
  GET_CURRENT_USER_REQUESTED,
  GET_CURRENT_USER_COMPLETED,
  GET_CURRENT_USER_ERROR,
  UPDATE_USER_LOCALE_REQUESTED,
  UPDATE_USER_LOCALE_COMPLETED,
  UPDATE_USER_LOCALE_ERROR,
} from './actions';

import selectUsers from './selectors';

export function* userAuthorize() {
  yield takeLatest(USER_AUTHORIZE_REQUESTED, userAuthorizeImpl);
}

export function* userAuthorizeImpl() {
  try {
    // Dispatch action to get current user
    yield put({ type: GET_CURRENT_USER_REQUESTED });
    yield take([GET_CURRENT_USER_COMPLETED]);

    // Extract allowed subdomains by comma seperated list and check against current user login
    const {
      currentUser,
    } = yield select(selectUsers);
    const currentSubdomain = getSubdomainFromUserUrl(currentUser.html_url);
    const allowedSubdomains = PD_SUBDOMAIN_ALLOW_LIST.split(',');

    if (allowedSubdomains.includes('*') || allowedSubdomains.includes(currentSubdomain)) {
      yield put({
        type: USER_AUTHORIZE_COMPLETED,
        userAuthorized: true,
        subdomain: currentSubdomain,
      });
    } else {
      yield put({ type: USER_UNAUTHORIZE_REQUESTED });
    }
  } catch (e) {
    yield put({ type: USER_AUTHORIZE_ERROR, message: e.message });
  }
}

export function* userUnauthorize() {
  yield takeLatest(USER_UNAUTHORIZE_REQUESTED, userUnauthorizeImpl);
}

export function* userUnauthorizeImpl() {
  // Mark user as unauthorized (either from app perms or logout)
  try {
    yield put({
      type: USER_UNAUTHORIZE_COMPLETED,
      userAuthorized: false,
    });
  } catch (e) {
    yield put({ type: USER_UNAUTHORIZE_ERROR, message: e.message });
  }
}

export function* userAcceptDisclaimer() {
  yield takeLatest(USER_ACCEPT_DISCLAIMER_REQUESTED, userAcceptDisclaimerImpl);
}

export function* userAcceptDisclaimerImpl() {
  try {
    const {
      userAcceptedDisclaimer,
    } = yield select(selectUsers);
    yield put({
      type: USER_ACCEPT_DISCLAIMER_COMPLETED,
      userAcceptedDisclaimer: !userAcceptedDisclaimer,
    });
  } catch (e) {
    yield put({ type: USER_ACCEPT_DISCLAIMER_ERROR, message: e.message });
  }
}

export function* getUsersAsync() {
  yield takeLatest(GET_USERS_REQUESTED, getUsers);
}

export function* getUsers(action) {
  try {
    //  Create params and call pd lib
    const {
      teamIds,
    } = action;
    const params = {};
    if (teamIds.length) params['team_ids[]'] = teamIds;

    const users = yield call(pdParallelFetch, 'users', params);

    const usersMap = convertListToMapById(users);
    yield put({
      type: GET_USERS_COMPLETED,
      users,
      usersMap,
    });
  } catch (e) {
    // Handle API auth failure
    if (e.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({ type: GET_USERS_ERROR, message: e.message });
    yield updateConnectionStatusRequested('neutral', e.message, formatError(e));
  }
}

export function* getCurrentUserAsync() {
  yield takeLatest(GET_CURRENT_USER_REQUESTED, getCurrentUser);
}

export function* getCurrentUser() {
  try {
    const response = yield call(throttledPdAxiosRequest, 'GET', 'users/me');
    if (response.status !== 200) {
      throw Error(i18next.t('Unable to fetch current user details'));
    }
    yield put({
      type: GET_CURRENT_USER_COMPLETED,
      currentUser: response.data.user,
    });
  } catch (e) {
    yield put({ type: GET_CURRENT_USER_ERROR, message: e.message });
    yield updateConnectionStatusRequested('neutral', e.message, formatError(e));
  }
}

export function* updateUserLocale() {
  yield takeLatest(UPDATE_USER_LOCALE_REQUESTED, updateUserLocaleImpl);
}

export function* updateUserLocaleImpl(action) {
  try {
    const {
      locale,
    } = action;
    i18next.changeLanguage(locale);
    yield put({
      type: UPDATE_USER_LOCALE_COMPLETED,
      currentUserLocale: locale,
    });
  } catch (e) {
    // TODO: Implement logic for unsupported locale
    yield put({ type: UPDATE_USER_LOCALE_ERROR, message: e.message });
  }
}
