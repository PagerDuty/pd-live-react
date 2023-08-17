import React from 'react';
import {
  render, screen,
} from 'src/custom-testing-lib';

import 'i18n.js';

import QueryActiveComponent from './QueryActiveComponent';

describe('QueryActiveComponent', () => {
  it('should render component with contents="Querying PagerDuty API"', () => {
    // eslint-disable-next-line react/jsx-filename-extension
    render(<QueryActiveComponent />);
    expect(screen.getByText('Querying PagerDuty API')).toBeInTheDocument();
  });
});
