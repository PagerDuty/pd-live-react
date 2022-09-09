import {
  faker,
} from '@faker-js/faker';

const generateMockTeam = () => {
  // Generate Faker stubs for team
  const id = faker.random.alphaNumeric(7);
  const teamName = faker.name.jobArea();
  return {
    id,
    summary: teamName,
    self: `https://api.pagerduty.com/teams/${id}`,
    html_url: `https://www.pagerduty.com/teams/${id}`,
  };
};

export const generateMockTeams = (num) => Array.from({ length: num }, () => generateMockTeam());

export default generateMockTeams;

test.skip('Mock Teams', () => 1);
