import {
  Provider,
} from 'react-redux';

import {
  mockStore,
} from 'mocks/store.test';

import {
  generateMockUsers,
} from 'mocks/users.test';

import {
  mount,
} from 'enzyme';

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

  it('should render component with assignee initials', () => {
    const displayedUsers = users.map((user) => ({
      user,
    }));
    const wrapper = mount(
      <Provider store={store}>
        <PersonInitialsComponents displayedUsers={displayedUsers} />
      </Provider>,
    );
    // Initials should be rendered
    expect(wrapper.find('div[role="img"]').contains('AL')).toBeTruthy();
    // Emojis should also be rendered as initials
    expect(wrapper.find('div[role="img"]').contains('G📟')).toBeTruthy();
  });
});
