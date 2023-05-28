/* eslint-disable camelcase */
import moment from 'moment';
import {
  JSONPath,
} from 'jsonpath-plus';
import {
  sanitizeUrl,
} from '@braintree/sanitize-url';
import validator from 'validator';
import i18next from 'i18n';

import {
  Badge,
} from 'react-bootstrap';

import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faChevronUp, faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

import PersonInitialsComponent from 'components/IncidentTable/subcomponents/PersonInitialsComponents';
import StatusComponent from 'components/IncidentTable/subcomponents/StatusComponent';

import {
  DATE_FORMAT,
} from 'config/constants';
import {
  HIGH, LOW,
} from 'util/incidents';
import {
  getObjectsFromList, getTextWidth,
} from 'util/helpers';

// Define all possible columns for incidents under PagerDuty's API
export const availableIncidentTableColumns = [
  {
    columnType: 'incident',
    accessor: 'incident_number',
    Header: '#',
    sortable: true,
    minWidth: 80,
    Cell: ({
      row,
    }) => (
      <a href={row.original.html_url} target="_blank" rel="noopener noreferrer">
        {row.original.incident_number}
      </a>
    ),
  },
  {
    columnType: 'incident',
    accessor: 'title',
    Header: 'Title',
    i18n: i18next.t('Title'),
    sortable: true,
    minWidth: 400,
    Cell: ({
      row,
    }) => (
      <a
        href={row.original.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="td-wrapper"
      >
        {row.original.title}
      </a>
    ),
  },
  {
    columnType: 'incident',
    accessor: 'description',
    Header: 'Description',
    i18n: i18next.t('Description'),
    sortable: true,
    minWidth: 400,
    Cell: ({
      row,
    }) => <span className="td-wrapper">{row.original.description}</span>,
  },
  {
    columnType: 'incident',
    accessor: 'created_at',
    Header: 'Created At',
    i18n: i18next.t('Created At'),
    sortable: true,
    minWidth: 180,
    Cell: ({
      row,
    }) => {
      const formattedDate = moment(row.original.created_at).format(DATE_FORMAT);
      return formattedDate;
    },
  },
  {
    columnType: 'incident',
    accessor: 'status',
    Header: 'Status',
    i18n: i18next.t('Status'),
    sortable: true,
    minWidth: 100,
    Cell: ({
      row,
    }) => <StatusComponent status={row.original.status} />,
  },
  {
    columnType: 'incident',
    accessor: 'incident_key',
    Header: 'Incident Key',
    i18n: i18next.t('Incident Key'),
    sortable: true,
    minWidth: 300,
  },
  {
    columnType: 'incident',
    accessor: 'service.summary',
    Header: 'Service',
    i18n: i18next.t('Service'),
    sortable: true,
    minWidth: 150,
    Cell: ({
      row,
    }) => (
      <a
        href={row.original.service.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="td-wrapper"
      >
        {row.original.service.summary}
      </a>
    ),
  },
  {
    columnType: 'incident',
    accessor: (incident) => (incident.assignments
      ? incident.assignments.map(({
        assignee,
      }) => assignee.summary).join(', ')
      : 'Unassigned'),
    Header: 'Assignees',
    i18n: i18next.t('Assignees'),
    sortable: true,
    minWidth: 160,
    Cell: ({
      row,
    }) => {
      const {
        assignments,
      } = row.original.assignments ? row.original : [];
      const users = assignments.length > 0
        ? assignments.map(({
          assignee,
        }) => ({ user: { ...assignee } }))
        : [];
      return <PersonInitialsComponent displayedUsers={users} />;
    },
  },
  {
    columnType: 'incident',
    accessor: 'last_status_change_at',
    Header: 'Last Status Change At',
    i18n: i18next.t('Last Status Change At'),
    sortable: true,
    minWidth: 220,
    // width: 220,
    Cell: ({
      row,
    }) => {
      const formattedDate = moment(row.original.last_status_change_at).format(DATE_FORMAT);
      return formattedDate;
    },
  },
  {
    columnType: 'incident',
    accessor: 'alert_counts.all',
    Header: 'Num Alerts',
    i18n: i18next.t('Num Alerts'),
    sortable: true,
    minWidth: 130,
  },
  {
    columnType: 'incident',
    accessor: 'escalation_policy.summary',
    Header: 'Escalation Policy',
    i18n: i18next.t('Escalation Policy'),
    sortable: true,
    minWidth: 200,
    Cell: ({
      row,
    }) => (
      <a
        href={row.original.escalation_policy.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="td-wrapper"
      >
        {row.original.escalation_policy.summary}
      </a>
    ),
  },
  {
    columnType: 'incident',
    accessor: (incident) => {
      if (incident.teams) return incident.teams.map((team) => team.summary).join(', ');
      return 'N/A';
    },
    Header: 'Teams',
    i18n: i18next.t('Teams'),
    sortable: true,
    minWidth: 200,
    Cell: ({
      row,
    }) => {
      const {
        teams,
      } = row.original.teams ? row.original : [];
      if (teams.length > 0) {
        return (
          <div>
            {teams.map((team, idx, {
              length,
            }) => (
              <a
                data-team-id={team.id}
                href={team.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="td-wrapper"
              >
                {team.summary}
                {length - 1 === idx ? null : ', '}
              </a>
            ))}
          </div>
        );
      }
      return null;
    },
  },
  {
    columnType: 'incident',
    accessor: (incident) => (incident.acknowledgements
      ? incident.acknowledgements.map(({
        acknowledger,
      }) => acknowledger.summary).join(', ')
      : 'N/A'),
    Header: 'Acknowledgments',
    i18n: i18next.t('Acknowledgments'),
    sortable: true,
    minWidth: 250,
    Cell: ({
      row,
    }) => {
      const {
        acknowledgements,
      } = row.original.acknowledgements ? row.original : [];
      const users = acknowledgements.length > 0
        ? acknowledgements.map(({
          acknowledger,
        }) => ({ user: { ...acknowledger } }))
        : [];
      return <PersonInitialsComponent displayedUsers={users} />;
    },
  },
  {
    columnType: 'incident',
    accessor: 'last_status_change_by.summary',
    Header: 'Last Status Change By',
    i18n: i18next.t('Last Status Change By'),
    sortable: true,
    minWidth: 250,
    Cell: ({
      row,
    }) => (
      <a
        href={row.original.last_status_change_by.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="td-wrapper"
      >
        {row.original.last_status_change_by.summary}
      </a>
    ),
  },
  {
    columnType: 'incident',
    accessor: (incident) => {
      if (incident.priority) {
        return (
          <div
            style={{
              backgroundColor: `#${incident.priority.color}`,
              color: 'white',
            }}
            className="priority-label"
          >
            {incident.priority.summary}
          </div>
        );
      }
      return <div className="priority-label">--</div>;
    },
    Header: 'Priority',
    i18n: i18next.t('Priority'),
    sortable: true,
    minWidth: 90,
    sortType: (row1, row2) => {
      const row1Rank = row1.original.priority ? row1.original.priority.order : 0;
      const row2Rank = row2.original.priority ? row2.original.priority.order : 0;
      const order = row1Rank > row2Rank ? 1 : -1;
      return order;
    },
  },
  // TODO: incidents_responders, responder_requests, subscriber_requests
  {
    columnType: 'incident',
    accessor: 'urgency',
    Header: 'Urgency',
    i18n: i18next.t('Urgency'),
    sortable: true,
    minWidth: 120,
    Cell: ({
      row,
    }) => {
      const {
        urgency,
      } = row.original;
      let elem;
      if (urgency === HIGH) {
        elem = (
          <Badge className="urgency-badge" variant="primary">
            <FontAwesomeIcon icon={faChevronUp} />
            {' '}
            {i18next.t('High')}
          </Badge>
        );
      } else if (urgency === LOW) {
        elem = (
          <Badge className="urgency-badge" variant="secondary">
            <FontAwesomeIcon icon={faChevronDown} />
            {' '}
            {i18next.t('Low')}
          </Badge>
        );
      }
      return elem;
    },
  },
  {
    columnType: 'incident',
    accessor: 'id',
    Header: 'Incident ID',
    i18n: i18next.t('Incident ID'),
    sortable: true,
    minWidth: 160,
  },
  {
    columnType: 'incident',
    accessor: 'summary',
    Header: 'Summary',
    i18n: i18next.t('Summary'),
    sortable: true,
    minWidth: 400,
    Cell: ({
      row,
    }) => <span className="td-wrapper">{row.original.description}</span>,
  },
  {
    columnType: 'incident',
    accessor: (incident) => {
      let content;
      if (incident.notes && incident.notes.length > 0) {
        content = incident.notes.slice(-1)[0].content;
      } else if (incident.notes && incident.notes.length === 0) {
        content = '--';
      } else {
        content = `${i18next.t('Fetching Notes')} ...`;
      }
      return content;
    },
    Header: 'Latest Note',
    i18n: i18next.t('Latest Note'),
    sortable: true,
    minWidth: 200,
    Cell: ({
      value,
    }) => <div className="td-wrapper">{value}</div>,
  },
  {
    columnType: 'incident',
    accessor: (incident) => (incident.external_references
      ? incident.external_references.map((ext) => ext.external_id).join(', ')
      : 'N/A'),
    Header: 'External References',
    i18n: i18next.t('External References'),
    sortable: true,
    minWidth: 200,
    Cell: ({
      row,
    }) => {
      let external_references = [];
      if (row.original && row.original.external_references) {
        external_references = row.original.external_references;
      }
      if (external_references.length > 0) {
        return (
          <div>
            {external_references.map((ext, idx, {
              length,
            }) => (
              <a
                data-external-reference-id={ext.id}
                href={ext.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="td-wrapper"
              >
                {`${ext.summary} (${ext.external_id})`}
                {length - 1 === idx ? null : ', '}
              </a>
            ))}
          </div>
        );
      }
      return '--';
    },
  },
];

// Define all possible columns for alerts under PagerDuty's API
export const availableAlertTableColumns = [
  {
    columnType: 'alert',
    accessor: (incident) => {
      let content = `${i18next.t('Fetching Alerts')} ...`;
      if (incident.alerts) {
        if (incident.alerts.status) {
          content = incident.alerts.status;
        } else if (incident.alerts.length > 0) {
          content = incident.alerts[0].severity
            || incident.alerts[0].body?.cef_details.severity
            || '--';
        } else {
          content = '--';
        }
      } else {
        content = '--';
      }
      return content;
      // if (
      //   incident.alerts
      //   && incident.alerts.length > 0
      //   && incident.alerts[0].body
      //   && incident.alerts[0].body.cef_details
      //   && incident.alerts[0].body.cef_details.severity
      // ) {
      //   content = incident.alerts[0].body.cef_details.severity;
      // } else if (incident.alerts) {
      //   content = '--';
      // } else {
      //   content = `${i18next.t('Fetching Alerts')} ...`;
      // }
      // return content;
    },
    Header: 'Severity',
    i18n: i18next.t('Severity'),
    sortable: true,
    minWidth: 120,
    sortType: (row1, row2) => {
      const severityRank = {
        critical: 4,
        error: 3,
        warning: 2,
        info: 1,
        '--': 0,
      };
      const row1Rank = row1.values.Severity ? severityRank[row1.values.Severity] : 0;
      const row2Rank = row2.values.Severity ? severityRank[row2.values.Severity] : 0;
      const order = row1Rank > row2Rank ? 1 : -1;
      return order;
    },
    Cell: ({
      value,
    }) => {
      let variant = '';
      let i18nValue = '';
      switch (value) {
        case 'critical':
          variant = 'dark';
          i18nValue = i18next.t('critical');
          break;
        case 'error':
          variant = 'danger';
          i18nValue = i18next.t('error');
          break;
        case 'warning':
          variant = 'warning';
          i18nValue = i18next.t('warning');
          break;
        case 'info':
          variant = 'info';
          i18nValue = i18next.t('info');
          break;
        case '--':
          variant = null;
          break;
        default:
          variant = 'secondary';
          i18nValue = i18next.t(value);
      }
      return (
        <Badge className="severity-badge" variant={variant}>
          {i18nValue}
        </Badge>
      );
    },
  },
  {
    columnType: 'alert',
    accessor: (incident) => {
      let content;
      if (
        incident.alerts
        && incident.alerts.length > 0
        && incident.alerts[0].body
        && incident.alerts[0].body.cef_details
        && incident.alerts[0].body.cef_details.source_component
      ) {
        content = incident.alerts[0].body.cef_details.source_component;
      } else if (incident.alerts) {
        content = '--';
      } else {
        content = `${i18next.t('Fetching Alerts')} ...`;
      }
      return content;
    },
    Header: 'Component',
    i18n: i18next.t('Component'),
    sortable: true,
    minWidth: 130,
    Cell: ({
      value,
    }) => <div className="td-wrapper">{value}</div>,
  },
  {
    columnType: 'alert',
    accessor: (incident) => {
      let content;
      if (
        incident.alerts
        && incident.alerts.length > 0
        && incident.alerts[0].body
        && incident.alerts[0].body.cef_details
        && incident.alerts[0].body.cef_details.source_origin
      ) {
        content = incident.alerts[0].body.cef_details.source_origin;
      } else if (incident.alerts) {
        content = '--';
      } else {
        content = `${i18next.t('Fetching Alerts')} ...`;
      }
      return content;
    },
    Header: 'Source',
    i18n: i18next.t('Source'),
    sortable: true,
    minWidth: 100,
    Cell: ({
      value,
    }) => <div className="td-wrapper">{value}</div>,
  },
  {
    columnType: 'alert',
    accessor: (incident) => {
      let content;
      if (
        incident.alerts
        && incident.alerts.length > 0
        && incident.alerts[0].body
        && incident.alerts[0].body.cef_details
        && incident.alerts[0].body.cef_details.event_class
      ) {
        content = incident.alerts[0].body.cef_details.event_class;
      } else if (incident.alerts) {
        content = '--';
      } else {
        content = `${i18next.t('Fetching Alerts')} ...`;
      }
      return content;
    },
    Header: 'Class',
    i18n: i18next.t('Class'),
    sortable: true,
    minWidth: 100,
    Cell: ({
      value,
    }) => <div className="td-wrapper">{value}</div>,
  },
  {
    columnType: 'alert',
    accessor: (incident) => {
      let content;
      if (
        incident.alerts
        && incident.alerts.length > 0
        && incident.alerts[0].body
        && incident.alerts[0].body.cef_details
        && incident.alerts[0].body.cef_details.service_group
      ) {
        content = incident.alerts[0].body.cef_details.service_group;
      } else if (incident.alerts) {
        content = '--';
      } else {
        content = `${i18next.t('Fetching Alerts')} ...`;
      }
      return content;
    },
    Header: 'Group',
    i18n: i18next.t('Group'),
    sortable: true,
    minWidth: 100,
    Cell: ({
      value,
    }) => <div className="td-wrapper">{value}</div>,
  },
];

// Helper function to define a column for a custom field from the incident object
export const customReactTableColumnSchema = (
  columnType,
  header,
  accessorPath,
  aggregator = null,
) => {
  let accessor;
  let fullJsonPath;
  let result;
  let content;
  // Handle accessorPath based on columnType (e.g. alert vs custom incident field)
  if (columnType === 'alert') {
    accessor = (incident) => {
      // Determine if field content should be aggregated or from latest alert
      if (aggregator) {
        fullJsonPath = `alerts[*].body.cef_details.${accessorPath}`;
      } else {
        fullJsonPath = `alerts[0].body.cef_details.${accessorPath}`;
      }
      try {
        result = JSONPath({
          path: fullJsonPath,
          json: incident,
          wrap: false,
        });
      } catch (e) {
        result = null;
      }
      if (!accessorPath) {
        content = i18next.t('Invalid JSON Path');
      } else if (result && !Array.isArray(result)) {
        content = result;
      } else if (result && Array.isArray(result)) {
        // Deduplicate values if aggregator is used
        if (aggregator) {
          content = [...new Set(result)].sort().join(', ');
        } else {
          content = result.join(', ');
        }
      } else if (!result) {
        content = '--';
      } else {
        // FIXME: This codepath doesn't work
        content = `${i18next.t('Fetching Alerts')} ...`;
      }
      return content;
    };
  } else {
    // TODO: Entrypoint for custom incident fields
  }
  return {
    columnType,
    accessorPath,
    fullJsonPath,
    accessor,
    aggregator,
    Header: header,
    sortable: true,
    minWidth: getTextWidth(header, 'bold 16px sans-serif') + 40,
    Cell: ({
      value,
    }) => {
      // Determine if content should be rendered as link or plaintext
      const sanitizedValue = sanitizeUrl(value);
      if (validator.isURL(sanitizedValue)) {
        return (
          <a href={sanitizedValue} target="_blank" rel="noopener noreferrer" className="td-wrapper">
            {sanitizedValue}
          </a>
        );
      }
      return <div className="td-wrapper">{value}</div>;
    },
  };
};

// Helper function to retrieve React Table column schemas from list of column objects
export const getReactTableColumnSchemas = (columns) => {
  const reactTableColumnSchemas = [];
  columns.forEach((col) => {
    let columnSchema;
    if (col.columnType === 'incident') {
      // Handle standard incident data in column
      columnSchema = {
        ...getObjectsFromList(availableIncidentTableColumns, [col.Header], 'Header')[0],
      };
    } else if (col.columnType === 'alert') {
      // Handle alert level data in column
      switch (col.Header) {
        // Standard PD-CEF fields
        case 'Severity':
        case 'Group':
        case 'Source':
        case 'Component':
        case 'Class':
          columnSchema = {
            ...getObjectsFromList(availableAlertTableColumns, [col.Header], 'Header')[0],
          };
          break;
        // Custom alert details
        default:
          columnSchema = {
            ...customReactTableColumnSchema('alert', col.Header, col.accessorPath, col.aggregator),
          };
      }
    }
    // Explicitly set width for rendering (this may come from existing redux store)
    columnSchema.width = col.width;
    reactTableColumnSchemas.push(columnSchema);
  });
  return reactTableColumnSchemas;
};
