/* eslint-disable react/jsx-props-no-spreading */

import React, {
  useEffect,
} from 'react';

import {
  Box,
  // Text,
} from '@chakra-ui/react';

const IncidentTableRow = ({
  index, style, rows, prepareRow, getIncidentAlerts, getIncidentNotes,
}) => {
  const row = rows[index];
  prepareRow(row);

  useEffect(() => {
    if (!row.original.alerts) {
      getIncidentAlerts(row.original.id);
    }
    if (!row.original.notes) {
      getIncidentNotes(row.original.id);
    }
  }, [index, row.original.id]);

  return (
    <Box
      {...row.getRowProps({
        style,
      })}
      className={index % 2 === 0 ? 'tr' : 'tr-odd'}
    >
      {row.cells.map((cell) => (
        <Box
          {...cell.getCellProps()}
          className="td"
          data-incident-header={
            cell.column.Header instanceof String ? cell.column.Header : 'incident-header'
          }
          data-incident-row-cell-idx={row.index}
          data-incident-cell-id={row.original.id}
        >
          {cell.render('Cell')}
        </Box>
      ))}
    </Box>
  );
};

export default IncidentTableRow;
