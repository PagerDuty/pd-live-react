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
        autoAcceptIncidentsQuery: true,
        autoRefreshInterval: REFRESH_INTERVAL_LOWER,
        alertCustomDetailFields: [
          {
            label: 'Summary:details.to.some.path',
            value: 'Summary:details.to.some.path',
            columnType: 'alert',
          },
          {
            label: 'CustomField:details.to.some.path',
            value: 'CustomField:details.to.some.path',
            columnType: 'alert',
          },
        ],
        darkMode: false,
      },
      incidentTable: {
        incidentTableColumns: [
          { Header: '#', accessorPath: null, columnType: 'incident' },
          { Header: 'Summary', accessorPath: null, columnType: 'incident' },
        ],
      },
      users: {
        currentUserLocale: 'en-GB',
      },
    };
  });

  it('should render modal', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    expect(wrapper.find('.modal-title').contains('Settings')).toBeTruthy();
  });

  it('should display user profile settings', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="user-profile"]';
    const tabElement = wrapper.find(tabSelector);

    // FIXME: Determine correct way to click DOM with Jest - this does not update internal state
    tabElement.simulate('click');
    expect(tabElement.prop('aria-selected')).toBeTruthy();
    expect(tabElement.contains('User Profile')).toBeTruthy();

    expect(wrapper.find('#user-profile-locale-label').contains('Locale')).toBeTruthy();
    // NB: [class*="singleValue"] selector doesn't work here - have to workaround this
    expect(
      wrapper
        .findWhere((n) => (typeof n.prop('className') === 'string'
          ? n.prop('className').includes('singleValue')
          : false))
        .contains('English (United Kingdom)'),
    ).toBeTruthy();

    expect(
      wrapper
        .find('#user-profile-default-since-date-tenor-label')
        .contains('Default Since Date Lookback'),
    ).toBeTruthy();
    expect(wrapper.find('input[value="1 Day"]').prop('checked')).toBeTruthy();
    defaultSinceDateTenors.forEach((tenor) => {
      expect(wrapper.find(`input[value="${tenor}"]`).getDOMNode()).toBeVisible();
    });

    expect(
      wrapper
        .find('#user-profile-auto-refresh-interval-label')
        .contains('Auto Refresh Interval (mins)'),
    ).toBeTruthy();
    expect(
      wrapper.find('input#user-profile-auto-refresh-interval-input').prop('defaultValue'),
    ).toEqual(REFRESH_INTERVAL_LOWER);

    expect(
      wrapper.find('#user-profile-max-incidents-limit-label').contains('Max Incidents Limit'),
    ).toBeTruthy();
    expect(
      wrapper.find('input#user-profile-max-incidents-limit-input').prop('defaultValue'),
    ).toEqual(MAX_INCIDENTS_LIMIT_LOWER);

    expect(
      wrapper
        .find('#user-profile-auto-accept-incident-query-label')
        .contains('Auto Accept Incident Query'),
    ).toBeTruthy();
    expect(
      wrapper.find('input#user-profile-auto-accept-incident-query-checkbox').prop('checked'),
    ).toEqual(true);

    expect(
      wrapper.find('#update-user-profile-button').contains('Update User Profile'),
    ).toBeTruthy();
  });

  it('should deactivate user profile update button for incorrect refresh interval input', () => {
    baseStore.settings.autoRefreshInterval = REFRESH_INTERVAL_UPPER + 1;
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="user-profile"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');

    expect(
      wrapper
        .find('input#user-profile-auto-refresh-interval-input')
        .hasClass('form-control is-invalid'),
    ).toBeTruthy();
    expect(wrapper.find('button#update-user-profile-button').prop('disabled')).toBeTruthy();
  });

  it('should deactivate user profile update button for incorrect incident limit input', () => {
    baseStore.settings.maxIncidentsLimit = MAX_INCIDENTS_LIMIT_UPPER + 1;
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="user-profile"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');

    expect(
      wrapper
        .find('input#user-profile-max-incidents-limit-input')
        .hasClass('form-control is-invalid'),
    ).toBeTruthy();
    expect(wrapper.find('button#update-user-profile-button').prop('disabled')).toBeTruthy();
  });

  it('should deactivate user profile update button for incorrect rate limit input', () => {
    baseStore.settings.maxRateLimit = MAX_RATE_LIMIT_UPPER + 1;
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="user-profile"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');

    expect(
      wrapper.find('input#user-profile-max-rate-limit-input').hasClass('form-control is-invalid'),
    ).toBeTruthy();
    expect(wrapper.find('button#update-user-profile-button').prop('disabled')).toBeTruthy();
  });

  it('should set autoAcceptIncidentsQuery to true when checked', () => {
    const autoAcceptIncidentsQuery = true;
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="user-profile"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');

    wrapper
      .find('input#user-profile-auto-accept-incident-query-checkbox')
      .simulate('change', { target: { checked: autoAcceptIncidentsQuery } });
    expect(
      wrapper.find('input#user-profile-auto-accept-incident-query-checkbox').prop('checked'),
    ).toEqual(autoAcceptIncidentsQuery);
  });

  it('should display incident table settings', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="incident-table"]';
    const tabElement = wrapper.find(tabSelector);

    // FIXME: Determine correct way to click DOM with Jest - this does not update internal state
    tabElement.simulate('click');
    expect(tabElement.contains('Incident Table')).toBeTruthy();
    expect(wrapper.find('h4').contains('Column Selector')).toBeTruthy();
    expect(wrapper.find('#incident-column-select')).toBeTruthy();
    expect(wrapper.find('h4').contains('Alert Custom Detail Column Definitions')).toBeTruthy();
    expect(wrapper.find('#alert-column-definition-select')).toBeTruthy();
    expect(
      wrapper.find('#update-incident-table-button').contains('Update Incident Table'),
    ).toBeTruthy();
  });

  it('should render an enabled custom column option with unique header name', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="incident-table"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');
    expect(wrapper.find('[value="CustomField:details.to.some.path"]').prop('disabled')).toEqual(
      undefined,
    );
  });

  it('should render a disabled custom column option which has a duplicate header/name', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="incident-table"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');
    expect(wrapper.find('[value="Summary:details.to.some.path"]').prop('disabled')).toEqual(true);
  });

  it('should display local cache settings', () => {
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="local-cache"]';
    const tabElement = wrapper.find(tabSelector);

    // FIXME: Determine correct way to click DOM with Jest - this does not update internal state
    tabElement.simulate('click');
    expect(tabElement.contains('Local Cache')).toBeTruthy();
    expect(wrapper.find('#clear-local-cache-button').contains('Clear Local Cache')).toBeTruthy();
  });

  it('should set darkMode to true when checked', () => {
    const darkMode = true;
    store = mockStore(baseStore);
    const wrapper = componentWrapper(store, SettingsModalComponent);
    const tabSelector = 'a[data-rb-event-key="user-profile"]';
    const tabElement = wrapper.find(tabSelector);
    tabElement.simulate('click');

    wrapper
      .find('input#user-profile-dark-mode-checkbox')
      .simulate('change', { target: { checked: darkMode } });
    expect(wrapper.find('input#user-profile-dark-mode-checkbox').prop('checked')).toEqual(darkMode);
  });
});
