/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */

import {
  useEffect, useMemo, useCallback, useState,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  useDebouncedCallback,
} from 'use-debounce';

import {
  FixedSizeList,
} from 'react-window';

import {
  useTable, useSortBy, useRowSelect, useBlockLayout, useResizeColumns,
} from 'react-table';

import {
  selectIncidentTableRows as selectIncidentTableRowsConnected,
  updateIncidentTableState as updateIncidentTableStateConnected,
} from 'redux/incident_table/actions';

import {
  getIncidentAlertsAsync as getIncidentAlertsAsyncConnected,
  getIncidentNotesAsync as getIncidentNotesAsyncConnected,
} from 'redux/incidents/actions';

import {
  ContextMenu, MenuItem, ContextMenuTrigger,
} from 'react-contextmenu';

import {
  columnsForSavedColumns,
} from 'config/column-generator';

import {
  Box,
  Text,
} from '@chakra-ui/react';

import CheckboxComponent from './subcomponents/CheckboxComponent';
import EmptyIncidentsComponent from './subcomponents/EmptyIncidentsComponent';
import QueryActiveComponent from './subcomponents/QueryActiveComponent';
import QueryCancelledComponent from './subcomponents/QueryCancelledComponent';
import IncidentTableRow from './subcomponents/IncidentTableRow';

import './IncidentTableComponent.scss';

// Ref: https://davidwalsh.name/detect-scrollbar-width
const scrollbarWidth = () => {
  const scrollDiv = document.createElement('div');
  scrollDiv.setAttribute(
    'style',
    'width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;',
  );
  document.body.appendChild(scrollDiv);
  const scrollbarWidthDist = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidthDist;
};

// Ref: https://stackoverflow.com/a/61390352/6480733
const Delayed = ({
  children, waitBeforeShow = 500,
}) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};

// TODO: Make CSV Export work properly
// (fetch all the notes and alerts for the selected incidents,
//   warn the user if that will take a long time)
const exportTableDataToCsv = (tableData) => {
  // Create headers from table columns
  const headers = tableData.columns.map((column) => column.Header);

  const rowsToMap = tableData.selectedFlatRows.length > 0
    ? tableData.selectedFlatRows : tableData.rows;
  const exportRows = rowsToMap.map((row) => {
    tableData.prepareRow(row);
    const cells = row.cells.slice(1);
    const cleanCells = cells.map((cell) => {
      let cellStr = `${cell.value?.props?.children || cell.value}`;
      if (cellStr.match(/[,"\r\n]/)) {
        cellStr = `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    return cleanCells.join(',');
  });

  // Join headers and rows into CSV string
  const csv = [headers.join(','), ...exportRows].join('\n');

  // Download CSV file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'table-data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const IncidentTableComponent = ({
  headerRef,
  footerRef,
}) => {
  const incidentTable = useSelector((state) => state.incidentTable);
  const incidentActions = useSelector((state) => state.incidentActions);
  const incidents = useSelector((state) => state.incidents);
  const querySettings = useSelector((state) => state.querySettings);
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);

  const dispatch = useDispatch();
  const selectIncidentTableRows = (allSelected, selectedCount, selectedRows) => {
    dispatch(selectIncidentTableRowsConnected(allSelected, selectedCount, selectedRows));
  };
  const updateIncidentTableState = (incidentTableState) => {
    dispatch(updateIncidentTableStateConnected(incidentTableState));
  };
  const getIncidentAlerts = (incidentId) => {
    dispatch(getIncidentAlertsAsyncConnected(incidentId));
  };
  const getIncidentNotes = (incidentId) => {
    dispatch(getIncidentNotesAsyncConnected(incidentId));
  };

  // TODO: clean this up
  const {
    incidentTableState, incidentTableColumns,
  } = incidentTable;
  const {
    status,
  } = incidentActions;
  const {
    filteredIncidentsByQuery,
    incidentAlerts,
    incidentNotes,
    fetchingIncidents,
  } = incidents;
  const {
    displayConfirmQueryModal,
  } = querySettings;

  // React Table Config
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 1600,
    }),
    [],
  );

  const columns = useMemo(() => columnsForSavedColumns(incidentTableColumns),
    [incidentTableColumns, currentUserLocale]);

  const tableData = useMemo(() => filteredIncidentsByQuery.map(
    (incident) => ({
      ...incident,
      alerts: incidentAlerts[incident.id],
      notes: incidentNotes[incident.id],
    }),
  ), [filteredIncidentsByQuery, incidentAlerts, incidentNotes]);

  const scrollBarSize = useMemo(() => scrollbarWidth(), []);

  // Dynamic Table Height
  const [tableHeight, setTableHeight] = useState(0);

  const calculateTableHeight = () => {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');
    const headerRect = headerEl.getBoundingClientRect();
    const footerRect = footerEl.getBoundingClientRect();
    const rectDistance = footerRect.top - headerRect.bottom;
    setTableHeight(rectDistance);
  };
  const resizeObserver = useMemo(() => new ResizeObserver(() => {
    calculateTableHeight();
  }), []);

  useEffect(() => {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');
    if (headerEl && footerEl) {
      resizeObserver.observe(headerEl);
      resizeObserver.observe(footerEl);
    }
  }, [resizeObserver, headerRef, footerRef]);

  useEffect(() => {
    window.addEventListener('resize', calculateTableHeight);
    return () => window.removeEventListener('resize', calculateTableHeight);
  }, []);

  // Debouncing for table state
  const debouncedUpdateIncidentTableState = useDebouncedCallback((state, action) => {
    // Only update store with sorted and column resizing state
    if (action.type === 'toggleSortBy' || action.type === 'columnDoneResizing') {
      updateIncidentTableState(state);
    }
  }, 500);

  // Custom row id fetch to handle dynamic table updates
  const getRowId = useCallback((row) => row.id, []);

  // Create instance of react-table with options and plugins
  const tableInstance = useTable(
    {
      columns,
      data: tableData,
      defaultColumn,
      getRowId,
      // Prevent re-render when redux store updates
      autoResetPage: false,
      autoResetExpanded: false,
      autoResetGroupBy: false,
      autoResetSelectedRows: false,
      autoResetSortBy: false,
      autoResetFilters: false,
      autoResetRowState: false,
      // Enable multisort without specific event handler (i.e. shift+click)
      isMultiSortEvent: () => true,
      // Set initial state from store
      initialState: incidentTableState,
      // Handle updates to table
      stateReducer: (newState, action) => debouncedUpdateIncidentTableState(newState, action),
    },
    // Plugins
    useSortBy,
    useRowSelect,
    useBlockLayout,
    useResizeColumns,
    (hooks) => {
      // Let's make a column for selection
      hooks.visibleColumns.push((existingColumns) => [
        {
          id: 'select',
          disableResizing: true,
          minWidth: 35,
          width: 35,
          maxWidth: 35,
          Header: ({
            getToggleAllRowsSelectedProps,
          }) => (
            <CheckboxComponent
              id="select-all"
              {...getToggleAllRowsSelectedProps()}
            />
          ),
          Cell: ({
            row,
          }) => (
            <CheckboxComponent
              id={`${row.original.id}-checkbox`}
              {...row.getToggleRowSelectedProps()}
            />
          ),
        },
        ...existingColumns,
      ]);
    },
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    toggleAllRowsSelected,
    totalColumnsWidth,
  } = tableInstance;

  // Row selection hooks
  useEffect(() => {
    const selectedRows = selectedFlatRows.map((row) => row.original);
    selectIncidentTableRows(true, selectedRows.length, selectedRows);
    return () => { };
  }, [selectedFlatRows]);

  // Handle deselecting rows after incident action has completed
  useEffect(() => {
    // TODO: Get user feedback on this workflow
    if (!status.includes('TOGGLE') && status.includes('COMPLETED')) toggleAllRowsSelected(false);
  }, [status]);

  // Render components based on application state
  if (displayConfirmQueryModal) {
    return <></>;
  }

  if (!displayConfirmQueryModal && querySettings.error) {
    return <QueryCancelledComponent />;
  }

  if (fetchingIncidents) {
    return <QueryActiveComponent />;
  }

  // TODO: Find a better way to prevent Empty Incidents from being shown during render
  if (!fetchingIncidents && filteredIncidentsByQuery.length === 0) {
    return (
      <Delayed waitBeforeShow={4000}>
        <EmptyIncidentsComponent />
      </Delayed>
    );
  }

  if (!fetchingIncidents && filteredIncidentsByQuery.length > 0) {
    return (
      <Box
        {...getTableProps()}
        height={`${tableHeight}px`}
        overflow="scroll"
        fontSize="sm"
      >
        <Box>
          <ContextMenuTrigger
            id="header-contextmenu-csv"
            key="header-contextmenu-csv"
          >
            {headerGroups.map((headerGroup) => (
              <Box {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Box
                    data-column-name={column.id === 'select' ? 'select' : column.Header}
                    {...column.getHeaderProps()}
                    className={column.isSorted ? 'th-sorted' : 'th'}
                  >
                    <Box {...column.getSortByToggleProps()} className="th-sort">
                      <Text
                        textOverflow="ellipsis"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        display="inline"
                      >
                        {column.render('Header')}
                      </Text>
                      <span>{column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}</span>
                    </Box>
                    {column.canResize && (
                      <Box
                        {...column.getResizerProps()}
                        className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </ContextMenuTrigger>
          <ContextMenu id="header-contextmenu-csv" style={{ zIndex: 2 }}>
            <MenuItem
              className="dropdown-item"
              onClick={() => {
                exportTableDataToCsv(tableInstance);
              }}
            >
              Export CSV
              {tableInstance.selectedFlatRows.length > 0
                ? ` (${tableInstance.selectedFlatRows.length} rows)`
                : ` (${tableInstance.rows.length} rows)`}
            </MenuItem>
            <MenuItem
              className="dropdown-item"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log(tableData);
              }}
            >
              {/* TODO: remove this */}
              Log stuff
            </MenuItem>
          </ContextMenu>
        </Box>
        <Box
          {...getTableBodyProps()}
        >
          <FixedSizeList
            className="incident-table-fixed-list"
            height={tableHeight - 60}
            itemCount={rows.length}
            itemSize={60}
            itemKey={(index) => rows[index].id}
            width={totalColumnsWidth + scrollBarSize}
          >
            {
              (rowProps) => IncidentTableRow({
                ...rowProps,
                rows,
                prepareRow,
                getIncidentAlerts,
                getIncidentNotes,
              })
            }
          </FixedSizeList>
        </Box>
      </Box>
    );
  }
};

export default IncidentTableComponent;
