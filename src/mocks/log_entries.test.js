import {
  faker,
} from '@faker-js/faker';
import generateMockIncident from './incidents.test';

const generateMockLogEntry = () => {
  const type = faker.helpers.arrayElement(['notify_log_entry', 'acknowledge_log_entry']);
  const summary = faker.lorem.words(20);
  const createdAt = faker.date
    .between({ from: '2020-01-01T00:00:00.000Z', to: '2022-01-01T00:00:00.000Z' })
    .toISOString();
  const agent = { id: faker.string.alphanumeric(7) };
  const channel = { type: 'auto' };
  const service = { id: faker.string.alphanumeric(7) };
  const incident = generateMockIncident();
  const teams = [{ id: faker.string.alphanumeric(7) }];

  return {
    type,
    summary,
    created_at: createdAt,
    channel,
    agent,
    service,
    incident,
    teams,
  };
};

export const generateMockLogEntries = (num) => Array.from({ length: num }, () => generateMockLogEntry());

export default generateMockLogEntries;

test.skip('Mock log entries', () => 1);
