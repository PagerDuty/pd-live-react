import '@testing-library/jest-dom';

import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import {
  defaultSinceDateTenors,
} from 'util/settings';

import {
  MAX_INCIDENTS_LIMIT_LOWER,
  MAX_INCIDENTS_LIMIT_UPPER,
  MAX_RATE_LIMIT_LOWER,
  MAX_RATE_LIMIT_UPPER,
  REFRESH_INTERVAL_LOWER,
  REFRESH_INTERVAL_UPPER,
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
        maxIncidentsLimit: MAX_INCIDENTS_LIMIT_LOWER,
        maxRateLimit: MAX_RATE_LIMIT_LOWER,
        darkMode: false,
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
    expect(wrapper.find("div[aria-label='Max Incidents Limit']").prop('aria-valuenow')).toEqual(
      MAX_INCIDENTS_LIMIT_LOWER,
    );
    expect(wrapper.find("div[aria-label='Max Rate Limit']").prop('aria-valuenow')).toEqual(
      MAX_RATE_LIMIT_LOWER,
    );

    expect(wrapper.find('input#server-side-filtering-switch').prop('checked'));
    expect(wrapper.find('input#search-all-custom-details-switch').prop('checked'));
  });
});
