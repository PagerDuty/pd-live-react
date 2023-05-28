/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-vars */
import React from 'react';

import {
  useSelector,
} from 'react-redux';

import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Text,
  VStack,
  Grid,
  GridItem,
  Spacer,
  Heading,
  Code,
} from '@chakra-ui/react';

import {
  formatError,
} from 'pretty-print-error';

const DetailedStatusOverlay = ({
  btnRef,
  isOpen,
  onOpen,
  onClose,
}) => {
  const {
    status: connectionStatus,
    error: connectionError,
    errors,
  } = useSelector((state) => state.connection);
  const {
    status: incidentStatus,
    error: incidentError,
  } = useSelector((state) => state.incidents);
  const {
    status: logEntriesStatus,
    error: logEntriesError,
  } = useSelector((state) => state.logEntries);
  const {
    status: servicesStatus,
    error: servicesError,
  } = useSelector((state) => state.services);
  const {
    status: teamsStatus,
    error: teamsError,
  } = useSelector((state) => state.teams);
  const {
    status: usersStatus,
    error: usersError,
    currentUser,
  } = useSelector((state) => state.users);
  const {
    status: escalationPoliciesStatus,
    error: escalationPoliciesError,
  } = useSelector((state) => state.escalationPolicies);
  const {
    status: extensionsStatus,
    error: extensionsError,
  } = useSelector((state) => state.extensions);
  const {
    status: responsePlaysStatus,
    error: responsePlaysError,
  } = useSelector((state) => state.responsePlays);

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
        <Box>
          {badgeForStatus(status)}
        </Box>
      </Flex>
      {/* {error && !(['REQUESTED', 'COMPLETED'].includes(status.split('_').pop())) && ( */}
      {error && (
        <Text fontSize="xs" color="red.500">{error}</Text>
      )}
    </Box>
  );

  const boxForError = (error) => {
    let errorText;
    if (error instanceof String) {
      errorText = error;
    } else if (error instanceof Error) {
      errorText = formatError(error);
    } else {
      try {
        errorText = JSON.stringify(error);
      } catch (e) {
        try {
          errorText = error.toString();
        } catch (e2) {
          errorText = 'Unknown error';
        }
      }
    }

    return (
      <Box
        rounded="md"
        borderWidth="1px"
        p={2}
        mb={2}
      >
        <Text m={2} fontSize="sm">
          {errorText}
        </Text>
      </Box>
    );
  };

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
        <DrawerHeader>Detailed Status</DrawerHeader>
        <DrawerBody>
          <Box
            rounded="md"
            borderWidth="1px"
            p={2}
            mb={2}
          >
            <Text m={2} fontSize="sm" fontWeight="bold">
              {currentUser?.summary}
            </Text>
            <Text m={2} fontSize="xs">
              {currentUser?.email}
            </Text>
            <Text m={2} fontSize="xs" fontWeight="bold">
              {
                currentUser?.html_url
                  ? currentUser.html_url.match(/https:\/\/(.*)\.pagerduty.com\/.*/)[1]
                  : 'no URL'
              }
            </Text>
          </Box>
          <Box
            rounded="md"
            borderWidth="1px"
            p={2}
            mb={2}
          >
            <Heading size="sm" pb={4} borderBottomWidth="1px">Status</Heading>
            {statusFor('Connection', connectionStatus, connectionError)}
            {statusFor('Incidents', incidentStatus, incidentError)}
            {statusFor('Log Entries', logEntriesStatus, logEntriesError)}
            {statusFor('Services', servicesStatus, servicesError)}
            {statusFor('Teams', teamsStatus, teamsError)}
            {statusFor('Users', usersStatus, usersError)}
            {statusFor('Escalation Policies', escalationPoliciesStatus, escalationPoliciesError)}
            {statusFor('Extensions', extensionsStatus, extensionsError)}
            {statusFor('Response Plays', responsePlaysStatus, responsePlaysError)}
          </Box>
          <Box
            rounded="md"
            borderWidth="1px"
            p={2}
            mb={2}
          >
            <Heading size="sm" pb={4} borderBottomWidth="1px">Messages</Heading>
            {errors.map((error, idx) => (
              <Code
                as="pre"
                rounded="md"
                fontSize="xs"
                p={2}
                mb={2}
                // eslint-disable-next-line react/no-array-index-key
                key={`${error}-${idx}`}
              >
                {error}
              </Code>
            ))}
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailedStatusOverlay;
