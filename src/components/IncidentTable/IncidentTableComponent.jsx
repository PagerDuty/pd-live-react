/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */

import React, {
  useEffect, useMemo, useCallback, useState, useRef,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useDebouncedCallback,
} from 'use-debounce';

import {
  FixedSizeList,
} from 'react-window';

import {
  useTable,
  useSortBy,
  useRowSelect,
  useBlockLayout,
  useResizeColumns,
  useFilters,
} from 'react-table';

import {
  ContextMenu, MenuItem, ContextMenuTrigger,
} from 'react-contextmenu';

import {
  Box, Flex, Text, Checkbox,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';
import {
  columnsForSavedColumns,
} from 'src/config/column-generator';
import {
  selectIncidentTableRows as selectIncidentTableRowsConnected,
  updateIncidentTableState as updateIncidentTableStateConnected,
  CLEAR_INCIDENT_TABLE_FILTERS_COMPLETED,
} from 'src/redux/incident_table/actions';

import EmptyIncidentsComponent from './subcomponents/EmptyIncidentsComponent';
import QueryActiveComponent from './subcomponents/QueryActiveComponent';
import GetAllModal from './subcomponents/GetAllModal';

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

const doCsvExport = (tableData) => {
  // Create headers from table columns
  const headers = tableData.columns
    .filter((column) => column.id !== 'select')
    .map((column) => column.Header);

  const rowsToMap = tableData.selectedFlatRows.length > 0 ? tableData.selectedFlatRows : tableData.rows;
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

const IncidentTableComponent = () => {
  const {
    incidentTableState,
    incidentTableColumns,
    status: incidentTableStatus,
  } = useSelector((state) => state.incidentTable);
  const {
    status: incidentActionsStatus,
  } = useSelector((state) => state.incidentActions);
  const {
    status: responsePlaysStatus,
  } = useSelector((state) => state.responsePlays);
  const {
    filteredIncidentsByQuery,
    incidents,
    incidentAlerts,
    incidentNotes,
    incidentLatestLogEntries,
    fetchingIncidents,
    error: incidentsError,
  } = useSelector((state) => state.incidents);
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);

  const dispatch = useDispatch();
  const selectIncidentTableRows = useCallback(
    (allSelected, selectedCount, selectedRows) => {
      dispatch(selectIncidentTableRowsConnected(allSelected, selectedCount, selectedRows));
    },
    [dispatch],
  );
  const updateIncidentTableState = useCallback(
    (newIncidentTableState) => {
      dispatch(updateIncidentTableStateConnected(newIncidentTableState));
    },
    [dispatch],
  );

  const {
    t,
  } = useTranslation();

  // React Table Config
  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 1600,
      Filter: '',
    }),
    [],
  );

  const columns = useMemo(
    () => columnsForSavedColumns(incidentTableColumns),
    [incidentTableColumns, currentUserLocale],
  );

  const tableData = useMemo(
    () => filteredIncidentsByQuery.map((incident) => ({
      ...incident,
      alerts: incidentAlerts[incident.id],
      notes: incidentNotes[incident.id],
      latest_log_entry: incidentLatestLogEntries[incident.id],
    })),
    [filteredIncidentsByQuery, incidentAlerts, incidentNotes],
  );

  const scrollBarSize = useMemo(() => scrollbarWidth(), []);

  // Dynamic Table Height
  const [tableHeight, setTableHeight] = useState(0);

  const calculateTableHeight = useDebouncedCallback(() => {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');
    if (!headerEl || !footerEl) return;
    const headerRect = headerEl.getBoundingClientRect();
    const footerRect = footerEl.getBoundingClientRect();
    const rectDistance = footerRect.top - headerRect.bottom;
    setTableHeight(rectDistance);
  }, 25);
  const resizeObserver = useMemo(
    () => new ResizeObserver(() => {
      calculateTableHeight();
    }),
    [],
  );

  useEffect(() => {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');
    if (headerEl && footerEl) {
      resizeObserver.observe(headerEl);
      resizeObserver.observe(footerEl);
    }
  }, [resizeObserver]);

  useEffect(() => {
    window.addEventListener('resize', calculateTableHeight);
    return () => window.removeEventListener('resize', calculateTableHeight);
  }, []);

  // Debouncing for table state
  const debouncedUpdateIncidentTableState = useDebouncedCallback((state, action) => {
    // Only update store with sorted and column resizing state
    // and filter state
    if (
      action.type === 'toggleSortBy'
      || action.type === 'columnDoneResizing'
      || action.type === 'setFilter'
    ) {
      updateIncidentTableState(state);
    }
  }, 100);

  // Custom row id fetch to handle dynamic table updates
  const getRowId = useCallback((row) => row.id, []);

  const lastSelectedRowId = useRef(null);

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
      stateReducer: debouncedUpdateIncidentTableState,
    },
    // Plugins
    useFilters,
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
            <Checkbox
              m={0}
              id="select-all"
              isIndeterminate={
                !tableInstance.isAllRowsSelected && tableInstance.selectedFlatRows.length > 0
              }
              isChecked={tableInstance.isAllRowsSelected}
              {...getToggleAllRowsSelectedProps()}
            />
          ),
          Cell: ({
            row,
          }) => (
            <Checkbox
              m={0}
              data-incident-row-idx={row.index}
              data-incident-id={row.original.id}
              id={`${row.original.id}-checkbox`}
              isChecked={row.isSelected}
              {...row.getToggleRowSelectedProps({
                onChange: (e) => {
                  const oldSelectedRowId = lastSelectedRowId.current;
                  const newSelectedRowId = row.original.id;
                  if (row.isSelected) {
                    // deselecting
                    lastSelectedRowId.current = null;
                  } else {
                    lastSelectedRowId.current = newSelectedRowId;
                  }
                  if (e.nativeEvent.shiftKey && oldSelectedRowId) {
                    const oldSelectedRowIdx = tableInstance.rows.findIndex(
                      (r) => r.id === oldSelectedRowId,
                    );
                    const newSelectedRowIdx = tableInstance.rows.findIndex(
                      (r) => r.id === newSelectedRowId,
                    );
                    const minIdx = Math.min(oldSelectedRowIdx, newSelectedRowIdx);
                    const maxIdx = Math.max(oldSelectedRowIdx, newSelectedRowIdx);
                    const rowsToSelect = tableInstance.rows.slice(minIdx, maxIdx + 1);
                    rowsToSelect.forEach((r) => {
                      tableInstance.prepareRow(r);
                      r.toggleRowSelected(true);
                    });
                  } else {
                    row.toggleRowSelected();
                  }
                },
              })}
            />
          ),
        },
        ...existingColumns,
      ]);
    },
  );

  // Update table filters when columns change
  useEffect(() => {
    tableInstance.setAllFilters(incidentTableState.filters);
  }, [columns]);

  useEffect(() => {
    if (incidentTableStatus === CLEAR_INCIDENT_TABLE_FILTERS_COMPLETED) {
      tableInstance.setAllFilters(incidentTableState.filters);
    }
  }, [incidentTableStatus]);

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

  const MyIncidentRow = useCallback(
    ({
      data, index, style,
    }) => {
      const row = data[index];

      prepareRow(row);
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
                typeof cell.column.Header === 'string' ? cell.column.Header : 'incident-header'
              }
              data-incident-row-cell-idx={row.index}
              data-incident-cell-id={row.original.id}
            >
              {cell.render('Cell')}
            </Box>
          ))}
        </Box>
      );
    },
    [prepareRow, columns],
  );

  const [displayGetAllModal, setDisplayGetAllModal] = useState(false);
  const exportCsv = useCallback(() => {
    doCsvExport(tableInstance);
  }, [tableInstance]);

  // Row selection hooks
  useEffect(() => {
    const selectedRows = selectedFlatRows.map((row) => row.original);
    selectIncidentTableRows(true, selectedRows.length, selectedRows);
    return () => {};
  }, [selectedFlatRows]);

  // Handle deselecting rows after incident action has been requested
  useEffect(() => {
    // TODO: Get user feedback on this workflow
    // toggleAllRowsSelected only works on the currently filtered rows, therefore
    // to fix #380 we can't wait for the incidentActionsStatus to be COMPLETED
    //
    // Workarounds using the stateReducer to clear selectedRowIds also don't appear to work on filtered out rows
    // Therefore, clearing the checkbox in the UI before it is filtered out is the best we can do for now
    const isActionRequested = incidentActionsStatus === 'ACTION_REQUESTED';
    const isToggleAction = incidentActionsStatus.includes('TOGGLE');
    const isRequestedOrCompleted = incidentActionsStatus.includes('REQUESTED') || incidentActionsStatus.includes('COMPLETED');

    if (isActionRequested || (!isToggleAction && isRequestedOrCompleted)) {
      toggleAllRowsSelected(false);
    }
  }, [incidentActionsStatus]);

  // deselect rows after response play has requested
  // not adding this to the above useEffect because I don't want to
  // take a chance of deselecting too many times
  useEffect(() => {
    // TODO: Get user feedback on this workflow
    if (
      responsePlaysStatus.includes('RUN_RESPONSE_PLAY_REQUESTED')
      || responsePlaysStatus.includes('RUN_RESPONSE_PLAY_COMPLETED')
    ) {
      toggleAllRowsSelected(false);
    }
  }, [responsePlaysStatus]);

  // Render components based on application state
  if (fetchingIncidents) {
    return <QueryActiveComponent />;
  }

  if (
    !fetchingIncidents
    && incidents.length === 0
    && incidentsError?.startsWith('Too many records')
  ) {
    const numIncidents = incidentsError.match(/\d+/)[0];
    return (
      <EmptyIncidentsComponent
        message={t('Too many records to display (X). Please narrow your search criteria.', {
          numIncidents,
        })}
      />
    );
  }

  // TODO: Find a better way to prevent Empty Incidents from being shown during render
  if (!fetchingIncidents && filteredIncidentsByQuery.length === 0) {
    return (
      <Delayed waitBeforeShow={500}>
        <EmptyIncidentsComponent />
      </Delayed>
    );
  }

  if (!fetchingIncidents && filteredIncidentsByQuery.length > 0) {
    return (
      <Box
        id="incident-table-ctr"
        {...getTableProps()}
        height={`${tableHeight}px`}
        overflow="scroll"
        fontSize="sm"
      >
        <Box>
          <ContextMenuTrigger id="header-contextmenu-csv" key="header-contextmenu-csv">
            {headerGroups.map((headerGroup) => (
              <Box {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Box
                    data-column-name={column.id === 'select' ? 'select' : column.Header}
                    {...column.getHeaderProps()}
                    className={column.isSorted ? 'th-sorted' : 'th'}
                  >
                    <Flex {...column.getSortByToggleProps()} className="th-sort">
                      <Text
                        textOverflow="ellipsis"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        display="inline"
                      >
                        {column.id === 'select'
                          ? column.render('Header')
                          : t(column.render('Header'))}
                      </Text>
                      {column.id !== 'select' && (
                        <>
                          <Text
                            id={`${column.id}-filter-icon`}
                            display="inline"
                            mx={0.5}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            {column.render('Filter')}
                          </Text>
                          <Text display="inline">
                            {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
                          </Text>
                        </>
                      )}
                    </Flex>
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
                setDisplayGetAllModal(true);
              }}
            >
              {t('Export CSV')}
              {tableInstance.selectedFlatRows.length > 0
                ? ` (${tableInstance.selectedFlatRows.length} rows)`
                : ` (${tableInstance.rows.length} rows)`}
            </MenuItem>
          </ContextMenu>
        </Box>
        {rows.length > 0 && (
          <Box {...getTableBodyProps()}>
            <FixedSizeList
              className="incident-table-fixed-list"
              height={tableHeight - 45}
              itemCount={rows.length}
              itemSize={60}
              itemKey={(index) => rows[index].id}
              itemData={rows}
              width={totalColumnsWidth + scrollBarSize}
            >
              {MyIncidentRow}
            </FixedSizeList>
          </Box>
        )}
        {rows.length === 0 && (
          <EmptyIncidentsComponent message={t('No incidents match your search criteria.')} />
        )}
        <GetAllModal
          isOpen={displayGetAllModal}
          onClose={() => setDisplayGetAllModal(false)}
          rows={tableInstance.selectedFlatRows.length > 0 ? tableInstance.selectedFlatRows : rows}
          exportCsv={exportCsv}
        />
      </Box>
    );
  }
};

export default IncidentTableComponent;
