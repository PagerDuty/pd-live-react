/* eslint-disable react/jsx-filename-extension */
import 'jest-location-mock';
import React from 'react';
import {
  mount,
} from 'enzyme';

import {
  Button,
} from 'react-bootstrap';

import 'i18n.js';

import 'mocks/pdoauth';

import {
  waitForComponentToPaint,
} from 'mocks/store.test';

import AuthComponent from './AuthComponent';

describe('AuthComponent', () => {
  it('should render component correctly', () => {
    const wrapper = mount(<AuthComponent />);
    waitForComponentToPaint(wrapper);
    expect(wrapper.find('h1').getElement(0).props.children).toEqual('Live Incidents Console');
    expect(wrapper.find('p').getElement(0).props.children).toEqual(
      'Connect using PagerDuty OAuth to use this app',
    );
    expect(wrapper.find(Button).getElement(0).props.variant).toEqual('primary');
    expect(wrapper.find(Button).getElement(0).props.children).toEqual('Sign In');
  });

  it('should invoke window.location.assign when "Sign In" is clicked', () => {
    const wrapper = mount(<AuthComponent />);
    waitForComponentToPaint(wrapper);
    wrapper.find(Button).simulate('click');
    expect(window.location.assign).toBeCalled();
    // FIX ME: This assertion doesn't work within Jest for some reason
    // eslint-disable-next-line max-len
    // expect(window.location.href).toContain('https://app.pagerduty.com/global/authn/authentication');
  });
});
