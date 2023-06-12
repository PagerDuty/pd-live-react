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
        // alertCustomDetailFields: [
        //   {
        //     label: 'Summary:details.to.some.path',
        //     value: 'Summary:details.to.some.path',
        //     columnType: 'alert',
        //   },
        //   {
        //     label: 'CustomField:details.to.some.path',
        //     value: 'CustomField:details.to.some.path',
        //     columnType: 'alert',
        //   },
        // ],
        darkMode: false,
      },
      // incidentTable: {
      //   incidentTableColumns: [
      //     { Header: '#', accessorPath: null, columnType: 'incident' },
      //     { Header: 'Summary', accessorPath: null, columnType: 'incident' },
      //   ],
      // },
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

  // FIXME: Settings are now elsewhere, so this will need updated

  // it('should display incident table settings', () => {
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, SettingsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="incident-table"]';
  //   const tabElement = wrapper.find(tabSelector);

  //   // FIXME: Determine correct way to click DOM with Jest - this does not update internal state
  //   tabElement.simulate('click');
  //   expect(tabElement.contains('Incident Table')).toBeTruthy();
  //   expect(wrapper.find('h4').contains('Column Selector')).toBeTruthy();
  //   expect(wrapper.find('#incident-column-select')).toBeTruthy();
  //   expect(wrapper.find('h4').contains('Alert Custom Detail Column Definitions')).toBeTruthy();
  //   expect(wrapper.find('#alert-column-definition-select')).toBeTruthy();
  //   expect(
  //     wrapper.find('#update-incident-table-button').contains('Update Incident Table'),
  //   ).toBeTruthy();
  // });

  // it('should render an enabled custom column option with unique header name', () => {
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, SettingsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="incident-table"]';
  //   const tabElement = wrapper.find(tabSelector);
  //   tabElement.simulate('click');
  //   expect(wrapper.find('[value="CustomField:details.to.some.path"]').prop('disabled')).toEqual(
  //     undefined,
  //   );
  // });

  // it('should render a disabled custom column option which has a duplicate header/name', () => {
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, SettingsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="incident-table"]';
  //   const tabElement = wrapper.find(tabSelector);
  //   tabElement.simulate('click');
  //   expect(wrapper.find('[value="Summary:details.to.some.path"]').prop('disabled')).toEqual(true);
  // });

  // it('should display local cache settings', () => {
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, SettingsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="local-cache"]';
  //   const tabElement = wrapper.find(tabSelector);

  //   // FIXME: Determine correct way to click DOM with Jest - this does not update internal state
  //   tabElement.simulate('click');
  //   expect(tabElement.contains('Local Cache')).toBeTruthy();
  //   expect(wrapper.find('#clear-local-cache-button').contains('Clear Local Cache')).toBeTruthy();
  // });

  // it('should set darkMode to true when checked', () => {
  //   const darkMode = true;
  //   store = mockStore(baseStore);
  //   const wrapper = componentWrapper(store, SettingsModalComponent);
  //   const tabSelector = 'a[data-rb-event-key="user-profile"]';
  //   const tabElement = wrapper.find(tabSelector);
  //   tabElement.simulate('click');

  //   wrapper
  //     .find('input#user-profile-dark-mode-checkbox')
  //     .simulate('change', { target: { checked: darkMode } });
  //   expect(wrapper.find('input#user-profile-dark-mode-checkbox').prop('checked')).toEqual(darkMode);
  // });
});
