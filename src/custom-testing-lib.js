/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Provider,
} from 'react-redux';
import {
  render, queries, within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  act,
} from 'react-dom/test-utils';
import * as customQueries from './custom-queries';

export const componentWrapper = (store, Component) => render(
  <Provider store={store}>
    <Component />
  </Provider>,
);

export const waitForComponentToPaint = async (wrapper) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    wrapper.update();
  });
};

const allQueries = {
  ...queries,
  ...customQueries,
};

const customScreen = within(document.body, allQueries);
const customWithin = (element) => within(element, allQueries);
const customRender = (ui, options) => render(ui, { queries: allQueries, ...options });

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

// override render method
export { customScreen as screen, customWithin as within, customRender as render };
