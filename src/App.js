import {
  useEffect,
} from 'react';
import {
  connect,
} from 'react-redux';
import {
  Container,
} from 'react-bootstrap';
import moment from 'moment';

import AuthComponent from 'components/Auth/AuthComponent';
import UnauthorizedModalComponent from 'components/UnauthorizedModal/UnauthorizedModalComponent';
import DisclaimerModalComponent from 'components/DisclaimerModal/DisclaimerModalComponent';
import NavigationBarComponent from 'components/NavigationBar/NavigationBarComponent';
import QuerySettingsComponent from 'components/QuerySettings/QuerySettingsComponent';
import SettingsModalComponent from 'components/SettingsModal/SettingsModalComponent';
import IncidentTableComponent from 'components/IncidentTable/IncidentTableComponent';
import IncidentActionsComponent from 'components/IncidentActions/IncidentActionsComponent';
import ActionAlertsModalComponent from 'components/ActionAlertsModal/ActionAlertsModalComponent';
import CustomSnoozeModalComponent from 'components/CustomSnoozeModal/CustomSnoozeModalComponent';
import AddNoteModalComponent from 'components/AddNoteModal/AddNoteModalComponent';
import ReassignModalComponent from 'components/ReassignModal/ReassignModalComponent';
import AddResponderModalComponent from 'components/AddResponderModal/AddResponderModalComponent';
import MergeModalComponent from 'components/MergeModal/MergeModalComponent';
import ConfirmQueryModalComponent from 'components/ConfirmQueryModal/ConfirmQueryModalComponent';

import {
  refreshIncidentsAsync as refreshIncidentsAsyncConnected,
} from 'redux/incidents/actions';
import {
  getLogEntriesAsync as getLogEntriesAsyncConnected,
  cleanRecentLogEntriesAsync as cleanRecentLogEntriesAsyncConnected,
} from 'redux/log_entries/actions';
import {
  getServicesAsync as getServicesAsyncConnected,
} from 'redux/services/actions';
import {
  getTeamsAsync as getTeamsAsyncConnected,
} from 'redux/teams/actions';
import {
  getPrioritiesAsync as getPrioritiesAsyncConnected,
} from 'redux/priorities/actions';
import {
  userAuthorize as userAuthorizeConnected,
  getUsersAsync as getUsersAsyncConnected,
} from 'redux/users/actions';
import {
  getEscalationPoliciesAsync as getEscalationPoliciesAsyncConnected,
} from 'redux/escalation_policies/actions';
import {
  getResponsePlaysAsync as getResponsePlaysAsyncConnected,
} from 'redux/response_plays/actions';
import {
  checkConnectionStatus as checkConnectionStatusConnected,
  updateQueueStats as updateQueueStatsConnected,
  checkAbilities as checkAbilitiesConnected,
} from 'redux/connection/actions';
import {
  startMonitoring as startMonitoringConnected,
} from 'redux/monitoring/actions';
import {
  store,
} from 'redux/store';
import {
  limiter,
} from 'util/pd-api-wrapper';

import {
  PD_OAUTH_CLIENT_ID,
  PD_OAUTH_CLIENT_SECRET,
  PD_REQUIRED_ABILITY,
  LOG_ENTRIES_POLLING_INTERVAL_SECONDS,
  LOG_ENTRIES_CLEARING_INTERVAL_SECONDS,
  DEBUG_DISABLE_POLLING,
} from 'config/constants';

import 'App.scss';
import 'moment/min/locales.min';

const App = ({
  state,
  startMonitoring,
  userAuthorize,
  checkAbilities,
  checkConnectionStatus,
  updateQueueStats,
  getServicesAsync,
  getTeamsAsync,
  getPrioritiesAsync,
  getUsersAsync,
  getEscalationPoliciesAsync,
  getResponsePlaysAsync,
  getLogEntriesAsync,
  cleanRecentLogEntriesAsync,
  refreshIncidentsAsync,
}) => {
  // Verify if session token is present
  const token = sessionStorage.getItem('pd_access_token');
  const {
    autoRefreshInterval, darkMode,
  } = state.settings;

  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  if (!token) {
    return (
      <div className="App">
        <AuthComponent clientId={PD_OAUTH_CLIENT_ID} clientSecret={PD_OAUTH_CLIENT_SECRET} />
      </div>
    );
  }

  // Begin monitoring and load core objects from API
  const {
    userAuthorized, userAcceptedDisclaimer, currentUserLocale,
  } = state.users;
  const {
    fetchingIncidents,
    fetchingIncidentNotes,
    fetchingIncidentAlerts,
    refreshingIncidents,
    lastFetchDate,
  } = state.incidents;
  const queryError = state.querySettings.error;
  useEffect(() => {
    userAuthorize();
    if (userAuthorized) {
      startMonitoring();
      checkAbilities();
      getUsersAsync();
      getServicesAsync();
      getTeamsAsync();
      getEscalationPoliciesAsync();
      getResponsePlaysAsync();
      getPrioritiesAsync();
      // NB: Get incidents, notes, and alerts are implicitly done from query now
      checkConnectionStatus();
    }
  }, [userAuthorized]);

  // Handle updates to MomentJS locale
  useEffect(() => {
    moment.locale(currentUserLocale);
  }, [currentUserLocale]);

  // Setup log entry polling
  useEffect(
    () => {
      let useLastFetchDate = true;
      const pollingInterval = setInterval(() => {
        checkAbilities();
        checkConnectionStatus();
        const {
          abilities,
        } = store.getState().connection;
        if (userAuthorized && abilities.includes(PD_REQUIRED_ABILITY) && !queryError) {
          // Determine lookback based on last fetch/refresh of incidents
          if (
            !fetchingIncidents
            && !fetchingIncidentNotes
            && !fetchingIncidentAlerts
            && !refreshingIncidents
            && !DEBUG_DISABLE_POLLING
          ) {
            if (useLastFetchDate) {
              getLogEntriesAsync(lastFetchDate);
            } else {
              const lastPolledDate = moment()
                .subtract(2 * LOG_ENTRIES_POLLING_INTERVAL_SECONDS, 'seconds')
                .toDate();
              getLogEntriesAsync(lastPolledDate);
            }
            useLastFetchDate = false;
          }
        }
      }, LOG_ENTRIES_POLLING_INTERVAL_SECONDS * 1000);
      return () => clearInterval(pollingInterval);
    },
    // Changes to any of these in the store resets log entries timer
    [
      userAuthorized,
      queryError,
      fetchingIncidents,
      fetchingIncidentNotes,
      fetchingIncidentAlerts,
      refreshingIncidents,
    ],
  );

  // Setup log entry clearing
  useEffect(() => {
    const clearingInterval = setInterval(() => {
      if (userAuthorized) {
        cleanRecentLogEntriesAsync();
      }
    }, LOG_ENTRIES_CLEARING_INTERVAL_SECONDS * 1000);
    return () => clearInterval(clearingInterval);
  }, [userAuthorized]);

  // Setup queue stats update for status beacon tooltip
  useEffect(() => {
    const queueStateInterval = setInterval(() => {
      if (userAuthorized) {
        updateQueueStats(limiter.counts());
      }
    }, 1000);
    return () => clearInterval(queueStateInterval);
  }, [userAuthorized]);

  // Setup auto-refresh for incidents
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      checkAbilities();
      checkConnectionStatus();
      const {
        abilities,
      } = store.getState().connection;
      if (userAuthorized && abilities.includes(PD_REQUIRED_ABILITY) && !queryError) {
        refreshIncidentsAsync();
      }
    }, autoRefreshInterval * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [userAuthorized, queryError, autoRefreshInterval, fetchingIncidents]);

  // Display disclaimer modal
  if (!userAcceptedDisclaimer) {
    return (
      <div className="App">
        <DisclaimerModalComponent />
      </div>
    );
  }

  // Display user unauthorised modal (if required)
  if (!userAuthorized) {
    return (
      <div className="App">
        <UnauthorizedModalComponent />
      </div>
    );
  }

  return (
    <div className="App">
      <NavigationBarComponent />
      <Container fluid>
        <QuerySettingsComponent />
        <IncidentTableComponent />
        <SettingsModalComponent />
        <IncidentActionsComponent />
        <ActionAlertsModalComponent />
        <CustomSnoozeModalComponent />
        <AddNoteModalComponent />
        <ReassignModalComponent />
        <AddResponderModalComponent />
        <MergeModalComponent />
        <ConfirmQueryModalComponent />
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => ({ state });

const mapDispatchToProps = (dispatch) => ({
  startMonitoring: () => dispatch(startMonitoringConnected()),
  userAuthorize: () => dispatch(userAuthorizeConnected()),
  checkAbilities: () => dispatch(checkAbilitiesConnected()),
  checkConnectionStatus: () => dispatch(checkConnectionStatusConnected()),
  updateQueueStats: (queueStats) => dispatch(updateQueueStatsConnected(queueStats)),
  getServicesAsync: (teamIds) => dispatch(getServicesAsyncConnected(teamIds)),
  getTeamsAsync: () => dispatch(getTeamsAsyncConnected()),
  getPrioritiesAsync: () => dispatch(getPrioritiesAsyncConnected()),
  getUsersAsync: (teamIds) => dispatch(getUsersAsyncConnected(teamIds)),
  getEscalationPoliciesAsync: () => dispatch(getEscalationPoliciesAsyncConnected()),
  getResponsePlaysAsync: () => dispatch(getResponsePlaysAsyncConnected()),
  getLogEntriesAsync: (since) => dispatch(getLogEntriesAsyncConnected(since)),
  cleanRecentLogEntriesAsync: () => dispatch(cleanRecentLogEntriesAsyncConnected()),
  refreshIncidentsAsync: () => dispatch(refreshIncidentsAsyncConnected()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
