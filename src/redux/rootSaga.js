import {
  all, take,
} from 'redux-saga/effects';

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
} from './log_entries/sagas';

import {
  saveIncidentTable,
  updateIncidentTableColumns,
  updateIncidentTableState,
  selectIncidentTableRows,
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
  setShowIncidentAlertsModalForIncidentId,
  setMaxRateLimit,
  setAutoAcceptIncidentsQuery,
  setAutoRefreshInterval,
  setDarkMode,
  setRelativeDates,
  clearLocalCache,
} from './settings/sagas';

import {
  updateConnectionStatus,
  checkConnectionStatus,
  checkAbilities,
  updateQueueStats,
} from './connection/sagas';

import {
  startMonitoring, stopMonitoring,
} from './monitoring/sagas';

export default function* rootSaga() {
  yield take(REHYDRATE); // Wait for rehydrate to prevent sagas from running with empty store
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

    // Incident Table
    saveIncidentTable(),
    updateIncidentTableColumns(),
    updateIncidentTableState(),
    selectIncidentTableRows(),

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
    updateQueueStats(),
    checkAbilities(),

    // Monitoring
    startMonitoring(),
    stopMonitoring(),
  ]);
}
