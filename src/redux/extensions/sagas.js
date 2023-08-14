/* eslint-disable array-callback-return */
import {
  put, call, select, takeLatest,
} from 'redux-saga/effects';

import i18next from 'src/i18n';

import selectServices from 'redux/services/selectors';
import {
  CUSTOM_INCIDENT_ACTION, EXTERNAL_SYSTEM,
} from 'util/extensions';
import {
  pdParallelFetch,
} from 'util/pd-api-wrapper';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
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
      services,
    } = yield select(selectServices);
    const {
      extensions,
    } = yield select(selectExtensions);

    // Build map of service ids against extensions
    const serviceExtensionMap = {};
    services.map((service) => {
      const serviceExtensions = [];
      extensions.map((extension) => {
        extension.extension_objects.map((extensionObject) => {
          if (extensionObject.type === 'service_reference' && extensionObject.id === service.id) {
            // Add modified version of extension object for rendering, containing "types" + "labels"
            const modifiedExtension = { ...extension };
            const extensionSummary = modifiedExtension.extension_schema.summary;

            // Custom Incident Action
            if (extensionSummary === CUSTOM_INCIDENT_ACTION) {
              modifiedExtension.extension_type = CUSTOM_INCIDENT_ACTION;

              // ServiceNow
            } else if (extensionSummary.includes('ServiceNow')) {
              modifiedExtension.extension_type = EXTERNAL_SYSTEM;
              modifiedExtension.extension_label = `${i18next.t('Sync with')} ServiceNow`;

              // Jira
            } else if (extensionSummary.includes('Jira')) {
              modifiedExtension.extension_type = EXTERNAL_SYSTEM;
              modifiedExtension.extension_label = `${i18next.t('Sync with')} ${extensionSummary}`;

              // Zendesk
            } else if (extensionSummary === 'Zendesk') {
              modifiedExtension.extension_type = EXTERNAL_SYSTEM;
              modifiedExtension.extension_label = `${i18next.t('Sync with')} Zendesk`;
            }

            serviceExtensions.push(modifiedExtension);
          }
        });
      });
      // Sort name of extensions alphabetically
      serviceExtensions.sort((a, b) => a.name.localeCompare(b.name));
      serviceExtensionMap[service.id] = serviceExtensions;
    });

    yield put({
      type: MAP_SERVICES_TO_EXTENSIONS_COMPLETED,
      serviceExtensionMap,
    });
  } catch (e) {
    yield put({ type: MAP_SERVICES_TO_EXTENSIONS_ERROR, message: e.message });
  }
}
