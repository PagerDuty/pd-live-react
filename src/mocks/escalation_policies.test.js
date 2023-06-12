import {
  faker,
} from '@faker-js/faker';

const generateMockEscalationPolicy = () => {
  // Generate Faker stubs for escalation policy
  const id = faker.string.alphanumeric(7);
  const escalationPolicyName = faker.person.jobArea();
  return {
    id,
    summary: escalationPolicyName,
    self: `https://api.pagerduty.com/escalation_policies/${id}`,
    html_url: `https://www.pagerduty.com/escalation_policies/${id}`,
  };
};

export const generateMockEscalationPolicies = (num) => Array.from({ length: num }, () => generateMockEscalationPolicy());

export default generateMockEscalationPolicies;

test.skip('Mock Teams', () => 1);
