import 'i18n.js';

import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import {
  generateRandomInteger,
} from 'src/util/helpers';

import SelectedIncidentsComponent from './SelectedIncidentsComponent';

describe('SelectedIncidentsComponent', () => {
  const randomIncidentCount = generateRandomInteger(1, 100);
  const mockIncidents = generateMockIncidents(randomIncidentCount);

  it('should render querying spinner', () => {
    const store = mockStore({
      incidentActions: {
        status: '',
      },
      responsePlays: {
        status: '',
      },
      incidents: {
        fetchingIncidents: true,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: false,
        refreshingIncidents: false,
        filteredIncidentsByQuery: [],
        incidents: [],
        incidentAlerts: {},
        incidentNotes: {},
        incidentLatestLogEntries: {},
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.selected-incidents-ctr').contains('Querying')).toBeTruthy();
  });

  it('should render fetching notes spinner', () => {
    const store = mockStore({
      incidentActions: {
        status: '',
      },
      responsePlays: {
        status: '',
      },
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: true,
        fetchingIncidentAlerts: false,
        refreshingIncidents: false,
        filteredIncidentsByQuery: [],
        incidents: [],
        incidentAlerts: {},
        incidentNotes: {},
        incidentLatestLogEntries: {},
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.selected-incidents-ctr').contains('Fetching Notes')).toBeTruthy();
  });

  it('should render fetching alerts spinner', () => {
    const store = mockStore({
      incidentActions: {
        status: '',
      },
      responsePlays: {
        status: '',
      },
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: true,
        refreshingIncidents: false,
        filteredIncidentsByQuery: [],
        incidents: [],
        incidentAlerts: {},
        incidentNotes: {},
        incidentLatestLogEntries: {},
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.selected-incidents-ctr').contains('Fetching Alerts')).toBeTruthy();
  });

  it('should render refreshing spinner', () => {
    const store = mockStore({
      incidentActions: {
        status: '',
      },
      responsePlays: {
        status: '',
      },
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: false,
        refreshingIncidents: true,
        filteredIncidentsByQuery: [],
        incidents: [],
        incidentAlerts: {},
        incidentNotes: {},
        incidentLatestLogEntries: {},
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.selected-incidents-ctr').contains('Refreshing')).toBeTruthy();
  });

  it('should render selected incidents information', () => {
    const randomSelectedIncidentCount = generateRandomInteger(0, mockIncidents.length);
    const store = mockStore({
      incidentActions: {
        status: '',
      },
      responsePlays: {
        status: '',
      },
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: false,
        refreshingIncidents: false,
        filteredIncidentsByQuery: mockIncidents,
        incidents: mockIncidents,
        incidentAlerts: {},
        incidentNotes: {},
        incidentLatestLogEntries: {},
      },
      incidentTable: {
        selectedCount: randomSelectedIncidentCount,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('span.selected-incidents-badge').text()).toEqual(
      `${randomSelectedIncidentCount}/${mockIncidents.length} Selected`,
    );
  });
});
