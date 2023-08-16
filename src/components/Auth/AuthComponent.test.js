/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import 'jest-location-mock';

import {
  render, screen, waitForComponentToPaint, fireEvent,
} from 'src/custom-testing-lib';

import 'i18n.js';

import 'mocks/pdoauth';

import AuthComponent from './AuthComponent';

describe('AuthComponent', () => {
  it('should render component correctly', () => {
    waitForComponentToPaint(render(<AuthComponent />));
    expect(screen.getByRole('heading')).toHaveTextContent('Live Incidents Console');
    expect(screen.getByText('Connect using PagerDuty OAuth to use this app')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Sign In');
    fireEvent.click(screen.getByRole('button'));
    expect(window.location.assign).toBeCalled();
    // FIX ME: This assertion doesn't work within Jest for some reason
    // eslint-disable-next-line max-len
    // expect(window.location.href).toContain('https://app.pagerduty.com/global/authn/authentication');
  });
});
