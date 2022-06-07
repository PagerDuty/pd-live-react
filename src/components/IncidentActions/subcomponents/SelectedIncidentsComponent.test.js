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

describe('SelectedIncidentsComponent', () => {
  const randomIncidentCount = generateRandomInteger(1, 100);
  const mockIncidents = generateMockIncidents(randomIncidentCount);

  it('should render querying spinner', () => {
    const store = mockStore({
      incidents: {
        fetchingIncidents: true,
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

  it('should render selected incidents information', () => {
    const randomSelectedIncidentCount = generateRandomInteger(0, 100);
    const store = mockStore({
      incidents: {
        fetchingIncidents: false,
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

  it('should render N/A when query has been cancelled', () => {
    const store = mockStore({
      incidents: {
        fetchingIncidents: false,
        filteredIncidentsByQuery: [],
      },
      incidentTable: {
        selectedCount: 0,
      },
      querySettings: {
        error: 'ERROR',
      },
    });

    const wrapper = componentWrapper(store, SelectedIncidentsComponent);
    expect(wrapper.find('span.selected-incidents-badge').hasClass('badge-warning')).toBeTruthy();
    expect(wrapper.find('span.selected-incidents-badge').text()).toEqual('N/A');
  });
});
