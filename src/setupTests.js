/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import replaceAllInserter from 'string.prototype.replaceall';

replaceAllInserter.shim();

// https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
const {
  ResizeObserver,
} = window;

// Just mock the constants, rather than have to deal with jest not liking import.meta.env
// https://stackoverflow.com/a/74882007
jest.mock('src/config/constants', () => ({
  VITE_PD_ENV: 'localhost-dev',
  PD_OAUTH_CLIENT_ID: null,
  PD_OAUTH_CLIENT_SECRET: null,
  PD_SUBDOMAIN_ALLOW_LIST: null,
  PD_USER_TOKEN: null,
  PD_REQUIRED_ABILITY: null,
  DD_APPLICATION_ID: null,
  DD_CLIENT_TOKEN: null,
  DD_SITE: null,
  DD_SAMPLE_RATE: null,
  DD_TRACK_INTERACTIONS: null,
  DD_DEFAULT_PRIVACY_LEVEL: null,
  LOG_ENTRIES_POLLING_INTERVAL_SECONDS: 5,
  LOG_ENTRIES_CLEARING_INTERVAL_SECONDS: 30,
  INCIDENTS_PAGINATION_LIMIT: 100,
  MAX_RATE_LIMIT_LOWER: 100,
  MAX_RATE_LIMIT_UPPER: 2000,
  REFRESH_INTERVAL_LOWER: 5,
  REFRESH_INTERVAL_UPPER: 60,
  DATE_FORMAT: 'LL \\at h:mm:ss A',
  DEBUG_DISABLE_POLLING: false,
  DEBUG_SINCE_DATE: null,
  DEBUG_UNTIL_DATE: null,
  EXTRA_BUTTONS: null,
}));

beforeEach(() => {
  delete window.ResizeObserver;
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

afterEach(() => {
  window.ResizeObserver = ResizeObserver;
  jest.restoreAllMocks();
});
