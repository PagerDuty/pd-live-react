'use client';

// Column Generator for React Table
// defaultIncidentColumns() returns the default incident columns
// defaultAlertColumns() returns the default alert columns
// columnsForSavedColumns() returns the column definitions matching the user's saved columns
// export const customAlertColumnForSavedColumn returns an alert column for a saved custom column

import React from 'react';

import moment from 'moment/min/moment-with-locales';

import {
  JSONPath,
} from 'jsonpath-plus';

import {
  formatError,
} from 'pretty-print-error';

import {
  Badge,
} from 'react-bootstrap';
import {
  Box, Link, Skeleton, Tooltip,
} from '@chakra-ui/react';
import {
  ChevronDownIcon, ChevronUpIcon, NotAllowedIcon,
} from '@chakra-ui/icons';
import Linkify from 'linkify-react';
import {
  useSelector,
} from 'react-redux';
import i18next from 'src/i18n';

import {
  anythingToString,
} from 'src/util/helpers';

import {
  HIGH, LOW,
} from 'src/util/incidents';
import {
  DATE_FORMAT,
} from 'src/config/constants';

import StatusComponent from 'src/components/IncidentTable/subcomponents/StatusComponent';
import NumAlertsComponent from 'src/components/IncidentTable/subcomponents/NumAlertsComponent';
import LinksComponent from 'src/components/IncidentTable/subcomponents/LinksComponent';
import PersonInitialsComponents from 'src/components/IncidentTable/subcomponents/PersonInitialsComponents';
import ColumnFilterComponent from 'src/components/IncidentTable/subcomponents/ColumnFilterComponent';
import LatestNoteComponent from 'src/components/IncidentTable/subcomponents/LatestNoteComponent';

const linkifyOptions = { target: { url: '_blank' }, rel: 'noopener noreferrer' };

const CellDiv = ({
  children,
}) => <div className="td-wrapper">{children}</div>;

const renderLinkCell = ({
  href, text,
}) => (
  <CellDiv>
    <Link ml={1} href={href} isExternal>
      {text}
    </Link>
  </CellDiv>
);

const renderLinkCells = (linkObjs) => {
  const links = linkObjs.map(({
    text, href,
  }) => (
    <Link ml={1} href={href} isExternal>
      {text}
    </Link>
  ));
  return <CellDiv>{links.reduce((prev, curr) => [prev, ', ', curr])}</CellDiv>;
};

const renderDateCell = ({
  iso8601Date, overrideRelativeDates = false, noSuffix = false,
}) => {
  const {
    relativeDates,
  } = useSelector((state) => state.settings);
  if (!iso8601Date) {
    return <CellDiv>--</CellDiv>;
  }
  if (overrideRelativeDates || relativeDates) {
    return (
      <CellDiv>
        <Tooltip label={moment(iso8601Date).format(DATE_FORMAT)}>
          {moment(iso8601Date).fromNow(noSuffix)}
        </Tooltip>
      </CellDiv>
    );
  }
  return <CellDiv>{moment(iso8601Date).format(DATE_FORMAT)}</CellDiv>;
};

const renderPlainTextCell = ({
  value,
}) => (
  <CellDiv>
    <Linkify options={linkifyOptions}>{value || '--'}</Linkify>
  </CellDiv>
);

const renderPlainTextAlertCell = ({
  value, cell,
}) => {
  const {
    alerts,
  } = cell.row.original;
  if (alerts?.status === 'fetching') {
    return (
      <CellDiv>
        <Skeleton>fetching</Skeleton>
      </CellDiv>
    );
  }
  return (
    <CellDiv>
      <Linkify options={linkifyOptions}>{value || '--'}</Linkify>
    </CellDiv>
  );
};

const dateValueSortType = (row1, row2, columnId, descending) => {
  const value1 = row1.values[columnId];
  const value2 = row2.values[columnId];
  const date1 = moment(value1);
  const date2 = moment(value2);

  if (date1.isSame(date2) || (!date1.isValid() && !date2.isValid())) {
    return 0;
  }
  if (date1.isValid() && !date2.isValid()) {
    return descending ? 1 : -1;
  }
  if (!date1.isValid() && date2.isValid()) {
    return descending ? -1 : 1;
  }

  return date1.isAfter(date2) ? -1 : 1;
};

export const incidentColumn = ({
  value,
  header,
  accessor,
  accessorPath,
  renderer = renderPlainTextCell,
  minWidth,
  sortType,
  columnType,
  expression,
  expressionType,
}) => {
  const wrappedRenderer = ({
    cell, value: cellValue, row,
  }) => {
    let cellValueStr;
    switch (typeof cellValue) {
      case 'string':
        cellValueStr = cellValue;
        break;
      case 'undefined':
        cellValueStr = '';
        break;
      case 'object':
        cellValueStr = cellValue ? JSON.stringify(cellValue) : '';
        break;
      default:
        cellValueStr = `${cellValue}`;
    }
    try {
      return renderer({
        cell,
        value: cellValueStr,
        row,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return (
        <CellDiv>
          <Tooltip label={formatError(e.message)}>
            <NotAllowedIcon />
          </Tooltip>
        </CellDiv>
      );
    }
  };

  const column = {
    value,
    originalHeader: header,
    Header: i18next.t(header),
    i18n: i18next.t(header),
    accessor,
    accessorPath,
    Cell: wrappedRenderer,
    minWidth,
    columnType: columnType || 'incident',
    Filter: ColumnFilterComponent,
    expression,
    expressionType,
  };

  if (sortType) {
    column.sortType = sortType;
  }

  return column;
};

export const defaultIncidentColumns = () => [
  incidentColumn({
    value: 'incident_number',
    header: '#',
    accessor: 'incident_number',
    minWidth: 80,
    renderer: ({
      value, row,
    }) => renderLinkCell({
      text: value,
      href: row.original.html_url,
    }),
  }),
  incidentColumn({
    value: 'title',
    header: 'Title',
    accessor: 'title',
    minWidth: 200,
    renderer: ({
      value, row,
    }) => renderLinkCell({
      text: value,
      href: row.original.html_url,
    }),
  }),
  incidentColumn({
    value: 'description',
    header: 'Description',
    accessor: 'description',
    minWidth: 200,
  }),
  incidentColumn({
    value: 'created_at',
    header: 'Created At',
    accessor: 'created_at',
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
    sortType: dateValueSortType,
  }),
  incidentColumn({
    value: 'age',
    header: 'Age',
    accessor: 'created_at',
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
      overrideRelativeDates: true,
      noSuffix: true,
    }),
    sortType: dateValueSortType,
  }),
  incidentColumn({
    value: 'updated_at',
    header: 'Updated At',
    accessor: 'updated_at',
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
    sortType: dateValueSortType,
  }),
  incidentColumn({
    value: 'status',
    header: 'Status',
    accessor: 'status',
    minWidth: 90,
    renderer: ({
      value,
    }) => <StatusComponent status={value} />,
  }),
  incidentColumn({
    value: 'incident_key',
    header: 'Incident Key',
    accessor: 'incident_key',
    minWidth: 300,
  }),
  incidentColumn({
    value: 'service',
    header: 'Service',
    accessor: 'service.summary',
    minWidth: 150,
    renderer: ({
      value, row,
    }) => renderLinkCell({
      text: value,
      href: row.original.service.html_url,
    }),
  }),
  incidentColumn({
    value: 'assignees',
    header: 'Assignees',
    accessor: (incident) => incident.assignments.map((assignment) => assignment.assignee.summary).join(', '),
    minWidth: 160,
    renderer: ({
      row,
    }) => (
      <PersonInitialsComponents
        displayedUsers={row.original.assignments.map((assignment) => ({
          user: assignment.assignee,
        }))}
      />
    ),
  }),
  incidentColumn({
    value: 'last_status_change_at',
    header: 'Last Status Change At',
    accessor: 'last_status_change_at',
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
    sortType: dateValueSortType,
  }),
  incidentColumn({
    value: 'num_alerts',
    header: 'Num Alerts',
    accessor: 'alert_counts.all',
    minWidth: 130,
    renderer: ({
      row: {
        original: incident,
      },
    }) => (
      <CellDiv>
        <NumAlertsComponent incident={incident} />
      </CellDiv>
    ),
  }),
  incidentColumn({
    value: 'escalation_policy',
    header: 'Escalation Policy',
    accessor: 'escalation_policy.summary',
    minWidth: 150,
    renderer: ({
      value, row,
    }) => renderLinkCell({
      text: value,
      href: row.original.escalation_policy.html_url,
    }),
  }),
  incidentColumn({
    value: 'teams',
    header: 'Teams',
    accessor: (incident) => (incident.teams ? incident.teams.map((team) => team.summary).join(', ') : ''),
    minWidth: 200,
    renderer: ({
      row,
    }) => {
      const {
        teams,
      } = row.original.teams ? row.original : [];
      if (teams.length > 0) {
        return renderLinkCells(
          teams.map((team) => ({
            text: team.summary,
            href: team.html_url,
          })),
        );
      }
      return null;
    },
  }),
  incidentColumn({
    value: 'acknowledgements',
    header: 'Acknowledgements',
    accessor: (incident) => incident.acknowledgements.map((acknowledger) => acknowledger.summary).join(', '),
    minWidth: 160,
    renderer: ({
      row,
    }) => (
      <PersonInitialsComponents
        displayedUsers={row.original.acknowledgements.map((acknowledgement) => ({
          user: acknowledgement.acknowledger,
        }))}
      />
    ),
  }),
  incidentColumn({
    value: 'last_status_change_by',
    header: 'Last Status Change By',
    accessor: 'last_status_change_by.summary',
    minWidth: 150,
    renderer: ({
      value, row,
    }) => renderLinkCell({
      text: value,
      href: row.original.last_status_change_by.html_url,
    }),
  }),
  incidentColumn({
    value: 'priority',
    header: 'Priority',
    accessor: (incident) => incident.priority?.summary || '',
    minWidth: 90,
    renderer: ({
      value, row,
    }) => {
      if (value) {
        return (
          <Box
            key={row.original.priority.id}
            style={{
              backgroundColor: `#${row.original.priority.color}`,
              color: 'white',
            }}
            className="priority-label"
          >
            {row.original.priority.summary}
          </Box>
        );
      }
      return <Box className="priority-label">--</Box>;
    },
    sortType: (row1, row2) => {
      const row1Rank = row1.original.priority ? row1.original.priority.order : 0;
      const row2Rank = row2.original.priority ? row2.original.priority.order : 0;
      const order = row1Rank > row2Rank ? 1 : -1;
      return order;
    },
  }),
  incidentColumn({
    value: 'urgency',
    header: 'Urgency',
    accessor: 'urgency',
    minWidth: 120,
    renderer: ({
      row,
    }) => {
      const {
        urgency,
      } = row.original;
      let elem;
      if (urgency === HIGH) {
        elem = (
          <Badge className="urgency-badge" bg="primary" text="light">
            <ChevronUpIcon />
            {' '}
            {i18next.t('High')}
          </Badge>
        );
      } else if (urgency === LOW) {
        elem = (
          <Badge className="urgency-badge" bg="secondary" text="dark">
            <ChevronDownIcon />
            {' '}
            {i18next.t('Low')}
          </Badge>
        );
      }
      return elem;
    },
  }),
  incidentColumn({
    value: 'id',
    header: 'Incident ID',
    accessor: 'id',
    minWidth: 160,
  }),
  incidentColumn({
    value: 'summary',
    header: 'Summary',
    accessor: 'summary',
    minWidth: 300,
    renderer: ({
      value, row,
    }) => renderLinkCell({
      text: value,
      href: row.original.html_url,
    }),
  }),
  incidentColumn({
    value: 'latest_note',
    header: 'Latest Note',
    accessor: (incident) => {
      if (incident.notes && incident.notes.length > 0) {
        return incident.notes.slice(-1)[0].content;
      }
      return '';
    },
    minWidth: 300,
    renderer: ({
      row: {
        original,
      },
    }) => <LatestNoteComponent incident={original} />,
  }),
  incidentColumn({
    value: 'latest_note_at',
    header: 'Latest Note At',
    accessor: (incident) => {
      if (incident.notes && incident.notes.length > 0) {
        return incident.notes.slice(-1)[0].created_at;
      }
      return '';
    },
    minWidth: 300,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
    sortType: dateValueSortType,
  }),
  incidentColumn({
    value: 'external_references',
    header: 'External References',
    accessor: (incident) => (incident.external_references
      ? incident.external_references.map((ext) => ext.external_id).join(', ')
      : ''),
    minWidth: 200,
    renderer: ({
      row: {
        original,
      },
    }) => {
      const externalReferences = original.external_references || [];
      if (externalReferences.length > 0) {
        return renderLinkCells(
          externalReferences.map((ext) => ({
            text: `${ext.summary} (${ext.external_id})`,
            href: ext.external_url,
          })),
        );
      }
      return '--';
    },
  }),
  incidentColumn({
    value: 'responders',
    header: 'Responders',
    accessor: (incident) => incident.incidents_responders.map((responder) => responder.user.summary).join(', '),
    minWidth: 160,
    renderer: ({
      row,
    }) => (
      <PersonInitialsComponents
        displayedUsers={row.original.incidents_responders.map((responder) => ({
          user: responder.user,
        }))}
      />
    ),
  }),
  incidentColumn({
    value: 'latest_log_entry_at',
    header: 'Latest Log Entry At',
    accessor: (incident) => incident.latest_log_entry?.created_at || incident.updated_at || incident.created_at,
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
    sortType: dateValueSortType,
  }),
  incidentColumn({
    value: 'latest_log_entry_type',
    header: 'Latest Log Entry Type',
    accessor: (incident) => {
      if (incident.latest_log_entry) {
        const m = incident.latest_log_entry.type.match(/^(.+?)_log_entry$/);
        if (m && m.length > 1) {
          return m[1];
        }
        return incident.latest_log_entry.type;
      }
      return '';
    },
    minWidth: 120,
  }),
  incidentColumn({
    value: 'latest_alert_at',
    header: 'Latest Alert At',
    accessor: (incident) => {
      if (incident.alerts && incident.alerts instanceof Array && incident.alerts.length > 0) {
        const alertDates = incident.alerts.map((x) => new Date(x.created_at));
        const maxAlertDate = new Date(Math.max(...alertDates));
        return maxAlertDate.toISOString();
      }
      return '';
    },
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
    sortType: dateValueSortType,
  }),
];

export const defaultAlertsColumns = () => [
  incidentColumn({
    value: 'links',
    header: 'Links',
    columnType: 'alert',
    accessor: (incident) => {
      if (incident.alerts && incident.alerts instanceof Array && incident.alerts.length > 0) {
        const links = [];
        incident.alerts.forEach((alert) => {
          if (alert.body?.cef_details?.contexts) {
            alert.body.cef_details.contexts.forEach((context) => {
              if (context.type === 'link') {
                links.push(context.href);
              }
            });
          }
        });
        // unique links on href
        const uniqueLinks = links.filter(
          (link, index, self) => self.findIndex((l) => l === link) === index,
        );
        return uniqueLinks.join(', ');
      }
      return '';
    },
    minWidth: 200,
    renderer: ({
      row: {
        original: {
          alerts,
        },
      },
    }) => (
      <CellDiv>
        <LinksComponent alerts={alerts} />
      </CellDiv>
    ),
  }),
  incidentColumn({
    value: 'severity',
    header: 'Severity',
    columnType: 'alert',
    accessor: (incident) => {
      if (
        incident.alerts
        && incident.alerts instanceof Array
        && incident.alerts.length > 0
        && incident.alerts[0] instanceof Object
      ) {
        return incident.alerts[0].severity || '--';
      }
      return '--';
    },
    minWidth: 100,
    renderer: ({
      value, cell,
    }) => {
      if (cell.row.original.alerts?.status === 'fetching') {
        return renderPlainTextAlertCell({ value, cell });
      }
      const i18nValue = i18next.t(value);
      let variant;
      let text = 'dark';
      switch (value) {
        case 'critical':
          variant = 'dark';
          text = 'light';
          break;
        case 'error':
          variant = 'danger';
          text = 'light';
          break;
        case 'warning':
          variant = 'warning';
          break;
        case 'info':
          variant = 'info';
          break;
        case '--':
          variant = null;
          text = null;
          break;
        default:
          variant = 'secondary';
          text = 'dark';
      }
      return (
        <Badge className="severity-badge" bg={variant} text={text}>
          {i18nValue}
        </Badge>
      );
    },
    sortType: (row1, row2, columnId, descending) => {
      const severityRank = {
        critical: 4,
        error: 3,
        warning: 2,
        info: 1,
        '--': 0,
      };
      const rowRank = (row) => {
        if (row.original.alerts?.status || row.original.alerts === undefined) {
          // if it's fetching or not yet requested, it's the lowest rank
          return descending ? -1 : 5;
        }
        return severityRank[row.values[columnId]] || 0;
      };
      const order = rowRank(row1) > rowRank(row2) ? 1 : -1;
      return order;
    },
  }),
  incidentColumn({
    value: 'source_component',
    header: 'Component',
    columnType: 'alert',
    accessor: (incident) => incident.alerts?.[0]?.body?.cef_details?.source_component || '',
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  }),
  incidentColumn({
    value: 'source_origin',
    header: 'Source',
    columnType: 'alert',
    accessor: (incident) => incident.alerts?.[0]?.body?.cef_details?.source_origin || '',
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  }),
  incidentColumn({
    value: 'event_class',
    header: 'Class',
    columnType: 'alert',
    accessor: (incident) => incident.alerts?.[0]?.body?.cef_details?.event_class || '',
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  }),
  incidentColumn({
    value: 'service_group',
    header: 'Group',
    columnType: 'alert',
    accessor: (incident) => incident.alerts?.[0]?.body?.cef_details?.service_group || '',
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  }),
  incidentColumn({
    value: 'client',
    header: 'Client',
    columnType: 'alert',
    accessor: (incident) => incident.alerts?.[0]?.body?.cef_details?.client || '',
    minWidth: 100,
    renderer: ({
      value, cell,
    }) => {
      if (value.length > 0) {
        return renderLinkCell({
          text: value,
          href:
            cell.row.original.alerts?.[0]?.body?.cef_details?.client_url
            || cell.row.original.html_url,
        });
      }
      return renderPlainTextAlertCell({ value, cell });
    },
  }),
  incidentColumn({
    value: 'creation_time',
    header: 'Timestamp',
    columnType: 'alert',
    accessor: (incident) => incident.alerts?.[0]?.body?.cef_details?.creation_time || '',
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  }),
];

export const computedColumnForSavedColumn = (savedColumn) => {
  const {
    value,
    Header: header,
    accessorPath,
    expressionType,
    expression,
    width,
  } = savedColumn;
  if (!(header && accessorPath)) {
    return null;
  }
  const accessor = (incident) => {
    try {
      const valuesAtPath = JSONPath({
        path: accessorPath,
        json: incident,
      });
      if (!valuesAtPath) {
        return null;
      }
      if (expressionType === 'regex') {
        const stringValuesAtPath = valuesAtPath.map((v) => anythingToString(v));
        const joinedValuesAtPath = stringValuesAtPath.join('\n');
        const regex = new RegExp(expression, 'gm');
        const matches = Array.from(joinedValuesAtPath.matchAll(regex), (match) => match[1]);
        return matches.join(', ') || null;
      }
      if (expressionType === 'regex-single') {
        const stringValuesAtPath = valuesAtPath.map((v) => anythingToString(v));
        const joinedValuesAtPath = stringValuesAtPath.join('\n');
        const regex = new RegExp(expression, 'm');
        const match = joinedValuesAtPath.match(regex);
        return match ? match[1] : null;
      }
      return valuesAtPath[0];
    } catch (e) {
      return null;
    }
  };

  const column = incidentColumn({
    value,
    header,
    columnType: 'computed',
    accessor,
    accessorPath,
    minWidth: width || 100,
  });
  return column;
};

export const customAlertColumnForSavedColumn = (savedColumn) => {
  const {
    value, Header: header, accessorPath, aggregator, width,
  } = savedColumn;
  if (!(header && accessorPath)) {
    return null;
  }
  const accessor = (incident) => {
    // custom details are in both body.cef_details.details and body.details for events
    // but only body.details is guaranteed to exist, and won't be null
    // body.cef_details.details can be null if the alert is from an email
    // const path = `alerts[*].body.cef_details.${accessorPath}`;
    const path = `alerts[*].body.${accessorPath}`;
    let result = null;
    try {
      result = JSONPath({
        path,
        json: incident,
      });
    } catch (e) {
      result = null;
    }
    if (aggregator) {
      return result;
    }
    return result[0];
  };

  const column = incidentColumn({
    value,
    header,
    columnType: 'alert',
    accessor,
    accessorPath,
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  });

  if (width) {
    column.width = width;
  }
  return column;
};

export const customComputedColumnForSavedColumn = (savedColumn) => {
  const {
    Header: header, accessorPath, aggregator, width, expression, expressionType,
  } = savedColumn;
  if (!(header && accessorPath)) {
    return null;
  }
  const accessor = (incident) => {
    const path = accessorPath;
    let result = null;
    try {
      result = JSONPath({
        path,
        json: incident,
      });
    } catch (e) {
      result = null;
    }
    if (aggregator) {
      return result;
    }
    return result[0];
  };

  const id = `${header}:${accessorPath}:${expression}`;
  const column = incidentColumn({
    id,
    value: id,
    header,
    columnType: 'computed',
    accessor,
    accessorPath,
    expression,
    expressionType,
    minWidth: 100,
    renderer: renderPlainTextAlertCell,
  });

  if (width) {
    column.width = width;
  }
  return column;
};

export const defaultColumns = () => [...defaultIncidentColumns(), ...defaultAlertsColumns()];

export const customAlertColumns = (savedColumns) => {
  const allColumns = defaultColumns();
  return savedColumns.map((column) => {
    if (
      column.columnType === 'alert'
      && !allColumns.find((c) => c.originalHeader === column.Header)
    ) {
      return customAlertColumnForSavedColumn(column);
    }
    return undefined;
  });
};

export const customComputedColumns = (savedColumns) => {
  const allColumns = defaultColumns();
  return savedColumns.map((column) => {
    if (
      column.columnType === 'computed'
      && !allColumns.find((c) => c.originalHeader === column.Header)
    ) {
      return customComputedColumnForSavedColumn(column);
    }
    return undefined;
  });
};

export const columnsForSavedColumns = (savedColumns) => {
  const allColumns = defaultColumns();
  const columns = savedColumns
    .map((column) => {
      const foundColumn = allColumns.find((c) => c.originalHeader === column.Header);
      if (foundColumn) {
        return {
          ...foundColumn,
          ...column,
        };
      }
      if (column.columnType === 'alert') {
        return customAlertColumnForSavedColumn(column);
      }
      if (column.columnType === 'computed') {
        return computedColumnForSavedColumn(column);
      }
      return null;
    })
    .filter((c) => !!c);
  return columns;
};

// List of column headers for i18next-parser
export const incidentColumnsTranslations = [
  i18next.t('Title'),
  i18next.t('Description'),
  i18next.t('Created At'),
  i18next.t('Age'),
  i18next.t('Updated At'),
  i18next.t('Status'),
  i18next.t('Incident Key'),
  i18next.t('Service'),
  i18next.t('Assignees'),
  i18next.t('Last Status Change At'),
  i18next.t('Num Alerts'),
  i18next.t('Escalation Policy'),
  i18next.t('Teams'),
  i18next.t('Acknowledgements'),
  i18next.t('Last Status Change By'),
  i18next.t('Priority'),
  i18next.t('Urgency'),
  i18next.t('Incident ID'),
  i18next.t('Summary'),
  i18next.t('Latest Note'),
  i18next.t('Add Note'),
  i18next.t('Latest Note At'),
  i18next.t('External References'),
  i18next.t('Responders'),
  i18next.t('Latest Log Entry At'),
  i18next.t('Latest Log Entry Type'),
  i18next.t('Latest Alert At'),
  i18next.t('Severity'),
  i18next.t('Component'),
  i18next.t('Source'),
  i18next.t('Class'),
  i18next.t('Group'),
  i18next.t('Links'),
];

// List of severity names for i18next-parser
export const severityTranslations = [
  i18next.t('critical'),
  i18next.t('error'),
  i18next.t('warning'),
  i18next.t('info'),
];
