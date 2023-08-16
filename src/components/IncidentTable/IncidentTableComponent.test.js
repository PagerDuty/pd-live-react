import '@testing-library/jest-dom';

import validator from 'validator';

import 'i18n.js';

import {
  mockStore, componentWrapper,
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
  });

  it('should render incident table with non-empty data', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, IncidentTableComponent);
    expect(wrapper.find('.incident-table-ctr')).toBeTruthy();
    expect(wrapper.find('div[role="columnheader"]').getElements()).toHaveLength(
      baseStore.incidentTable.incidentTableColumns.length + 1,
    ); // Include selection header
    expect(wrapper.find('div[role="row"]').getElements()).toHaveLength(mockIncidents.length + 1); // Include header row
  });

  it('should render cell with valid hyperlink for custom detail field', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, IncidentTableComponent);

    const incidentNumber = 1;
    const customDetailField = 'link';
    const url = wrapper
      .find('div[role="row"]')
      .get(incidentNumber)
      .props.children.find((td) => td.props['data-incident-header'].includes(customDetailField))
      .props.children.props.cell.value;

    console.log(url);

    expect(validator.isURL(url)).toBeTruthy();
  });

  it('should render cell with JSON stringified value for custom detail field', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, IncidentTableComponent);

    const incidentNumber = 1;
    const customDetailField = 'object_details';
    const jsonValue = wrapper
      .find('div[role="row"]')
      .get(incidentNumber)
      .props.children.find((td) => td.props['data-incident-header'].includes(customDetailField))
      .props.children.props.cell.value;

    // jsonValue should include a key with value 'value1'
    expect(typeof jsonValue).toBe('object');
    expect(JSON.stringify(jsonValue)).toContain('value1');
  });
});
