import React from 'react';

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
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react';

import {
  CheckCircleIcon,
  WarningTwoIcon,
} from '@chakra-ui/icons';

const NumAlertsComponent = ({
  alerts,
}) => {
  let value;
  if (alerts instanceof Array) {
    value = `${alerts.length}`;
  } else if (alerts.status) {
    value = alerts.status;
  } else {
    value = '';
  }
  let tooltipText;
  if (alerts instanceof Array && alerts.length > 0) {
    const alertsSortedDescendingDate = [...alerts].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    tooltipText = (
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>
                Created At
              </Th>
              <Th>
                Status
              </Th>
              <Th>
                Summary
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {
              alertsSortedDescendingDate.slice(0, 20).map((alert) => (
                <Tr key={alert.id}>
                  <Td>
                    {new Date(alert.created_at).toLocaleString()}
                  </Td>
                  <Td aria-label={alert.status}>
                    {
                      alert.status === 'triggered'
                        ? <WarningTwoIcon color="red.500" />
                        : <CheckCircleIcon color="green.500" />
                    }
                  </Td>
                  <Td>
                    <Link
                      href={alert.html_url}
                      isExternal
                    >
                      {alert.summary}
                    </Link>
                  </Td>
                </Tr>
              ))
            }
          </Tbody>
          {(alertsSortedDescendingDate.length > 20) && (
            <Tfoot>
              <Tr>
                <Th colSpan={3}>
                  {`${alertsSortedDescendingDate.length - 20} more not shown`}
                </Th>
              </Tr>
            </Tfoot>
          )}
        </Table>
      </TableContainer>
    );
  } else if (alerts instanceof Array && alerts.length === 0) {
    tooltipText = (
      <Box p={4}>
        No alerts
      </Box>
    );
  } else if (alerts.status) {
    tooltipText = (
      <Box p={4}>
        {alerts.status}
      </Box>
    );
  }
  return (
    <Popover trigger="hover" size="content" preventOverflow>
      <PopoverTrigger>
        <Box
          m={0}
          p={2}
          cursor="default"
        >
          {value}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="content">
        {tooltipText}
      </PopoverContent>
    </Popover>
  );
};

export default NumAlertsComponent;
