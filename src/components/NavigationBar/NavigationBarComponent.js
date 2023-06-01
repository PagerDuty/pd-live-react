import React, {
  useCallback,
} from 'react';

import {
  useSelector,
  useDispatch,
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
  MoonIcon,
  SunIcon,
  ViewIcon,
  ViewOffIcon,
  HamburgerIcon,
} from '@chakra-ui/icons';

import {
  PD_OAUTH_CLIENT_ID,
  PD_OAUTH_CLIENT_SECRET,
} from 'config/constants';

import {
  revokeToken,
} from 'util/auth';

import {
  toggleDisplayQuerySettings as toggleDisplayQuerySettingsConnected,
} from 'redux/query_settings/actions';
import {
  toggleSettingsModal as toggleSettingsModalConnected,
  toggleColumnsModal as toggleColumnsModalConnected,
  clearLocalCache as clearLocalCacheConnected,
  setDarkMode as setDarkModeConnected,
} from 'redux/settings/actions';
import {
  userAcceptDisclaimer as userAcceptDisclaimerConnected,
  userUnauthorize as userUnauthorizeConnected,
} from 'redux/users/actions';
import {
  stopMonitoring as stopMonitoringConnected,
} from 'redux/monitoring/actions';

import PD_APP_VERSION from 'config/version';

import {
  ReactComponent as Logo,
} from 'assets/images/pd_logo_black.svg';

import GlobalSearchComponent from 'components/GlobalSearch/GlobalSearchComponent';
import QuerySettingsComponent from 'components/QuerySettings/QuerySettingsComponent';
import DetailedStatusOverlay from 'components/DetailedStatusOverlay/DetailedStatusOverlay';
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
  const toggleColumnsModal = () => dispatch(toggleColumnsModalConnected());
  const clearLocalCache = () => dispatch(clearLocalCacheConnected());
  const userAcceptDisclaimer = () => dispatch(userAcceptDisclaimerConnected());
  const userUnauthorize = () => dispatch(userUnauthorizeConnected());
  const stopMonitoring = () => dispatch(stopMonitoringConnected());

  const {
    colorMode,
    toggleColorMode,
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
    <Tooltip
      label={colorMode === 'dark' ? t('Light mode') : t('Dark mode')}
    >
      <IconButton
        aria-label="Toggle dark mode"
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={() => setColorMode(colorMode !== 'dark')}
        size="sm"
      />
    </Tooltip>
  );

  return (
    <Box
      as="nav"
      rounded="md"
    >
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
        pl="1rem"
        pr="1rem"
        pt="1rem"
      >
        <Flex
          alt="PagerDuty"
        >
          <Logo
            title="PagerDuty"
            width="112px"
            fill={colorMode === 'dark' ? '#fff' : '#000'}
          />
          <Text
            fontSize="xl"
            display="inline-block"
            ml={6}
            my="auto"
            verticalAlign="middle"
          >
            {t('Live Incidents Console')}
          </Text>
        </Flex>
        <Flex
          alignItems="center"
        >
          <GlobalSearchComponent />
          <Tooltip
            label={displayQuerySettings ? t('Hide filters') : t('Show filters')}
          >
            <IconButton
              aria-label="Toggle filters"
              icon={displayQuerySettings ? <ViewOffIcon /> : <ViewIcon />}
              onClick={displayQuerySettings ? hideQuerySettings : showQuerySettings}
              size="sm"
              mr={1}
            />
          </Tooltip>
          <DarkModeIconButton
            mr={2}
          />
          <Menu>
            <Tooltip
              label={t('Main menu')}
            >
              <MenuButton
                as={IconButton}
                size="sm"
                ml={1}
                mr={1}
                aria-label="Settings menu"
                icon={<HamburgerIcon />}
              />
            </Tooltip>
            <MenuList zIndex="999">
              <MenuItem
                onClick={toggleSettingsModal}
              >
                {t('Settings')}
              </MenuItem>
              <MenuItem
                onClick={toggleColumnsModal}
              >
                {t('Columns')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  clearLocalCache();
                  window.location.reload();
                }}
              >
                {t('Clear Local Cache')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const token = sessionStorage.getItem('pd_access_token');
                  if (token) {
                    revokeToken(token, PD_OAUTH_CLIENT_ID, PD_OAUTH_CLIENT_SECRET);
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
              <MenuItem>
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
              <MenuItem
                disabled
              >
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
        <Box
          onClose={hideQuerySettings}
        >
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
