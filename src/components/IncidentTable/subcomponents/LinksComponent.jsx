import React from 'react';

import {
  Box,
  Link,
  Skeleton,
  TableContainer,
  Table,
  Thead,
  Tbody,
  // Tfoot,
  Th,
  Tr,
  Td,
  // Text,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
} from '@chakra-ui/react';

// import {
//   CheckCircleIcon, WarningTwoIcon,
// } from '@chakra-ui/icons';

// const CellDiv = ({
//   children,
// }) => <div className="td-wrapper">{children}</div>;

const renderLinkCells = (linkObjs) => {
  const links = linkObjs.map(({
    text, href,
  }) => (
    <Link ml={1} href={href} isExternal>
      {text}
    </Link>
  ));
  return links.reduce((prev, curr) => [prev, ', ', curr]);
};

const NumAlertsComponent = ({
  alerts,
}) => {
  let value;
  const links = [];
  if (alerts?.status === 'fetching') {
    value = <Skeleton>fetching</Skeleton>;
  }
  if (alerts && alerts instanceof Array && alerts.length > 0) {
    alerts.forEach((alert) => {
      if (alert.body?.cef_details?.contexts) {
        alert.body.cef_details.contexts.forEach((context) => {
          if (context.type === 'link') {
            links.push(context);
          }
        });
      }
    });
    if (links.length > 0) {
      // unique links on href
      const uniqueLinks = links.filter(
        (link, index, self) => self.findIndex((l) => l.href === link.href) === index,
      );
      value = renderLinkCells(
        uniqueLinks.map((link) => ({
          text: link.text || link.href,
          href: link.href,
        })),
      );
    }
  }
  // fill in -- if no value
  value = value || '--';

  let tooltipText = '';
  if (alerts?.status) {
    tooltipText = <Box p={4}>{alerts.status}</Box>;
  } else if (links.length === 0) {
    tooltipText = <Box p={4}>No links</Box>;
  } else {
    const uniqueLinks = links.filter(
      (link, index, self) => self.findIndex((l) => l.href === link.href) === index,
    );
    tooltipText = (
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Text</Th>
              <Th>URL</Th>
            </Tr>
          </Thead>
          <Tbody>
            {uniqueLinks.map((link) => (
              <Tr key={link.href}>
                <Td>
                  <Link href={link.href} isExternal>
                    {link.text || '--'}
                  </Link>
                </Td>
                <Td>
                  <Link href={link.href} isExternal>
                    {link.href}
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
          {/* {alertsSortedDescendingDate.length > 20 && (
            <Tfoot>
              <Tr>
                <Th colSpan={3}>{`${alertsSortedDescendingDate.length - 20} more not shown`}</Th>
              </Tr>
            </Tfoot>
          )} */}
        </Table>
      </TableContainer>
    );
  }

  return (
    <Popover trigger="hover" size="content" preventOverflow>
      <PopoverTrigger>
        <Box m={0} p={2} cursor="default">
          {value}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="content" maxW={1000}>
        <PopoverArrow />
        {tooltipText}
      </PopoverContent>
    </Popover>
  );
};

export default NumAlertsComponent;
