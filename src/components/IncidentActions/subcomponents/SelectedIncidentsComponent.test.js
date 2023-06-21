import 'i18n.js';

import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import {
  generateRandomInteger,
} from 'util/helpers';

import SelectedIncidentsComponent from './SelectedIncidentsComponent';

// FIXME: incident state
xdescribe('SelectedIncidentsComponent', () => {
  const randomIncidentCount = generateRandomInteger(1, 100);
  const mockIncidents = generateMockIncidents(randomIncidentCount);

  it('should render querying spinner', () => {
    const store = mockStore({
      incidents: {
        fetchingIncidents: true,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: false,
        refreshingIncidents: false,
        filteredIncidentsByQuery: [],
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.spinner-border').hasClass('text-success')).toBeTruthy();
    expect(wrapper.contains('Querying')).toBeTruthy();
  });

  it('should render fetching notes spinner', () => {
    const store = mockStore({
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: true,
        fetchingIncidentAlerts: false,
        refreshingIncidents: false,
        filteredIncidentsByQuery: [],
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.spinner-border').hasClass('text-primary')).toBeTruthy();
    expect(wrapper.contains('Fetching Notes')).toBeTruthy();
  });

  it('should render fetching alerts spinner', () => {
    const store = mockStore({
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: true,
        refreshingIncidents: false,
        filteredIncidentsByQuery: [],
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.spinner-border').hasClass('text-info')).toBeTruthy();
    expect(wrapper.contains('Fetching Alerts')).toBeTruthy();
  });

  it('should render refreshing spinner', () => {
    const store = mockStore({
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: false,
        refreshingIncidents: true,
        filteredIncidentsByQuery: [],
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('div.spinner-border').hasClass('text-success')).toBeTruthy();
    expect(wrapper.contains('Refreshing')).toBeTruthy();
  });

  it('should render selected incidents information', () => {
    const randomSelectedIncidentCount = generateRandomInteger(0, 100);
    const store = mockStore({
      incidents: {
        fetchingIncidents: false,
        fetchingIncidentNotes: false,
        fetchingIncidentAlerts: false,
        refreshingIncidents: false,
        filteredIncidentsByQuery: mockIncidents,
      },
      incidentTable: {
        selectedCount: randomSelectedIncidentCount,
      },
      querySettings: {
        error: null,
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('span.selected-incidents-badge').hasClass('badge-primary')).toBeTruthy();
    expect(wrapper.find('span.selected-incidents-badge').text()).toEqual(
      `${randomSelectedIncidentCount}/${mockIncidents.length}`,
    );
    expect(wrapper.contains('Selected')).toBeTruthy();
  });
});
