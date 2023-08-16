import {
  faker,
} from '@faker-js/faker';

const generateMockTeam = () => {
  // Generate Faker stubs for team
  const id = faker.string.alphanumeric(7);
  const teamName = faker.person.jobArea();
  return {
    id,
    summary: teamName,
    self: `https://api.pagerduty.com/teams/${id}`,
    html_url: `https://www.pagerduty.com/teams/${id}`,
  };
};

export const generateMockTeams = (num) => Array.from({ length: num }, () => generateMockTeam());

export default generateMockTeams;
