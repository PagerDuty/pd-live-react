/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Provider,
} from 'react-redux';

import {
  waitFor,
} from '@testing-library/react';

import {
  render, screen,
} from 'src/custom-testing-lib';

import {
  mockStore,
} from 'mocks/store.test';

import {
  generateMockUsers,
} from 'mocks/users.test';

import PersonInitialsComponents from './PersonInitialsComponents';

describe('PersonInitialsComponents', () => {
  const users = generateMockUsers(2);
  users[0].summary = 'Abraham Lincoln';
  users[1].summary = 'George Washington 📟';
  let baseStore;
  let store;
  beforeEach(() => {
    const usersMap = {};
    users.forEach((user) => {
      usersMap[user.id] = user;
    });
    baseStore = {
      users: {
        usersMap,
      },
    };
    store = mockStore(baseStore);
    global.CSS = jest.fn();
  });

  it('should render component with assignee initials', async () => {
    const displayedUsers = users.map((user) => ({
      user,
    }));
    render(
      <Provider store={store}>
        <PersonInitialsComponents displayedUsers={displayedUsers} />
      </Provider>,
    );
    // Initials should be rendered
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Abraham Lincoln' })).toHaveTextContent('AL');
      expect(screen.getByRole('img', { name: 'George Washington 📟' })).toHaveTextContent('G📟');
    });
  });
});
