import {
  faker,
} from '@faker-js/faker';

const generateMockService = () => {
  // Generate Faker stubs for service
  const id = faker.string.alphanumeric(7);
  const serviceName = faker.commerce.product();
  return {
    id,
    summary: serviceName,
    self: `https://api.pagerduty.com/services/${id}`,
    html_url: `https://www.pagerduty.com/services/${id}`,
  };
};

export const generateMockServices = (num) => Array.from({ length: num }, () => generateMockService());

export default generateMockServices;
