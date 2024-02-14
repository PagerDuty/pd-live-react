/* eslint-disable array-callback-return */
import {
  put, call, select, takeLatest,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import {
  CUSTOM_INCIDENT_ACTION, EXTERNAL_SYSTEM,
} from 'src/util/extensions';
import {
  pdParallelFetch,
} from 'src/util/pd-api-wrapper';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'src/redux/connection/actions';
import {
  FETCH_EXTENSIONS_REQUESTED,
  FETCH_EXTENSIONS_COMPLETED,
  FETCH_EXTENSIONS_ERROR,
  MAP_SERVICES_TO_EXTENSIONS_REQUESTED,
  MAP_SERVICES_TO_EXTENSIONS_COMPLETED,
  MAP_SERVICES_TO_EXTENSIONS_ERROR,
} from './actions';

import selectExtensions from './selectors';

export function* getExtensionsAsync() {
  yield takeLatest(FETCH_EXTENSIONS_REQUESTED, getExtensions);
}

export function* getExtensions() {
  try {
    const extensions = yield call(pdParallelFetch, 'extensions');

    yield put({
      type: FETCH_EXTENSIONS_COMPLETED,
      extensions,
    });

    // Perform mapping of services to extensions
    yield put({ type: MAP_SERVICES_TO_EXTENSIONS_REQUESTED });
  } catch (e) {
    // Handle API auth failure
    if (e.response?.status === 401) {
      e.message = i18next.t('Unauthorized Access');
    }
    yield put({ type: FETCH_EXTENSIONS_ERROR, message: e.message });
    yield put({
      type: UPDATE_CONNECTION_STATUS_REQUESTED,
      connectionStatus: 'neutral',
      connectionStatusMessage: e.message,
    });
  }
}

export function* mapServicesToExtensions() {
  yield takeLatest(MAP_SERVICES_TO_EXTENSIONS_REQUESTED, mapServicesToExtensionsImpl);
}

export function* mapServicesToExtensionsImpl() {
  try {
    const {
      extensions,
    } = yield select(selectExtensions);

    // Build map of service ids against extensions
    const serviceExtensionMap = {};
    extensions.map((extension) => {
      extension.extension_objects.map((extensionObject) => {
        if (extensionObject.type === 'service_reference') {
          const serviceId = extensionObject.id;
          if (!(serviceExtensionMap[serviceId] instanceof Array)) {
            serviceExtensionMap[serviceId] = [];
          }
          const modifiedExtension = { ...extension };
          const extensionSummary = modifiedExtension.extension_schema.summary;
          if (extensionSummary === CUSTOM_INCIDENT_ACTION) {
            modifiedExtension.extension_type = CUSTOM_INCIDENT_ACTION;
          } else if (extensionSummary.includes('ServiceNow')) {
            modifiedExtension.extension_type = EXTERNAL_SYSTEM;
            modifiedExtension.extension_label = `${i18next.t('Sync with')} ServiceNow`;
          } else if (extensionSummary.includes('Jira')) {
            modifiedExtension.extension_type = EXTERNAL_SYSTEM;
            modifiedExtension.extension_label = `${i18next.t('Sync with')} ${extensionSummary}`;
          } else if (extensionSummary === 'Zendesk') {
            modifiedExtension.extension_type = EXTERNAL_SYSTEM;
            modifiedExtension.extension_label = `${i18next.t('Sync with')} Zendesk`;
          }
          serviceExtensionMap[serviceId].push(modifiedExtension);
        }
      });
    });
    Object.values(serviceExtensionMap).map((serviceExtensions) => {
      serviceExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });

    yield put({
      type: MAP_SERVICES_TO_EXTENSIONS_COMPLETED,
      serviceExtensionMap,
    });
  } catch (e) {
    yield put({ type: MAP_SERVICES_TO_EXTENSIONS_ERROR, message: e.message });
  }
}
