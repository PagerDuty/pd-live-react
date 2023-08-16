import React from 'react';
import {
  shallow,
} from 'enzyme';

import {
  Spinner,
} from 'react-bootstrap';

import 'i18n.js';

import QueryActiveComponent from './QueryActiveComponent';

describe('QueryActiveComponent', () => {
  it('should render component with contents="Querying PagerDuty API"', () => {
    // eslint-disable-next-line react/jsx-filename-extension
    const wrapper = shallow(<QueryActiveComponent />);
    // For some reason we can't access by `div.spinner-border` in shallow render
    expect(wrapper.find(Spinner).getElement(0).props.variant).toEqual('success');
    expect(wrapper.contains('Querying PagerDuty API')).toBeTruthy();
  });
});
