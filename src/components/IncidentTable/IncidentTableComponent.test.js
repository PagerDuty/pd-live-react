import validator from 'validator';
import {
  componentWrapper, screen,
} from 'src/custom-testing-lib';

import 'i18n.js';

import {
  mockStore,
} from 'mocks/store.test';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import IncidentTableComponent from './IncidentTableComponent';

describe('IncidentTableComponent', () => {
  let baseStore;
  let store;
  const mockIncidents = generateMockIncidents(3);

  beforeEach(() => {
    /* eslint-disable no-param-reassign */
    // incidentAlerts is an map of alerts grouped by incident.id
    const incidentAlerts = mockIncidents.reduce((acc, incident) => {
      acc[incident.id] = incident.alerts;
      return acc;
    }, {});
    // incidentNotes is an map of notes grouped by incident.id
    const incidentNotes = mockIncidents.reduce((acc, incident) => {
      acc[incident.id] = incident.notes;
      return acc;
    }, {});
    /* eslint-enable no-param-reassign */
    baseStore = {
      incidentTable: {
        incidentTableState: {},
        incidentTableColumns: [
          {
            Header: '#',
            width: 60,
            columnType: 'incident',
          },
          {
            Header: 'Status',
            width: 100,
            columnType: 'incident',
          },
          {
            Header: 'Title',
            width: 400,
            columnType: 'incident',
          },
          {
            Header: 'quote',
            accessorPath: 'details.quote',
            aggregator: null,
            width: 100,
            columnType: 'alert',
          },
          {
            Header: 'link',
            accessorPath: 'details.link',
            aggregator: null,
            width: 100,
            columnType: 'alert',
          },
          {
            Header: 'object_details',
            accessorPath: 'details.object_details',
            aggregator: null,
            width: 100,
            columnType: 'alert',
          },
        ],
      },
      incidentActions: {
        status: '',
      },
      responsePlays: {
        status: '',
      },
      incidents: {
        filteredIncidentsByQuery: mockIncidents,
        incidents: mockIncidents,
        incidentAlerts,
        incidentNotes,
        incidentLatestLogEntries: {},
        fetchingIncidents: false,
      },
      users: {
        currentUserLocale: 'en-GB',
      },
      settings: {
        maxRateLimit: 100,
      },
    };
    store = mockStore(baseStore);
    componentWrapper(store, IncidentTableComponent);
  });

  it('should render incident table with non-empty data', () => {
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getAllByRole('columnheader')).toHaveLength(
      baseStore.incidentTable.incidentTableColumns.length + 1,
    ); // Include selection header
    expect(screen.getAllByRole('row')).toHaveLength(mockIncidents.length + 1); // Include header row
  });

  it('should render cell with valid hyperlink for custom detail field', () => {
    const incidentNumber = 1;
    const customDetailField = 'link';
    const url = screen.getAllByIncidentHeader(customDetailField)[incidentNumber].textContent;

    expect(validator.isURL(url)).toBeTruthy();
  });

  it('should render cell with JSON stringified value for custom detail field', () => {
    const incidentNumber = 1;
    const customDetailField = 'object_details';
    const jsonValue = screen.getAllByIncidentHeader(customDetailField)[incidentNumber].textContent;

    // jsonValue should include a key with value 'value1'
    expect(JSON.stringify(jsonValue)).toContain('value1');
  });
});
