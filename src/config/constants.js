// Hosts App Constants
export const debugParams = new URLSearchParams(window.location.search);

// Application Details
export const PD_APP_NAME = 'pd-live-react';
export const PD_ENV = import.meta.env.VITE_PD_ENV || 'localhost-dev';

// Authentication
export const PD_OAUTH_CLIENT_ID = import.meta.env.VITE_PD_OAUTH_CLIENT_ID || null;
export const PD_OAUTH_CLIENT_SECRET = import.meta.env.VITE_PD_OAUTH_CLIENT_SECRET || null;
export const PD_SUBDOMAIN_ALLOW_LIST = import.meta.env.VITE_PD_SUBDOMAIN_ALLOW_LIST || '*';
export const PD_USER_TOKEN = import.meta.env.VITE_PD_USER_TOKEN || null;
export const PD_REQUIRED_ABILITY = import.meta.env.VITE_PD_REQUIRED_ABILITY || null;

// Monitoring
export const DD_APPLICATION_ID = import.meta.env.VITE_DD_APPLICATION_ID || null;
export const DD_CLIENT_TOKEN = import.meta.env.VITE_DD_CLIENT_TOKEN || null;
export const DD_SITE = import.meta.env.VITE_DD_SITE || null;
export const DD_SAMPLE_RATE = import.meta.env.VITE_DD_SAMPLE_RATE || null;
export const DD_TRACK_INTERACTIONS = import.meta.env.VITE_DD_TRACK_INTERACTIONS || null;
export const DD_DEFAULT_PRIVACY_LEVEL = import.meta.env.VITE_DD_DEFAULT_PRIVACY_LEVEL || null;

// REST API
export const LOG_ENTRIES_POLLING_INTERVAL_SECONDS = 5;
export const LOG_ENTRIES_CLEARING_INTERVAL_SECONDS = 30;
export const INCIDENTS_PAGINATION_LIMIT = 100;
export const MAX_RATE_LIMIT_LOWER = 100;
export const MAX_RATE_LIMIT_UPPER = 2000;
export const REFRESH_INTERVAL_LOWER = 5;
export const REFRESH_INTERVAL_UPPER = 60;

// Date formatting (Locale Agnostic)
export const DATE_FORMAT = 'LL \\at h:mm:ss A';

// Debug params
export const DEBUG_DISABLE_POLLING = debugParams.get('disable-polling') || false;
export const DEBUG_SINCE_DATE = debugParams.get('since') || null;
export const DEBUG_UNTIL_DATE = debugParams.get('until') || null;

export const EXTRA_BUTTONS = debugParams
  .getAll('button')
  .map((button) => {
    const [label, url, widthOrTab, height] = button.split(',');
    if (!label || !url) {
      return null;
    }
    if (widthOrTab === 'tab') {
      return {
        label,
        url,
        tab: true,
      };
    }
    return {
      label,
      url,
      width: widthOrTab,
      height,
    };
  })
  .filter((button) => !!button);
