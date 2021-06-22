import produce from "immer";

import {
  TOGGLE_INCIDENT_TABLE_SETTINGS_REQUESTED,
  TOGGLE_INCIDENT_TABLE_SETTINGS_COMPLETED,
  UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED,
  UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED,
  UPDATE_TEMP_INCIDENT_TABLE_COLUMNS_REQUESTED,
  UPDATE_TEMP_INCIDENT_TABLE_COLUMNS_COMPLETED,
} from "./actions";

export const incidentTableSettings = produce(
  (draft, action) => {
    switch (action.type) {
      case TOGGLE_INCIDENT_TABLE_SETTINGS_REQUESTED:
        draft.status = TOGGLE_INCIDENT_TABLE_SETTINGS_REQUESTED;
        break;

      case TOGGLE_INCIDENT_TABLE_SETTINGS_COMPLETED:
        draft.displayIncidentTableSettings = action.displayIncidentTableSettings;
        draft.status = TOGGLE_INCIDENT_TABLE_SETTINGS_COMPLETED;
        break;

      case UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED:
        draft.status = UPDATE_INCIDENT_TABLE_COLUMNS_REQUESTED;
        break;

      case UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED:
        draft.incidentTableColumns = action.incidentTableColumns;
        draft.status = UPDATE_INCIDENT_TABLE_COLUMNS_COMPLETED;
        break;

      default:
        break;
    }
  },
  {
    incidentTableColumns: [
      {
        selector: "incident_number",
        name: "#",
        sortable: true,
        width: "80px",
        cell: (row) => {
          return (
            <a href={row.html_url} target="_blank"
              rel="noopener noreferrer">
              {row.incident_number}
            </a>
          )
        }
      },
      {
        selector: "status",
        name: "Status",
        className: "status",
        sortable: true,
        width: "100px"
      },
      {
        selector: (incident) => incident.priority ? incident.priority.summary : "--",
        name: "Priority",
        sortable: true,
        width: "100px"
      },
      {
        selector: "title",
        name: "Title",
        sortable: true,
        minWidth: "500px"
      },
      {
        selector: "created_at",
        name: "Created At",
        sortable: true,
      },
      {
        selector: "service.summary",
        name: "Service",
        sortable: true,
      },
    ],
    displayIncidentTableSettings: true,
    status: null,
    fetchingData: false,
    error: null
  }
);

export const tempIncidentTableSettings = produce(
  (draft, action) => {
    switch (action.type) {
      case UPDATE_TEMP_INCIDENT_TABLE_COLUMNS_REQUESTED:
        draft.status = UPDATE_TEMP_INCIDENT_TABLE_COLUMNS_REQUESTED;
        break;

      case UPDATE_TEMP_INCIDENT_TABLE_COLUMNS_COMPLETED:
        draft.incidentTableColumns = action.incidentTableColumns;
        draft.status = UPDATE_TEMP_INCIDENT_TABLE_COLUMNS_COMPLETED;
        break;

      default:
        break;
    }
  },
  {
    incidentTableColumns: [
      {
        selector: "incident_number",
        name: "#",
        sortable: true,
        width: "80px",
        cell: (row) => {
          return (
            <a href={row.html_url} target="_blank"
              rel="noopener noreferrer">
              {row.incident_number}
            </a>
          )
        }
      },
      {
        selector: "status",
        name: "Status",
        className: "status",
        sortable: true,
        width: "100px"
      },
      {
        selector: (incident) => incident.priority ? incident.priority.summary : "--",
        name: "Priority",
        sortable: true,
        width: "100px"
      },
      {
        selector: "title",
        name: "Title",
        sortable: true,
        minWidth: "500px"
      },
      {
        selector: "created_at",
        name: "Created At",
        sortable: true,
      },
      {
        selector: "service.summary",
        name: "Service",
        sortable: true,
      },
    ]
  }
);