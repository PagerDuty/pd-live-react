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

    componentWrapper(store, SelectedIncidentsComponent);
    expect(screen.getByText('Querying')).toBeInTheDocument();
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

    componentWrapper(store, SelectedIncidentsComponent);
    expect(screen.getByText('Fetching Notes')).toBeInTheDocument();
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

    componentWrapper(store, SelectedIncidentsComponent);
    expect(screen.getByText('Fetching Alerts')).toBeInTheDocument();
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

    componentWrapper(store, SelectedIncidentsComponent);
    expect(screen.getByText('Refreshing')).toBeInTheDocument();
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

    componentWrapper(store, SelectedIncidentsComponent);
    expect(screen.getByText(`${randomSelectedIncidentCount}/${mockIncidents.length} Selected`)).toBeInTheDocument();
  });
});
