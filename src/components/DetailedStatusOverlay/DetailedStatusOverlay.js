/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  useSelector, useDispatch, useStore,
} from 'react-redux';

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
  // VStack,
  // Grid,
  // GridItem,
  Spacer,
  Heading,
  // Code,
} from '@chakra-ui/react';

// import {
//   formatError,
// } from 'pretty-print-error';

import {
  useTranslation,
} from 'react-i18next';

import {
  getIncidentsAsync as getIncidentsAsyncAction,
  UPDATE_INCIDENT_ALERTS,
  UPDATE_INCIDENT_NOTES,
} from 'redux/incidents/actions';

const DetailedStatusOverlay = ({
  btnRef, isOpen, onOpen, onClose,
}) => {
  const store = useStore();
  const {
    t,
  } = useTranslation();
  const {
    status: connectionStatus,
    error: connectionError,
    // errors,
  } = useSelector((state) => state.connection);
  const {
    status: incidentStatus, error: incidentError,
  } = useSelector((state) => state.incidents);
  const {
    status: logEntriesStatus, error: logEntriesError,
  } = useSelector(
    (state) => state.logEntries,
  );
  const {
    status: servicesStatus, error: servicesError,
  } = useSelector((state) => state.services);
  const {
    status: teamsStatus, error: teamsError,
  } = useSelector((state) => state.teams);
  const {
    status: usersStatus,
    error: usersError,
    currentUser,
  } = useSelector((state) => state.users);
  const {
    status: escalationPoliciesStatus, error: escalationPoliciesError,
  } = useSelector(
    (state) => state.escalationPolicies,
  );
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
        badgeProps.colorScheme = 'green';
        break;
      case 'REQUESTED':
        badgeProps.colorScheme = 'yellow';
        break;
      case 'FAILED':
      case 'ERROR':
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
      {/* {error && !(['REQUESTED', 'COMPLETED'].includes(status.split('_').pop())) && ( */}
      {error && (
        <Text fontSize="xs" color="red.500">
          {error}
        </Text>
      )}
    </Box>
  );

  // const boxForError = (error) => {
  //   let errorText;
  //   if (error instanceof String) {
  //     errorText = error;
  //   } else if (error instanceof Error) {
  //     errorText = formatError(error);
  //   } else {
  //     try {
  //       errorText = JSON.stringify(error);
  //     } catch (e) {
  //       try {
  //         errorText = error.toString();
  //       } catch (e2) {
  //         errorText = 'Unknown error';
  //       }
  //     }
  //   }

  //   return (
  //     <Box
  //       rounded="md"
  //       borderWidth="1px"
  //       p={2}
  //       mb={2}
  //     >
  //       <Text m={2} fontSize="sm">
  //         {errorText}
  //       </Text>
  //     </Box>
  //   );
  // };

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
              {t('Status')}
            </Heading>
            {statusFor(t('Connection'), connectionStatus, connectionError)}
            {statusFor(t('Incidents'), incidentStatus, incidentError)}
            {statusFor(t('Log Entries'), logEntriesStatus, logEntriesError)}
            {statusFor(t('Services'), servicesStatus, servicesError)}
            {statusFor(t('Teams'), teamsStatus, teamsError)}
            {statusFor(t('Users'), usersStatus, usersError)}
            {statusFor(t('Escalation Policies'), escalationPoliciesStatus, escalationPoliciesError)}
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
