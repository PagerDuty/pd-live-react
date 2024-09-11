import React, {
  useCallback,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  Box,
  Collapse,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';

import {
  MoonIcon, SunIcon, ViewIcon, ViewOffIcon, HamburgerIcon,
} from '@chakra-ui/icons';

import {
  PD_OAUTH_CLIENT_ID,
} from 'src/config/constants';

import {
  revokeToken,
} from 'src/util/auth';

import {
  toggleDisplayQuerySettings as toggleDisplayQuerySettingsConnected,
} from 'src/redux/query_settings/actions';
import {
  toggleSettingsModal as toggleSettingsModalConnected,
  toggleLoadSavePresetsModal as toggleLoadSavePresetsModalConnected,
  toggleColumnsModal as toggleColumnsModalConnected,
  clearLocalCache as clearLocalCacheConnected,
  setDarkMode as setDarkModeConnected,
} from 'src/redux/settings/actions';
import {
  userAcceptDisclaimer as userAcceptDisclaimerConnected,
  userUnauthorize as userUnauthorizeConnected,
} from 'src/redux/users/actions';
import {
  stopMonitoring as stopMonitoringConnected,
} from 'src/redux/monitoring/actions';

import {
  version as PD_APP_VERSION,
} from 'src/config/version';

import Logo from 'src/assets/images/pd_logo_black.svg';

import GlobalSearchComponent from 'src/components/GlobalSearch/GlobalSearchComponent';
import QuerySettingsComponent from 'src/components/QuerySettings/QuerySettingsComponent';
import DetailedStatusOverlay from 'src/components/DetailedStatusOverlay/DetailedStatusOverlay';
import StatusBeaconComponent from './StatusBeaconComponent';

const NavigationBarComponent = () => {
  const {
    t,
  } = useTranslation();

  const darkMode = useSelector((state) => state.settings.darkMode);
  const displayQuerySettings = useSelector((state) => state.querySettings.displayQuerySettings);

  const dispatch = useDispatch();
  const toggleDisplayQuerySettings = () => dispatch(toggleDisplayQuerySettingsConnected());
  const setDarkMode = (dark) => dispatch(setDarkModeConnected(dark));
  const toggleSettingsModal = () => dispatch(toggleSettingsModalConnected());
  const toggleLoadSavePresetsModal = () => dispatch(toggleLoadSavePresetsModalConnected());
  const toggleColumnsModal = () => dispatch(toggleColumnsModalConnected());
  const clearLocalCache = () => dispatch(clearLocalCacheConnected());
  const userAcceptDisclaimer = () => dispatch(userAcceptDisclaimerConnected());
  const userUnauthorize = () => dispatch(userUnauthorizeConnected());
  const stopMonitoring = () => dispatch(stopMonitoringConnected());

  const {
    colorMode, toggleColorMode,
  } = useColorMode();

  const hideQuerySettings = useCallback(() => {
    if (displayQuerySettings) {
      toggleDisplayQuerySettings();
    }
  }, [displayQuerySettings, toggleDisplayQuerySettings]);

  const showQuerySettings = useCallback(() => {
    if (!displayQuerySettings) {
      toggleDisplayQuerySettings();
    }
  }, [displayQuerySettings, toggleDisplayQuerySettings]);

  const {
    isOpen: isDetailedStatusOpen,
    onOpen: onDetailedStatusOpen,
    onClose: onDetailedStatusClose,
  } = useDisclosure();
  const detailedStatusTriggerRef = React.useRef();

  const syncReduxColorMode = () => {
    if (colorMode === 'dark' && !darkMode) {
      setDarkMode(true);
      document.body.className = 'dark-mode';
    } else if (colorMode === 'light' && darkMode) {
      setDarkMode(false);
      document.body.className = '';
    }
  };
  syncReduxColorMode();
  const setColorMode = (dark) => {
    if (dark && colorMode !== 'dark') {
      toggleColorMode();
    } else if (!dark && colorMode !== 'light') {
      toggleColorMode();
    }
    syncReduxColorMode();
  };
  const DarkModeIconButton = () => (
    <Tooltip label={colorMode === 'dark' ? t('Light Mode') : t('Dark Mode')}>
      <IconButton
        aria-label="Toggle Dark Mode"
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={() => setColorMode(colorMode !== 'dark')}
        size="sm"
      />
    </Tooltip>
  );

  return (
    <Box as="nav" rounded="md">
      <Flex align="center" justify="space-between" wrap="wrap" pl="1rem" pr="1rem" pt="1rem">
        <Flex alt="PagerDuty">
          <Logo title="PagerDuty" width="112px" fill={colorMode === 'dark' ? '#fff' : '#000'} />
          <Text
            id="navbar-ctr"
            fontSize="xl"
            display="inline-block"
            ml={6}
            my="auto"
            verticalAlign="middle"
          >
            {t('Live Incidents Console')}
          </Text>
        </Flex>
        <Flex alignItems="center">
          <GlobalSearchComponent />
          <Tooltip label={displayQuerySettings ? t('Hide filters') : t('Show filters')}>
            <IconButton
              aria-label="Toggle filters"
              icon={displayQuerySettings ? <ViewOffIcon /> : <ViewIcon />}
              onClick={displayQuerySettings ? hideQuerySettings : showQuerySettings}
              size="sm"
              mr={1}
            />
          </Tooltip>
          <DarkModeIconButton mr={2} />
          <Menu>
            <Tooltip label={t('Main menu')}>
              <MenuButton
                className="settings-panel-dropdown"
                as={IconButton}
                size="sm"
                ml={1}
                mr={1}
                aria-label="Settings menu"
                icon={<HamburgerIcon />}
              />
            </Tooltip>
            <MenuList zIndex="999">
              <MenuItem className="dropdown-item" onClick={toggleSettingsModal}>
                {t('Settings')}
              </MenuItem>
              <MenuItem className="dropdown-item" onClick={toggleLoadSavePresetsModal}>
                {t('Load/Save Presets')}
              </MenuItem>
              <MenuItem className="dropdown-item" onClick={toggleColumnsModal}>
                {t('Columns')}
              </MenuItem>
              <MenuItem
                className="dropdown-item"
                onClick={() => {
                  clearLocalCache();
                  window.location.reload();
                }}
              >
                {t('Clear Local Cache')}
              </MenuItem>
              <MenuItem
                className="dropdown-item"
                onClick={() => {
                  const token = sessionStorage.getItem('pd_access_token');
                  if (token) {
                    revokeToken(token, PD_OAUTH_CLIENT_ID);
                  }
                  userAcceptDisclaimer();
                  userUnauthorize();
                  stopMonitoring();
                  sessionStorage.removeItem('pd_access_token');
                  window.location.reload();
                }}
              >
                {t('Log Out')}
              </MenuItem>
              <MenuDivider />
              <MenuItem className="dropdown-item">
                <Link
                  isExternal
                  _hover={{
                    textDecoration: 'none',
                  }}
                  href="https://www.termsfeed.com/live/68d1a0f2-9e68-47d0-9623-68afe0c31f6d"
                >
                  {t('View Disclaimer')}
                </Link>
              </MenuItem>
              <MenuDivider />
              <MenuItem className="version-info" disabled>
                {t('Version')}
                {`: ${PD_APP_VERSION}`}
              </MenuItem>
            </MenuList>
          </Menu>
          <Box
            ref={detailedStatusTriggerRef}
            p={0}
            onClick={isDetailedStatusOpen ? onDetailedStatusClose : onDetailedStatusOpen}
          >
            <StatusBeaconComponent />
          </Box>
        </Flex>
      </Flex>
      <Collapse
        style={{
          overflow: 'visible',
        }}
        in={displayQuerySettings}
      >
        <Box onClose={hideQuerySettings}>
          <QuerySettingsComponent />
        </Box>
      </Collapse>
      <DetailedStatusOverlay
        isOpen={isDetailedStatusOpen}
        onClose={onDetailedStatusClose}
        btnRef={detailedStatusTriggerRef}
      />
    </Box>
  );
};

export default NavigationBarComponent;
