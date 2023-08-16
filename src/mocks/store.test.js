/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Provider,
} from 'react-redux';
import configureStore from 'redux-mock-store';
import {
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  act,
} from 'react-dom/test-utils';

export const mockStore = configureStore([]);

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

// Ref: https://stackoverflow.com/a/59864054/6480733 - required for test mocking
test.skip('Helper store specific for testing', () => 1);
