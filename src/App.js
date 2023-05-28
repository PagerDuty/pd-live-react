import {
  useEffect, useRef,
} from 'react';
import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Box,
  Flex,
} from '@chakra-ui/react';

import moment from 'moment';

import AuthComponent from 'components/Auth/AuthComponent';
import UnauthorizedModalComponent from 'components/UnauthorizedModal/UnauthorizedModalComponent';
import DisclaimerModalComponent from 'components/DisclaimerModal/DisclaimerModalComponent';
import NavigationBarComponent from 'components/NavigationBar/NavigationBarComponent';
import SettingsModalComponent from 'components/SettingsModal/SettingsModalComponent';
import ColumnsModalComponent from 'components/ColumnsModal/ColumnsModalComponent';
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
  getIncidentsAsync as getIncidentsAsyncConnected,
  // refreshIncidentsAsync as refreshIncidentsAsyncConnected,
} from 'redux/incidents/actions';
import {
  getLogEntriesAsync as getLogEntriesAsyncConnected,
  // cleanRecentLogEntriesAsync as cleanRecentLogEntriesAsyncConnected,
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
  getLimiterStats,
} from 'util/pd-api-wrapper';

import {
  PD_OAUTH_CLIENT_ID,
  PD_OAUTH_CLIENT_SECRET,
  PD_REQUIRED_ABILITY,
  LOG_ENTRIES_POLLING_INTERVAL_SECONDS,
  // TODO: Implement log entries clearing
  // LOG_ENTRIES_CLEARING_INTERVAL_SECONDS,
  DEBUG_DISABLE_POLLING,
} from 'config/constants';

import 'App.scss';
import 'moment/min/locales.min';

const App = () => {
  // Verify if session token is present
  const token = sessionStorage.getItem('pd_access_token');

  const dispatch = useDispatch();
  const startMonitoring = () => dispatch(startMonitoringConnected());
  const userAuthorize = () => dispatch(userAuthorizeConnected());
  const checkAbilities = () => dispatch(checkAbilitiesConnected());
  const checkConnectionStatus = () => dispatch(checkConnectionStatusConnected());
  const updateQueueStats = (queueStats) => dispatch(updateQueueStatsConnected(queueStats));
  const getServicesAsync = (teamIds) => dispatch(getServicesAsyncConnected(teamIds));
  const getTeamsAsync = () => dispatch(getTeamsAsyncConnected());
  const getPrioritiesAsync = () => dispatch(getPrioritiesAsyncConnected());
  const getUsersAsync = (teamIds) => dispatch(getUsersAsyncConnected(teamIds));
  const getEscalationPoliciesAsync = () => dispatch(getEscalationPoliciesAsyncConnected());
  const getResponsePlaysAsync = () => dispatch(getResponsePlaysAsyncConnected());
  const getLogEntriesAsync = (since) => dispatch(getLogEntriesAsyncConnected(since));
  // const cleanRecentLogEntriesAsync = () => dispatch(cleanRecentLogEntriesAsyncConnected());
  const getIncidentsAsync = () => dispatch(getIncidentsAsyncConnected());

  const darkMode = useSelector((state) => state.settings.darkMode);
  const abilities = useSelector((state) => state.connection.abilities);
  const userAuthorized = useSelector((state) => state.users.userAuthorized);
  const userAcceptedDisclaimer = useSelector((state) => state.users.userAcceptedDisclaimer);
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);
  const fetchingIncidents = useSelector((state) => state.incidents.fetchingIncidents);
  const fetchingIncidentNotes = useSelector((state) => state.incidents.fetchingIncidentNotes);
  const fetchingIncidentAlerts = useSelector((state) => state.incidents.fetchingIncidentAlerts);
  const refreshingIncidents = useSelector((state) => state.incidents.refreshingIncidents);
  const lastFetchDate = useSelector((state) => state.incidents.lastFetchDate);
  const queryError = useSelector((state) => state.querySettings.error);

  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  // Begin monitoring and load core objects from API
  useEffect(() => {
    userAuthorize();
    if (token && userAuthorized) {
      startMonitoring();
      checkAbilities();
      getUsersAsync();
      getServicesAsync();
      getTeamsAsync();
      getEscalationPoliciesAsync();
      getResponsePlaysAsync();
      getPrioritiesAsync();
      // NB: Get incidents, notes, and alerts are implicitly done from query now
      // not anymore
      getIncidentsAsync();
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
        // TODO: check abilities but less frequently
        // checkAbilities();
        checkConnectionStatus();
        // const {
        //   abilities,
        // } = state.connection;
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
  // useEffect(() => {
  //   const clearingInterval = setInterval(() => {
  //     if (userAuthorized) {
  //       cleanRecentLogEntriesAsync();
  //     }
  //   }, LOG_ENTRIES_CLEARING_INTERVAL_SECONDS * 1000);
  //   return () => clearInterval(clearingInterval);
  // }, [userAuthorized]);

  // Setup queue stats update for status beacon tooltip
  useEffect(() => {
    const queueStateInterval = setInterval(() => {
      if (userAuthorized) {
        updateQueueStats(getLimiterStats());
      }
    }, 2000);
    return () => clearInterval(queueStateInterval);
  }, [userAuthorized]);

  const headerRef = useRef(null);
  const mainRef = useRef(null);
  const footerRef = useRef(null);

  if (!token) {
    return (
      <div className="App">
        <AuthComponent clientId={PD_OAUTH_CLIENT_ID} clientSecret={PD_OAUTH_CLIENT_SECRET} />
      </div>
    );
  }

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
      <Box position="fixed" w="100%" h="100%" overflow="hidden">
        <Box
          as="header"
          top={0}
          w="100%"
          pb={2}
          ref={headerRef}
        >
          <NavigationBarComponent />
        </Box>
        <Box
          ref={mainRef}
          as="main"
          id="main"
        >
          <IncidentTableComponent headerRef={headerRef} mainRef={mainRef} footerRef={footerRef} />
          <SettingsModalComponent />
          <ColumnsModalComponent />
          <ActionAlertsModalComponent />
          <CustomSnoozeModalComponent />
          <AddNoteModalComponent />
          <ReassignModalComponent />
          <AddResponderModalComponent />
          <MergeModalComponent />
          <ConfirmQueryModalComponent />
        </Box>
        <Flex
          as="footer"
          position="fixed"
          bottom={0}
          w="100%"
          zIndex="1"
          ref={footerRef}
        >
          <IncidentActionsComponent />
        </Flex>
      </Box>
    </div>
  );
};

export default App;
