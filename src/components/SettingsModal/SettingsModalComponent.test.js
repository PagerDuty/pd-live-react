import '@testing-library/jest-dom';

import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import {
  MAX_RATE_LIMIT_LOWER,
} from 'config/constants';

import SettingsModalComponent from './SettingsModalComponent';

describe('SettingsModalComponent', () => {
  let baseStore;
  let store;

  beforeEach(() => {
    baseStore = {
      settings: {
        displaySettingsModal: true,
        defaultSinceDateTenor: '1 Day',
        maxRateLimit: MAX_RATE_LIMIT_LOWER,
        serverSideFiltering: true,
        searchAllCustomDetails: true,
        respondersInEpFilter: true,
        relativeDates: true,
      },
      users: {
        currentUserLocale: 'en-GB',
      },
    };
  });

  it('should render modal', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    expect(wrapper.find('.chakra-modal__header').contains('Settings')).toBeTruthy();
  });

  it('should display user profile settings', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);

    expect(wrapper.find('select#user-locale-select').props().value).toBe('en-GB');
    expect(wrapper.find('select#since-date-tenor-select').props().value).toBe('1 Day');
    expect(wrapper.find("div[aria-label='Max Rate Limit']").prop('aria-valuenow')).toEqual(
      MAX_RATE_LIMIT_LOWER,
    );

    expect(wrapper.find('input#server-side-filtering-switch').prop('checked')).toBeTruthy();
    expect(wrapper.find('input#search-all-custom-details-switch').prop('checked')).toBeTruthy();
    expect(wrapper.find('input#responders-in-ep-filter-switch').prop('checked')).toBeTruthy();
    expect(wrapper.find('input#relative-dates-switch').prop('checked')).toBeTruthy();
  });
});
