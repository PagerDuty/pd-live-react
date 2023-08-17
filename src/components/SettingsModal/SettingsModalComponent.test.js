import {
  componentWrapper, screen,
} from 'src/custom-testing-lib';

import {
  mockStore,
} from 'mocks/store.test';

import {
  MAX_RATE_LIMIT_LOWER,
} from 'src/config/constants';

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
        searchAllCustomDetails: true,
        respondersInEpFilter: true,
        relativeDates: true,
      },
      users: {
        currentUserLocale: 'en-GB',
      },
    };
    store = mockStore(baseStore);
    componentWrapper(store, SettingsModalComponent);
  });

  it('should render modal', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Settings');
  });

  it('should display user profile settings', () => {
    expect(screen.getByLabelText('Locale')).toHaveValue('en-GB');
    expect(screen.getByLabelText('Default Since Date Lookback')).toHaveValue('1 Day');
    expect(screen.getByLabelText('Max Rate Limit').getAttribute('aria-valuenow')).toEqual(
      MAX_RATE_LIMIT_LOWER.toString(),
    );
    expect(screen.getByLabelText('Global Search')).toBeChecked();
    expect(screen.getByLabelText('Filters')).toBeChecked();
    expect(screen.getByLabelText('Relative Dates')).toBeChecked();
  });
});
