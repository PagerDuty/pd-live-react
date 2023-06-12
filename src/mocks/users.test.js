import {
  faker,
} from '@faker-js/faker';

const generateMockUser = () => {
  // Generate Faker stubs for user
  const id = faker.string.alphanumeric(7);
  const userName = faker.person.fullName();
  return {
    id,
    summary: userName,
    self: `https://api.pagerduty.com/users/${id}`,
    html_url: `https://www.pagerduty.com/users/${id}`,
  };
};

export const generateMockUsers = (num) => Array.from({ length: num }, () => generateMockUser());

export default generateMockUsers;

test.skip('Mock Users', () => 1);
