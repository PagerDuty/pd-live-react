import '@testing-library/jest-dom';

import {
  sanitizeUrl,
} from '@braintree/sanitize-url';
import validator from 'validator';

import 'i18n.js';

import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import IncidentTableComponent from './IncidentTableComponent';

// FIXME: Tests need reworked with the incident and alerts state
xdescribe('IncidentTableComponent', () => {
  let baseStore;
  let store;
  // FIXME: Jest can only render max of 3 incidents for some reason?
  const mockIncidents = generateMockIncidents(3);

  beforeEach(() => {
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
      incidents: {
        filteredIncidentsByQuery: mockIncidents,
        fetchingIncidents: false,
      },
      querySettings: {
        displayConfirmQueryModal: false,
      },
      users: {
        currentUserLocale: 'en-GB',
      },
    };
  });

  it('should render incident table with non-empty data', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, IncidentTableComponent);
    expect(wrapper.find('.incident-table-ctr')).toBeTruthy();
    expect(
      wrapper
        .find('.th')
        .getElements()
        .filter((th) => th.key.includes('header')),
    ).toHaveLength(baseStore.incidentTable.incidentTableColumns.length + 1); // Include selection header
    expect(
      wrapper
        .find('[role="row"]')
        .getElements()
        .filter((tr) => tr.key.includes('row')),
    ).toHaveLength(mockIncidents.length);
  });

  it('should render cell with valid hyperlink for custom detail field', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, IncidentTableComponent);

    const incidentNumber = 1;
    const customDetailField = 'link';
    const url = wrapper
      .find('[role="row"]')
      .get(incidentNumber)
      .props.children.find((td) => td.key.includes(customDetailField)).props.children.props
      .cell.value;
    const sanitizedUrl = sanitizeUrl(url);

    expect(validator.isURL(sanitizedUrl)).toBeTruthy();
  });

  it('should render cell with JSON stringified value for custom detail field', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, IncidentTableComponent);

    const incidentNumber = 1;
    const customDetailField = 'object_details';
    const jsonValue = wrapper
      .find('[role="row"]')
      .get(incidentNumber)
      .props.children.find((td) => td.key.includes(customDetailField)).props.children.props
      .cell.value;

    // jsonValue should include a key with value 'value1'
    expect(typeof jsonValue).toBe('object');
    expect(JSON.stringify(jsonValue)).toContain('value1');
  });
});
