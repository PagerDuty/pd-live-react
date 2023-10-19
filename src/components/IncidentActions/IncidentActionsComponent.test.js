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

import {
  TRIGGERED, RESOLVED,
} from 'src/util/incidents';

import IncidentActionsComponent from './IncidentActionsComponent';

describe('IncidentActionsComponent', () => {
  const randomIncidentCount = generateRandomInteger(1, 100);
  const mockIncidents = generateMockIncidents(randomIncidentCount);

  let store;
  const baseStoreMap = {
    incidentTable: { selectedRows: [], selectedCount: 0 },
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
    querySettings: [],
    priorities: { priorities: [] },
    escalationPolicies: { escalationPolicies: [] },
    extensions: {
      serviceExtensionMap: {},
    },
    incidentActions: {
      status: '',
    },
    responsePlays: {
      responsePlays: [],
      status: '',
    },
    settings: {
      darkMode: false,
    },
    connection: { abilities: [] },
  };

  const tempStoreMap = { ...baseStoreMap };
  const tempMockIncident = { ...mockIncidents[0] };

  it('should render element', () => {
    store = mockStore(baseStoreMap);
    componentWrapper(store, IncidentActionsComponent);
    expect(screen.getAllByRole('button')).toHaveLength(10); // All 10 action buttons
  });

  it('should activate all buttons when a triggered incident is selected', () => {
    tempMockIncident.status = TRIGGERED;
    tempStoreMap.incidentTable = { selectedRows: [tempMockIncident], selectedCount: 1 };
    store = mockStore(tempStoreMap);
    componentWrapper(store, IncidentActionsComponent);

    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Escalate' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reassign' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add Responders' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Snooze' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Merge' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Resolve' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Update Priority' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add Note' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Run Action' })).toBeEnabled();
  });

  it('should deactivate acknowledge button when a resolved incident is selected', () => {
    tempMockIncident.status = RESOLVED;
    tempStoreMap.incidentTable = { selectedRows: [tempMockIncident], selectedCount: 1 };
    store = mockStore(tempStoreMap);
    componentWrapper(store, IncidentActionsComponent);

    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeDisabled();
  });

  it('should activate merge button when a resolved incident is selected', () => {
    tempMockIncident.status = RESOLVED;
    tempStoreMap.incidentTable = { selectedRows: [tempMockIncident], selectedCount: 1 };
    store = mockStore(tempStoreMap);
    componentWrapper(store, IncidentActionsComponent);

    expect(screen.getByRole('button', { name: 'Merge' })).toBeEnabled();
  });

  it('should deactivate priority button when disable_edit_priority ability is set', () => {
    tempStoreMap.connection = { abilities: ['disable_edit_priority'] };
    store = mockStore(tempStoreMap);
    componentWrapper(store, IncidentActionsComponent);

    expect(screen.getByRole('button', { name: 'Update Priority' })).toBeDisabled();
  });
});
