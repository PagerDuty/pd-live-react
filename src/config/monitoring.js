/* eslint-disable class-methods-use-this */
import {
  datadogRum,
} from '@datadog/browser-rum';

import {
  PD_APP_NAME,
  PD_ENV,
  DD_APPLICATION_ID,
  DD_CLIENT_TOKEN,
  DD_SITE,
  DD_SAMPLE_RATE,
  DD_TRACK_INTERACTIONS,
  DD_DEFAULT_PRIVACY_LEVEL,
} from './constants';

import PD_APP_VERSION from './version';

class RealUserMonitoring {
  static init() {
    datadogRum.init({
      applicationId: DD_APPLICATION_ID,
      clientToken: DD_CLIENT_TOKEN,
      site: DD_SITE,
      service: PD_APP_NAME,
      version: PD_APP_VERSION,
      env: PD_ENV,
      sampleRate: parseInt(DD_SAMPLE_RATE, 10),
      trackInteractions: JSON.parse(DD_TRACK_INTERACTIONS),
      defaultPrivacyLevel: DD_DEFAULT_PRIVACY_LEVEL,
    });
  }

  static setUser(currentUser, subdomain) {
    datadogRum.setUser({
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      subdomain,
    });
  }

  static trackAction(actionName, actionData) {
    datadogRum.addAction(actionName, actionData);
  }

  static trackError(errorName, errorData) {
    datadogRum.addError(errorName, errorData);
  }

  static start() {
    datadogRum.startSessionReplayRecording();
  }

  static stop() {
    datadogRum.stopSessionReplayRecording();
  }
}

export default RealUserMonitoring;
