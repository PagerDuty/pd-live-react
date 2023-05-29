// Column Generator for React Table
// defaultIncidentColumns() returns the default incident columns
// defaultAlertColumns() returns the default alert columns
// columnsForSavedColumns() returns the column definitions matching the user's saved columns
// export const customAlertColumnForSavedColumn returns an alert column for a saved custom column

import React from 'react';

import moment from 'moment';

import {
  JSONPath,
} from 'jsonpath-plus';

import i18next from 'i18n';

import {
  HIGH, LOW,
} from 'util/incidents';
import {
  DATE_FORMAT,
} from 'config/constants';

import {
  Badge,
} from 'react-bootstrap';

import {
  Box,
  Link,
} from '@chakra-ui/react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';

import StatusComponent from 'components/IncidentTable/subcomponents/StatusComponent';
import PersonInitialsComponents from 'components/IncidentTable/subcomponents/PersonInitialsComponents';

const renderLinkCell = ({
  href,
  text,
}) => (
  <Link
    ml={1}
    href={href}
    isExternal
  >
    {text}
  </Link>
);

const renderLinkCells = (linkObjs) => {
  const links = linkObjs.map(({
    text, href,
  }) => (
    renderLinkCell({
      key: `${text}: ${href}`,
      text,
      href,
    })
  ));
  return (
    <>
      {links.reduce((prev, curr) => [prev, ', ', curr])}
    </>
  );
};

const renderDateCell = ({
  iso8601Date,
}) => moment(iso8601Date).format(DATE_FORMAT);

export const incidentColumn = ({
  id,
  header,
  accessor,
  renderer,
  minWidth,
  sortType,
}) => {
  const column = {
    originalHeader: header,
    Header: i18next.t(header),
    i18n: i18next.t(header),
    accessor,
    minWidth,
  };

  if (id) {
    column.id = id;
  }
  if (renderer) {
    column.Cell = renderer;
  }
  if (sortType) {
    column.sortType = sortType;
  }

  return column;
};

export const defaultIncidentColumns = () => ([
  incidentColumn({
    header: '#',
    accessor: 'incident_number',
    minWidth: 80,
    renderer: ({
      value,
      row,
    }) => renderLinkCell({
      text: value,
      href: row.original.html_url,
    }),
  }),
  incidentColumn({
    header: 'Title',
    accessor: 'title',
    minWidth: 200,
    renderer: ({
      value,
      row,
    }) => renderLinkCell({
      text: value,
      href: row.original.html_url,
    }),
  }),
  incidentColumn({
    header: 'Description',
    accessor: 'description',
    minWidth: 200,
  }),
  incidentColumn({
    header: 'Created At',
    accessor: 'created_at',
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
  }),
  incidentColumn({
    header: 'Status',
    accessor: 'status',
    minWidth: 90,
    renderer: ({
      value,
    }) => (
      <StatusComponent status={value} />
    ),
  }),
  incidentColumn({
    header: 'Incident Key',
    accessor: 'incident_key',
    minWidth: 300,
  }),
  incidentColumn({
    header: 'Service',
    accessor: 'service.summary',
    minWidth: 150,
    renderer: ({
      value,
      row,
    }) => renderLinkCell({
      text: value,
      href: row.original.service.html_url,
    }),
  }),
  incidentColumn({
    id: 'assignees',
    header: 'Assignees',
    accessor: (incident) => (
      incident.assignments.map(
        (assignment) => (assignment.assignee.summary),
      ).join(', ')
    ),
    minWidth: 160,
    renderer: ({
      row,
    }) => (
      <PersonInitialsComponents
        displayedUsers={row.original.assignments.map(
          (assignment) => ({
            user: assignment.assignee,
          }),
        )}
      />
    ),
  }),
  incidentColumn({
    header: 'Last Status Change At',
    accessor: 'last_status_change_at',
    minWidth: 200,
    renderer: ({
      value,
    }) => renderDateCell({
      iso8601Date: value,
    }),
  }),
  incidentColumn({
    header: 'Num Alerts',
    accessor: 'alert_counts.all',
    minWidth: 130,
  }),
  incidentColumn({
    header: 'Escalation Policy',
    accessor: 'escalation_policy.summary',
    minWidth: 150,
    renderer: ({
      value,
      row,
    }) => renderLinkCell({
      text: value,
      href: row.original.escalation_policy.html_url,
    }),
  }),
  incidentColumn({
    id: 'teams',
    header: 'Teams',
    accessor: (incident) => (
      incident.teams
        ? incident.teams.map(
          (team) => (team.summary),
        ).join(', ')
        : ''
    ),
    minWidth: 200,
    renderer: ({
      row,
    }) => {
      const {
        teams,
      } = row.original.teams ? row.original : [];
      if (teams.length > 0) {
        return renderLinkCells(teams.map((team) => ({
          text: team.summary,
          href: team.html_url,
        })));
      }
      return null;
    },
  }),
  incidentColumn({
    id: 'acknowledgements',
    header: 'Acknowledgements',
    accessor: (incident) => (
      incident.acknowledgements.map(
        (acknowledger) => (acknowledger.summary),
      ).join(', ')
    ),
    minWidth: 160,
    renderer: ({
      row,
    }) => (
      <PersonInitialsComponents
        displayedUsers={row.original.acknowledgements.map(
          (acknowledgement) => ({
            user: acknowledgement.acknowledger,
          }),
        )}
      />
    ),
  }),
  incidentColumn({
    header: 'Last Status Change By',
    accessor: 'last_status_change_by.summary',
    minWidth: 150,
    renderer: ({
      value,
      row,
    }) => renderLinkCell({
      text: value,
      href: row.original.last_status_change_by.html_url,
    }),
  }),
  incidentColumn({
    header: 'Priority',
    accessor: 'priority.summary',
    minWidth: 90,
    renderer: ({
      value,
      row,
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
          <Badge className="urgency-badge" variant="primary">
            <ChevronUpIcon />
            {' '}
            {i18next.t('High')}
          </Badge>
        );
      } else if (urgency === LOW) {
        elem = (
          <Badge className="urgency-badge" variant="secondary">
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
    header: 'Incident ID',
    accessor: 'id',
    minWidth: 160,
  }),
  incidentColumn({
    header: 'Summary',
    accessor: 'summary',
    minWidth: 300,
    renderer: ({
      value,
      row,
    }) => renderLinkCell({
      text: value,
      href: row.original.html_url,
    }),
  }),
  incidentColumn({
    id: 'latest_note',
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
    }) => {
      if (original.notes && original.notes.length > 0) {
        return original.notes.slice(-1)[0].content;
      }
      if (original.notes && original.notes.length === 0) {
        return '--';
      }
      return `${i18next.t('Fetching Notes')} ...`;
    },
  }),
  incidentColumn({
    id: 'external_references',
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
        return renderLinkCells(externalReferences.map((ext) => ({
          text: `${ext.summary} (${ext.external_id})`,
          href: ext.external_url,
        })));
      }
      return '--';
    },
  }),
]);

export const defaultAlertsColumns = () => ([
  incidentColumn({
    id: 'severity',
    header: 'Severity',
    accessor: (incident) => (
      incident.alerts?.status
      || incident.alerts?.[0]?.body?.cef_details?.severity
      || ''
    ),
    minWidth: 100,
    renderer: ({
      value,
    }) => {
      const i18nValue = i18next.t(value);
      let variant;
      switch (value) {
        case 'critical':
          variant = 'dark';
          break;
        case 'error':
          variant = 'danger';
          break;
        case 'warning':
          variant = 'warning';
          break;
        case 'info':
          variant = 'info';
          break;
        case '--':
          variant = null;
          break;
        default:
          variant = 'secondary';
      }
      return (
        <Badge className="severity-badge" variant={variant}>
          {i18nValue}
        </Badge>
      );
    },
    sortType: (row1, row2, columnId) => {
      const severityRank = {
        critical: 4,
        error: 3,
        warning: 2,
        info: 1,
        '--': 0,
      };
      const row1Rank = row1.values[columnId] ? severityRank[row1.values[columnId]] : 0;
      const row2Rank = row2.values[columnId] ? severityRank[row2.values[columnId]] : 0;
      const order = row1Rank > row2Rank ? 1 : -1;
      return order;
    },
  }),
  incidentColumn({
    id: 'source_component',
    header: 'Component',
    accessor: (incident) => (
      incident.alerts?.status
      || incident.alerts?.[0]?.body?.cef_details?.source_component
      || ''
    ),
    minWidth: 100,
    renderer: ({
      value,
    }) => value || '--',
  }),
  incidentColumn({
    id: 'source_origin',
    header: 'Source',
    accessor: (incident) => (
      incident.alerts?.status
      || incident.alerts?.[0]?.body?.cef_details?.source_origin
      || ''
    ),
    minWidth: 100,
    renderer: ({
      value,
    }) => value || '--',
  }),
  incidentColumn({
    id: 'event_class',
    header: 'Class',
    accessor: (incident) => (
      incident.alerts?.status
      || incident.alerts?.[0]?.body?.cef_details?.event_class
      || ''
    ),
    minWidth: 100,
    renderer: ({
      value,
    }) => value || '--',
  }),
  incidentColumn({
    id: 'service_group',
    header: 'Group',
    accessor: (incident) => (
      incident.alerts?.status
      || incident.alerts?.[0]?.body?.cef_details?.service_group
      || ''
    ),
    minWidth: 100,
    renderer: ({
      value,
    }) => value || '--',
  }),
]);

export const customAlertColumnForSavedColumn = (savedColumn) => {
  const {
    Header: header,
    accessorPath,
    aggregator,
    width,
  } = savedColumn;
  if (!(header && accessorPath)) {
    return null;
  }
  const accessor = (incident) => {
    const path = `alerts[*].body.cef_details.${accessorPath}`;
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
    id: accessorPath,
    header,
    accessor,
    minWidth: 100,
    renderer: ({
      value,
    }) => value || '--',
  });
  if (width) {
    column.width = width;
  }
  return column;
};

export const defaultColumns = () => ([
  ...defaultIncidentColumns(),
  ...defaultAlertsColumns(),
]);

export const columnsForSavedColumns = (savedColumns) => {
  const allColumns = defaultColumns();
  const columns = savedColumns.map((column) => {
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
    return null;
  }).filter((c) => !!c);
  return columns;
};