import '@testing-library/jest-dom';

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

import {
  TRIGGERED, RESOLVED,
} from 'util/incidents';

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
    },
    querySettings: [],
    priorities: { priorities: [] },
    escalationPolicies: { escalationPolicies: [] },
    extensions: {
      serviceExtensionMap: {},
    },
    responsePlays: { responsePlays: [] },
    settings: {
      darkMode: false,
    },
  };

  const tempStoreMap = { ...baseStoreMap };
  const tempMockIncident = { ...mockIncidents[0] };

  it('should render element', () => {
    store = mockStore(baseStoreMap);
    const wrapper = componentWrapper(store, IncidentActionsComponent);
    expect(wrapper.find('#incident-actions-ctr')).toBeTruthy();
  });

  it('should activate all buttons when a triggered incident is selected', () => {
    tempMockIncident.status = TRIGGERED;
    tempStoreMap.incidentTable = { selectedRows: [tempMockIncident], selectedCount: 1 };
    store = mockStore(tempStoreMap);
    const wrapper = componentWrapper(store, IncidentActionsComponent);

    expect(wrapper.find('button#incident-action-acknowledge-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
    expect(wrapper.find('button#incident-action-escalate-button').prop('className')).toEqual(
      'dropdown-toggle btn btn-light',
    );
    expect(wrapper.find('button#incident-action-reassign-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
    expect(wrapper.find('button#incident-action-add-responders-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
    expect(wrapper.find('button#incident-action-snooze-button').prop('className')).toEqual(
      'dropdown-toggle btn btn-light',
    );
    expect(wrapper.find('button#incident-action-merge-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
    expect(wrapper.find('button#incident-action-resolve-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
    expect(wrapper.find('button#incident-action-update-priority-button').prop('className')).toEqual(
      'dropdown-toggle btn btn-light',
    );
    expect(wrapper.find('button#incident-action-add-note-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
    expect(wrapper.find('button#incident-action-run-action-button').prop('className')).toEqual(
      'dropdown-toggle btn btn-light',
    );
  });

  it('should deactivate acknowledge button when a resolved incident is selected', () => {
    tempMockIncident.status = RESOLVED;
    tempStoreMap.incidentTable = { selectedRows: [tempMockIncident], selectedCount: 1 };
    store = mockStore(tempStoreMap);
    const wrapper = componentWrapper(store, IncidentActionsComponent);

    expect(wrapper.find('button#incident-action-acknowledge-button').prop('className')).toEqual(
      'action-button btn btn-outline-secondary',
    );
  });

  it('should activate merge button when a resolved incident is selected', () => {
    tempMockIncident.status = RESOLVED;
    tempStoreMap.incidentTable = { selectedRows: [tempMockIncident], selectedCount: 1 };
    store = mockStore(tempStoreMap);
    const wrapper = componentWrapper(store, IncidentActionsComponent);

    expect(wrapper.find('button#incident-action-merge-button').prop('className')).toEqual(
      'action-button btn btn-light',
    );
  });
});
