import {
  all, take, put,
} from 'redux-saga/effects';

import RealUserMonitoring from 'src/config/monitoring';

import {
  REHYDRATE,
} from 'redux-persist/lib/constants';

import {
  toggleDisplayQuerySettings,
  updateQuerySettingsSinceDate,
  updateQuerySettingsUntilDate,
  updateQuerySettingsIncidentStatus,
  updateQuerySettingsIncidentUrgency,
  updateQuerySettingsIncidentPriority,
  updateQuerySettingsTeams,
  updateQuerySettingsEscalationPolicies,
  updateQuerySettingsServices,
  updateQuerySettingsUsers,
  updateSearchQuery,
  validateIncidentQuery,
  confirmIncidentQuery,
} from './query_settings/sagas';

import {
  getIncidentsAsync,
  getAlertsForIncidentsAsync,
  getNotesForIncidentsAsync,
  processLogEntries,
  updateIncidents,
  updateIncidentAlerts,
  updateIncidentNotes,
  filterIncidents,
} from './incidents/sagas';

import {
  getLogEntriesAsync,
  // updateRecentLogEntriesAsync,
  cleanRecentLogEntriesAsync,
  cleanRecentLogEntriesTaskWatcher,
  pollLogEntriesTaskWatcher,
} from './log_entries/sagas';

import {
  saveIncidentTable,
  updateIncidentTableColumns,
  updateIncidentTableState,
  selectIncidentTableRows,
  clearIncidentTableFilters,
} from './incident_table/sagas';

import {
  doAction,
  acknowledgeAsync,
  escalateAsync,
  reassignAsync,
  toggleDisplayReassignModal,
  addResponderAsync,
  toggleDisplayAddResponderModal,
  snoozeAsync,
  toggleDisplayCustomSnoozeModal,
  toggleDisplayMergeModal,
  mergeAsync,
  resolveAsync,
  updatePriorityAsync,
  addNoteAsync,
  toggleDisplayAddNoteModal,
  runCustomIncidentActionAsync,
  syncWithExternalSystemAsync,
  moveAlertsAsync,
} from './incident_actions/sagas';

import {
  toggleActionAlertsModal, updateActionAlertsModal,
} from './action_alerts/sagas';

import {
  userAuthorize,
  userUnauthorize,
  userAcceptDisclaimer,
  getUsersAsync,
  getCurrentUserAsync,
  updateUserLocale,
  addUserToUsersMap,
} from './users/sagas';

import {
  getExtensionsAsync, mapServicesToExtensions,
} from './extensions/sagas';

import {
  getResponsePlaysAsync, runResponsePlayAsync,
} from './response_plays/sagas';

import {
  getServicesAsync,
} from './services/sagas';
import {
  getTeamsAsync,
} from './teams/sagas';
import {
  getPrioritiesAsync,
} from './priorities/sagas';
import {
  getEscalationPoliciesAsync,
} from './escalation_policies/sagas';

// eslint-disable-next-line import/no-cycle
import {
  toggleSettingsModal,
  toggleLoadSavePresetsModal,
  toggleColumnsModal,
  setDefaultSinceDateTenor,
  setSearchAllCustomDetails,
  setFuzzySearch,
  setRespondersInEpFilter,
  setAlertCustomDetailColumns,
  setComputedColumns,
  setShowIncidentAlertsModalForIncidentId,
  setMaxRateLimit,
  setAutoAcceptIncidentsQuery,
  setAutoRefreshInterval,
  setDarkMode,
  setRelativeDates,
  clearLocalCache,
} from './settings/sagas';

import {
  CATASTROPHE,
} from './connection/actions';

import {
  updateConnectionStatus,
  checkConnectionStatus,
  checkConnectionStatusTaskWatcher,
  checkAbilities,
  checkAbilitiesTaskWatcher,
  refreshOauth,
  checkForTokenExpiryWatcher,
  updateQueueStats,
  updateQueueStatsTaskWatcher,
} from './connection/sagas';

import {
  startMonitoring, stopMonitoring,
} from './monitoring/sagas';

export default function* rootSaga() {
  yield take(REHYDRATE); // Wait for rehydrate to prevent sagas from running with empty store
  try {
    yield all([
      // Query Settings
      toggleDisplayQuerySettings(),
      updateQuerySettingsSinceDate(),
      updateQuerySettingsUntilDate(),
      updateQuerySettingsIncidentStatus(),
      updateQuerySettingsIncidentUrgency(),
      updateQuerySettingsIncidentPriority(),
      updateQuerySettingsTeams(),
      updateQuerySettingsEscalationPolicies(),
      updateQuerySettingsServices(),
      updateQuerySettingsUsers(),
      updateSearchQuery(),
      validateIncidentQuery(),
      confirmIncidentQuery(),

      // Incidents
      getIncidentsAsync(),
      getAlertsForIncidentsAsync(),
      getNotesForIncidentsAsync(),
      processLogEntries(),
      updateIncidents(),
      updateIncidentAlerts(),
      updateIncidentNotes(),
      filterIncidents(),

      // Log Entries
      getLogEntriesAsync(),
      cleanRecentLogEntriesAsync(),
      cleanRecentLogEntriesTaskWatcher(),
      pollLogEntriesTaskWatcher(),

      // Incident Table
      saveIncidentTable(),
      updateIncidentTableColumns(),
      updateIncidentTableState(),
      selectIncidentTableRows(),
      clearIncidentTableFilters(),

      // Incident Actions
      doAction(),
      acknowledgeAsync(),
      escalateAsync(),
      reassignAsync(),
      toggleDisplayReassignModal(),
      addResponderAsync(),
      toggleDisplayAddResponderModal(),
      snoozeAsync(),
      toggleDisplayCustomSnoozeModal(),
      toggleDisplayMergeModal(),
      mergeAsync(),
      resolveAsync(),
      updatePriorityAsync(),
      addNoteAsync(),
      toggleDisplayAddNoteModal(),
      runCustomIncidentActionAsync(),
      syncWithExternalSystemAsync(),
      moveAlertsAsync(),

      // Action Alerts Modal
      toggleActionAlertsModal(),
      updateActionAlertsModal(),

      // Users
      userAuthorize(),
      userUnauthorize(),
      userAcceptDisclaimer(),
      getUsersAsync(),
      getCurrentUserAsync(),
      updateUserLocale(),
      addUserToUsersMap(),

      // Services
      getServicesAsync(),

      // Teams
      getTeamsAsync(),

      // Priorities
      getPrioritiesAsync(),

      // Escalation Policies
      getEscalationPoliciesAsync(),

      // Extensions
      getExtensionsAsync(),
      mapServicesToExtensions(),

      // Response Plays
      getResponsePlaysAsync(),
      runResponsePlayAsync(),

      // Settings
      toggleSettingsModal(),
      toggleLoadSavePresetsModal(),
      toggleColumnsModal(),
      setDefaultSinceDateTenor(),
      setSearchAllCustomDetails(),
      setFuzzySearch(),
      setRespondersInEpFilter(),
      setAlertCustomDetailColumns(),
      setComputedColumns(),
      setShowIncidentAlertsModalForIncidentId(),
      setMaxRateLimit(),
      setAutoAcceptIncidentsQuery(),
      setAutoRefreshInterval(),
      setDarkMode(),
      setRelativeDates(),
      clearLocalCache(),

      // Connection
      updateConnectionStatus(),
      checkConnectionStatus(),
      checkConnectionStatusTaskWatcher(),
      updateQueueStats(),
      updateQueueStatsTaskWatcher(),
      checkAbilities(),
      checkAbilitiesTaskWatcher(),
      refreshOauth(),
      checkForTokenExpiryWatcher(),

      // Monitoring
      startMonitoring(),
      stopMonitoring(),
    ]);
  } catch (e) {
    RealUserMonitoring.trackError(e);
    // eslint-disable-next-line no-console
    console.error('Error in rootSaga:', e);
    yield put({
      type: CATASTROPHE,
      connectionStatusMessage: e.message,
    });
  }
}
