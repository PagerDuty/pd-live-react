import React, {
  useCallback,
  useMemo,
} from 'react';

import {
  useDispatch,
} from 'react-redux';

import {
  Box,
  Link,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Th,
  Tr,
  Td,
  // Text,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react';

import {
  CheckCircleIcon, WarningTwoIcon,
} from '@chakra-ui/icons';

import {
  setShowIncidentAlertsModalForIncidentId as setShowIncidentAlertsModalForIncidentIdConnected,
} from 'src/redux/settings/actions';

import {
  getIncidentAlertsAsync as getIncidentAlertsAsyncConnected,
} from 'src/redux/incidents/actions';

const NumAlertsComponent = ({
  incident,
}) => {
  const numAlerts = incident?.alert_counts?.all || 0;
  const alerts = incident?.alerts;
  const incidentId = incident?.id;

  const dispatch = useDispatch();
  const setShowIncidentAlertsModalForIncidentId = (showIncidentAlertsModalforIncidentId) => {
    dispatch(setShowIncidentAlertsModalForIncidentIdConnected(showIncidentAlertsModalforIncidentId));
  };
  const getIncidentAlerts = useCallback(
    (id) => {
      dispatch(getIncidentAlertsAsyncConnected(id));
    },
    [dispatch],
  );

  const tooltipText = useMemo(
    () => {
      let r;
      if (alerts instanceof Array && alerts.length > 0) {
        const alertsSortedDescendingDate = [...alerts].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        r = (
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Created At</Th>
                  <Th>Status</Th>
                  <Th>Summary</Th>
                </Tr>
              </Thead>
              <Tbody>
                {alertsSortedDescendingDate.slice(0, 20).map((alert) => (
                  <Tr key={alert.id}>
                    <Td>{new Date(alert.created_at).toLocaleString()}</Td>
                    <Td aria-label={alert.status}>
                      {alert.status === 'triggered' ? (
                        <WarningTwoIcon color="red.500" />
                      ) : (
                        <CheckCircleIcon color="green.500" />
                      )}
                    </Td>
                    <Td>
                      <Link href={alert.html_url} isExternal>
                        {alert.summary}
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
              {alertsSortedDescendingDate.length > 20 && (
              <Tfoot>
                <Tr>
                  <Th colSpan={3}>{`${alertsSortedDescendingDate.length - 20} more not shown`}</Th>
                </Tr>
              </Tfoot>
              )}
            </Table>
          </TableContainer>
        );
      } else if (alerts instanceof Array && alerts.length === 0) {
        r = <Box p={4}>No alerts</Box>;
      } else if (alerts?.status) {
        r = <Box p={4}>{alerts.status}</Box>;
      }
      return r;
    },
    [alerts],
  );

  return (
    <Popover
      trigger="hover"
      size="content"
      preventOverflow
      onOpen={() => {
        getIncidentAlerts(incidentId);
      }}
    >
      <PopoverTrigger>
        <Box
          m={0}
          p={2}
          cursor="default"
          onClick={
            alerts instanceof Array && alerts.length > 0
              ? () => { setShowIncidentAlertsModalForIncidentId(incidentId); }
              : undefined
          }
        >
          {numAlerts}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="content">
        <PopoverArrow />
        {tooltipText}
      </PopoverContent>
    </Popover>
  );
};

export default NumAlertsComponent;
