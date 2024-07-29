/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch, useStore,
} from 'react-redux';

import moment from 'moment/min/moment-with-locales';

import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Text,
  Spacer,
  Heading,
  useColorModeValue,
  useToken,
} from '@chakra-ui/react';

import {
  PieChart,
} from 'react-minimal-pie-chart';

import {
  useTranslation,
} from 'react-i18next';

import {
  DATE_FORMAT,
} from 'src/config/constants';

import {
  getIncidentsAsync as getIncidentsAsyncAction,
  UPDATE_INCIDENT_ALERTS,
  UPDATE_INCIDENT_NOTES,
} from 'src/redux/incidents/actions';

import {
  OAUTH_REFRESH_REQUESTED,
} from 'src/redux/connection/actions';

const DetailedStatusOverlay = ({
  btnRef, isOpen, onOpen, onClose,
}) => {
  const store = useStore();
  const {
    t,
  } = useTranslation();

  const {
    status: incidentStatus,
    error: incidentError,
    incidents,
    incidentAlerts,
    incidentNotes,
  } = useSelector((state) => state.incidents);
  const {
    // status: logEntriesStatus, error: logEntriesError,
    latestLogEntryDate,
    pollingStatus: {
      polling: logEntriesPolling,
      lastPollStarted,
      lastPollCompleted,
      errors: pollingErrors,
    },
  } = useSelector((state) => state.logEntries);
  const {
    currentUser,
  } = useSelector((state) => state.users);
  const {
    status: extensionsStatus, error: extensionsError,
  } = useSelector(
    (state) => state.extensions,
  );
  const {
    status: responsePlaysStatus, error: responsePlaysError,
  } = useSelector(
    (state) => state.responsePlays,
  );

  const dispatch = useDispatch();
  const getIncidents = () => dispatch(getIncidentsAsyncAction());
  const clearAlerts = () => dispatch({
    type: UPDATE_INCIDENT_ALERTS,
    incidentId: 'CLEAR_ALL',
  });
  const clearNotes = () => dispatch({
    type: UPDATE_INCIDENT_NOTES,
    incidentId: 'CLEAR_ALL',
  });

  const badgeForStatus = (status) => {
    const badgeProps = {
      variant: 'solid',
    };
    const badgeText = status.split('_').pop();
    switch (badgeText) {
      case 'COMPLETED':
      case 'STARTED':
        badgeProps.colorScheme = 'green';
        break;
      case 'REQUESTED':
        badgeProps.colorScheme = 'yellow';
        break;
      case 'FAILED':
      case 'ERROR':
      case 'STOPPED':
        badgeProps.colorScheme = 'red';
        break;
      default:
        badgeProps.colorScheme = 'gray';
        break;
    }
    return (
      <Badge ml={2} {...badgeProps}>
        {badgeText}
      </Badge>
    );
  };

  const statusFor = (item, status, error) => (
    <Box>
      <Flex>
        <Box>
          <Text fontSize="sm" fontWeight="bold">
            {item}
          </Text>
        </Box>
        <Spacer />
        <Box>{badgeForStatus(status)}</Box>
      </Flex>
      {error && (
        <Text fontSize="xs" color="red.500">
          {error}
        </Text>
      )}
    </Box>
  );

  const pieChartLabels = {
    fetching: t('Fetching'),
    fetched: t('Fetched'),
    error: t('Error'),
    not_fetched: t('Not requested'),
  };
  const useColorModeToken = (lightColor, darkColor) => useColorModeValue(useToken('colors', lightColor), useToken('colors', darkColor));
  const pieChartColors = {
    fetching: useColorModeToken('blue.300', 'blue.600'),
    fetched: useColorModeToken('green.200', 'green.500'),
    error: useColorModeToken('red.300', 'red.600'),
    not_fetching: useColorModeToken('gray.200', 'whiteAlpha.300'),
  };

  const fetchCounts = useMemo(() => {
    const counts = {
      total: 0,
      alerts: {
        fetched: 0,
        fetching: 0,
        not_fetched: 0,
        error: 0,
      },
      notes: {
        fetched: 0,
        fetching: 0,
        not_fetched: 0,
        error: 0,
      },
    };
    incidents.forEach((incident) => {
      counts.total += 1;
      if (incidentAlerts[incident.id] instanceof Array) {
        counts.alerts.fetched += 1;
      } else if (incidentAlerts[incident.id] instanceof Object) {
        if (incidentAlerts[incident.id].status === 'fetching') {
          counts.alerts.fetching += 1;
        } else if (incidentAlerts[incident.id].status === 'error') {
          counts.alerts.error += 1;
        }
      } else {
        counts.alerts.not_fetched += 1;
      }
      if (incidentNotes[incident.id] instanceof Array) {
        counts.notes.fetched += 1;
      } else if (incidentNotes[incident.id] instanceof Object) {
        if (incidentNotes[incident.id].status === 'fetching') {
          counts.notes.fetching += 1;
        } else if (incidentNotes[incident.id].status === 'error') {
          counts.notes.error += 1;
        }
      } else {
        counts.notes.not_fetched += 1;
      }
    });
    const pieChartData = {
      notes: Object.entries(counts.notes).map(([key, value]) => ({
        title: `${pieChartLabels[key]}: ${value}`,
        value,
        color: pieChartColors[key],
      })),
      alerts: Object.entries(counts.alerts).map(([key, value]) => ({
        title: `${pieChartLabels[key]}: ${value}`,
        value,
        color: pieChartColors[key],
      })),
    };
    return pieChartData;
  }, [incidents, incidentAlerts, incidentNotes]);

  const IncidentAlertsPie = () => (
    <Flex direction="row" alignItems="center" justifyContent="space-between">
      <Box flex="1" px={1}>
        <Flex px={1} alignItems="center" justifyContent="center">
          <Box>
            <Text mt={3} fontSize="sm" fontWeight="bold">
              {t('Alerts')}
            </Text>
          </Box>
          <Spacer />
          <Box h={10} w={10} mr={4}>
            <PieChart data={fetchCounts.alerts} lineWidth={35} />
          </Box>
        </Flex>
      </Box>
      <Box flex="1" px={1}>
        <Flex px={1} alignItems="center" justifyContent="center">
          <Box>
            <Text mt={3} fontSize="sm" fontWeight="bold">
              {t('Notes')}
            </Text>
          </Box>
          <Spacer />
          <Box h={10} w={10} mr={4}>
            <PieChart data={fetchCounts.notes} lineWidth={35} />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Drawer
      onOpen={onOpen}
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t('Detailed Status')}</DrawerHeader>
        <DrawerBody>
          <Box rounded="md" borderWidth="1px" p={2} mb={2}>
            <Text m={2} fontSize="sm" fontWeight="bold">
              {currentUser?.summary}
            </Text>
            <Text m={2} fontSize="xs">
              {currentUser?.email}
            </Text>
            <Text m={2} fontSize="xs" fontWeight="bold">
              {currentUser?.html_url
                ? currentUser.html_url.match(/https:\/\/(.*)\.pagerduty.com\/.*/)[1]
                : 'no URL'}
            </Text>
          </Box>
          <Box rounded="md" borderWidth="1px" p={2} mb={2}>
            <Heading size="sm" pb={4} borderBottomWidth="1px">
              {t('Activity')}
            </Heading>
            <IncidentAlertsPie />
          </Box>
          <Box rounded="md" borderWidth="1px" p={2} mb={2}>
            <Heading size="sm" pb={4} borderBottomWidth="1px">
              {t('Live Updates')}
            </Heading>
            {statusFor(t('Polling'), logEntriesPolling ? 'STARTED' : 'STOPPED', '')}
            <Text fontSize="xs" mb={0}>
              {t('Last Requested')}
              :
            </Text>
            <Text fontSize="xs">
              {lastPollStarted
                ? moment(lastPollStarted.toISOString()).format(DATE_FORMAT)
                : t('n/a')}
            </Text>
            <Text fontSize="xs" mb={0}>
              {t('Last Completed')}
              :
            </Text>
            <Text fontSize="xs">
              {lastPollCompleted
                ? moment(lastPollCompleted.toISOString()).format(DATE_FORMAT)
                : t('n/a')}
            </Text>
            <Text fontSize="xs" mb={0}>
              {t('Latest Log Entry')}
              :
            </Text>
            <Text fontSize="xs">
              {latestLogEntryDate
                ? moment(latestLogEntryDate.toISOString()).format(DATE_FORMAT)
                : t('n/a')}
            </Text>
            {pollingErrors.length > 0 && (
              <Text fontSize="xs" color="red.500">
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => {
                    // eslint-disable-next-line no-console
                    console.log(pollingErrors);
                  }}
                >
                  {t(`Log ${pollingErrors.length} Errors`)}
                </Button>
              </Text>
            )}
          </Box>
          <Box rounded="md" borderWidth="1px" p={2} mb={2}>
            <Heading size="sm" pb={4} borderBottomWidth="1px">
              {t('Status')}
            </Heading>
            {statusFor(t('Incidents'), incidentStatus, incidentError)}
            {statusFor(t('Extensions'), extensionsStatus, extensionsError)}
            {statusFor(t('Response Plays'), responsePlaysStatus, responsePlaysError)}
          </Box>
          <Box rounded="md" borderWidth="1px" p={2} mb={2}>
            <Heading size="sm" pb={4} borderBottomWidth="1px">
              {t('Debugging Actions')}
            </Heading>
            <Button
              size="sm"
              m={2}
              colorScheme="green"
              onClick={() => {
                dispatch({
                  type: OAUTH_REFRESH_REQUESTED,
                });
              }}
            >
              {t('Refresh OAuth Token')}
            </Button>
            <Button
              size="sm"
              m={2}
              colorScheme="red"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log(store.getState());
              }}
            >
              {t('Log App State to console')}
            </Button>
            <Button
              size="sm"
              m={2}
              colorScheme="red"
              onClick={() => {
                getIncidents();
              }}
            >
              {t('Refresh Incidents')}
            </Button>
            <Button
              size="sm"
              m={2}
              colorScheme="red"
              onClick={() => {
                clearAlerts();
              }}
            >
              {t('Clear Alerts')}
            </Button>
            <Button
              size="sm"
              m={2}
              colorScheme="red"
              onClick={() => {
                clearNotes();
              }}
            >
              {t('Clear Notes')}
            </Button>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailedStatusOverlay;
