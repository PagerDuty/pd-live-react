import React, {
  useEffect, useMemo, useState,
} from 'react';
import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  DndProvider,
} from 'react-dnd';
import {
  HTML5Backend,
} from 'react-dnd-html5-backend';

import {
  Box, Flex,
} from '@chakra-ui/react';

import moment from 'moment/min/moment-with-locales';

import CatastropheModal from 'src/components/CatastropheModal/CatastropheModal';
import AuthComponent from 'src/components/Auth/AuthComponent';
import UnauthorizedModalComponent from 'src/components/UnauthorizedModal/UnauthorizedModalComponent';
import DisclaimerModalComponent from 'src/components/DisclaimerModal/DisclaimerModalComponent';
import NavigationBarComponent from 'src/components/NavigationBar/NavigationBarComponent';
import SettingsModalComponent from 'src/components/SettingsModal/SettingsModalComponent';
import LoadSavePresetsModal from 'src/components/NavigationBar/subcomponents/LoadSavePresetsModal';
import ColumnsModalComponent from 'src/components/ColumnsModal/ColumnsModalComponent';
import IncidentTableComponent from 'src/components/IncidentTable/IncidentTableComponent';
import IncidentActionsComponent from 'src/components/IncidentActions/IncidentActionsComponent';
import ActionAlertsModalComponent from 'src/components/ActionAlertsModal/ActionAlertsModalComponent';
import CustomSnoozeModalComponent from 'src/components/CustomSnoozeModal/CustomSnoozeModalComponent';
import AddNoteModalComponent from 'src/components/AddNoteModal/AddNoteModalComponent';
import ReassignModalComponent from 'src/components/ReassignModal/ReassignModalComponent';
import AddResponderModalComponent from 'src/components/AddResponderModal/AddResponderModalComponent';
import MergeModalComponent from 'src/components/MergeModal/MergeModalComponent';
import IncidentAlertsModal from 'src/components/IncidentTable/subcomponents/IncidentAlertsModal';

import {
  getExtensionsAsync as getExtensionsAsyncConnected,
} from 'src/redux/extensions/actions';
import {
  getIncidentsAsync as getIncidentsAsyncConnected,
} from 'src/redux/incidents/actions';
import {
  START_LOG_ENTRIES_POLLING,
  STOP_LOG_ENTRIES_POLLING,
  START_CLEAN_RECENT_LOG_ENTRIES_POLLING,
  STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING,
} from 'src/redux/log_entries/actions';
import {
  getPrioritiesAsync as getPrioritiesAsyncConnected,
} from 'src/redux/priorities/actions';
import {
  userAuthorize as userAuthorizeConnected,
} from 'src/redux/users/actions';
import {
  getResponsePlaysAsync as getResponsePlaysAsyncConnected,
} from 'src/redux/response_plays/actions';
import {
  START_CONNECTION_STATUS_POLLING,
  START_ABILITIES_POLLING,
  STOP_ABILITIES_POLLING,
  START_QUEUE_STATS_POLLING,
  START_OAUTH_REFRESH_POLLING,
  STOP_OAUTH_REFRESH_POLLING,
  CATASTROPHE,
} from 'src/redux/connection/actions';
import {
  startMonitoring as startMonitoringConnected,
} from 'src/redux/monitoring/actions';

import {
  PD_OAUTH_CLIENT_ID,
  PD_OAUTH_CLIENT_SECRET,
} from 'src/config/constants';

import 'src/App.scss';
import 'moment/min/locales.min';

const App = () => {
  const dispatch = useDispatch();
  const startMonitoring = () => dispatch(startMonitoringConnected());
  const userAuthorize = () => dispatch(userAuthorizeConnected());
  const getExtensionsAsync = () => dispatch(getExtensionsAsyncConnected());
  const getPrioritiesAsync = () => dispatch(getPrioritiesAsyncConnected());
  const getResponsePlaysAsync = () => dispatch(getResponsePlaysAsyncConnected());
  const getIncidentsAsync = () => dispatch(getIncidentsAsyncConnected());

  const darkMode = useSelector((state) => state.settings.darkMode);

  const {
    userAuthorized, userAcceptedDisclaimer, currentUserLocale,
  } = useSelector(
    (state) => state.users,
  );

  const {
    status: connectionStatus,
    connectionStatusMessage,
  } = useSelector((state) => state.connection);
  const [catastrophe, setCatastrophe] = useState(false);
  useEffect(() => {
    if (connectionStatus === CATASTROPHE) {
      setCatastrophe(true);
    }
  }, [connectionStatus]);

  const token = useMemo(() => sessionStorage.getItem('pd_access_token'), [userAuthorized]);

  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  // Begin monitoring and load core objects from API
  useEffect(() => {
    userAuthorize();
    if (token && userAuthorized) {
      startMonitoring();
      getPrioritiesAsync();
      getIncidentsAsync();
      getExtensionsAsync();
      getResponsePlaysAsync();
    }
  }, [userAuthorized]);

  // Handle updates to MomentJS locale
  useEffect(() => {
    moment.locale(currentUserLocale);
  }, [currentUserLocale]);

  // Set up API polling
  useEffect(() => {
    if (token && userAuthorized && userAcceptedDisclaimer) {
      dispatch({ type: START_LOG_ENTRIES_POLLING });
      dispatch({ type: START_CLEAN_RECENT_LOG_ENTRIES_POLLING });
      dispatch({ type: START_ABILITIES_POLLING });
      dispatch({ type: START_OAUTH_REFRESH_POLLING });
    } else {
      dispatch({ type: STOP_LOG_ENTRIES_POLLING });
      dispatch({ type: STOP_CLEAN_RECENT_LOG_ENTRIES_POLLING });
      dispatch({ type: STOP_ABILITIES_POLLING });
      dispatch({ type: STOP_OAUTH_REFRESH_POLLING });
    }
  }, [userAuthorized, userAcceptedDisclaimer]);

  // Set up connection status polling
  useEffect(() => {
    dispatch({ type: START_CONNECTION_STATUS_POLLING });
    dispatch({ type: START_QUEUE_STATS_POLLING });
  }, []);

  if (catastrophe) {
    return (
      <CatastropheModal
        errorMessage={connectionStatusMessage}
      />
    );
  }

  if (typeof token !== 'string' || !token.startsWith('pd')) {
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
        <Box as="header" top={0} w="100%" pb={1}>
          <NavigationBarComponent />
        </Box>
        <Box as="main" id="main">
          <IncidentTableComponent />
          <SettingsModalComponent />
          <LoadSavePresetsModal />
          <DndProvider backend={HTML5Backend}>
            <ColumnsModalComponent />
          </DndProvider>
          <ActionAlertsModalComponent />
          <CustomSnoozeModalComponent />
          <AddNoteModalComponent />
          <ReassignModalComponent />
          <AddResponderModalComponent />
          <MergeModalComponent />
          <IncidentAlertsModal />
        </Box>
        <Flex as="footer" position="fixed" bottom={0} w="100%" zIndex="1" pt={1}>
          <IncidentActionsComponent />
        </Flex>
      </Box>
    </div>
  );
};

export default App;
