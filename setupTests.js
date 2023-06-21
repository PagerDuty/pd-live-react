/* eslint-disable import/no-extraneous-dependencies */
import {
  configure,
} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import replaceAllInserter from 'string.prototype.replaceall';

configure({ adapter: new Adapter() });
replaceAllInserter.shim();

// https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
const { ResizeObserver } = window;

beforeEach(() => {
  delete window.ResizeObserver;
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
});

afterEach(() => {
  window.ResizeObserver = ResizeObserver;
  jest.restoreAllMocks();
});
