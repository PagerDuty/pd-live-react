import {
  faker,
} from '@faker-js/faker';

import {
  HIGH, INCIDENT_STATES,
} from 'src/util/incidents';

const generateMockAlert = () => {
  // Generate Faker stubs for alert
  const title = faker.lorem.words(20);
  const alertKey = faker.string.alphanumeric(32);
  const alertId = faker.string.alphanumeric(14);
  const createdAt = faker.date
    .between({ from: '2020-01-01T00:00:00.000Z', to: '2022-01-01T00:00:00.000Z' })
    .toISOString();
  const severity = faker.helpers.arrayElement(['info', 'warning', 'error', 'critical']);
  const ipv4 = faker.internet.ipv4();
  const jobType = faker.person.jobType();
  const component = faker.lorem.word();
  const quote = faker.commerce.productDescription();
  const message = faker.commerce.productDescription();
  const uuid = faker.string.uuid();
  const link = faker.internet.url();
  const customDetails = {
    quote,
    'some obscure field': uuid,
    link,
    object_details: {
      key1: 'value1',
    },
  };
  return {
    type: 'alert',
    id: alertId,
    alert_key: alertKey,
    summary: title,
    created_at: createdAt,
    body: {
      contexts: [],
      // custom details are in both body.cef_details.details and body.details for events
      // but only body.details is guaranteed to exist, and won't be null
      // body.cef_details.details can be null if the alert is from an email
      details: customDetails,
      cef_details: {
        contexts: [],
        dedup_key: alertId,
        description: title,
        details: customDetails,
        event_class: jobType,
        message,
        mutations: [
          {
            action_type: 'priority',
            source: {
              id: 'PABCXYZ/service',
              node_id: null,
              type: 'orchestration',
            },
            type: 'event_rule_engine_action',
            value: 'PABCXYZ',
          },
        ],
        service_group: jobType,
        severity,
        source_component: component,
        source_origin: ipv4,
        version: '1.0',
      },
      type: 'alert_body',
    },
  };
};

export const generateMockAlerts = (num) => Array.from({ length: num }, () => generateMockAlert());

const generateMockNote = () => {
  // Generate Faker stubs for note
  const noteId = faker.string.alphanumeric(14);
  const content = faker.lorem.words(20);
  const userName = faker.person.fullName();
  const userId = faker.string.alphanumeric(7);
  const createdAt = faker.date
    .between({ from: '2020-01-01T00:00:00.000Z', to: '2022-01-01T00:00:00.000Z' })
    .toISOString();
  return {
    id: noteId,
    user: {
      id: userId,
      type: 'user_reference',
      summary: userName,
      self: `https://api.pagerduty.com/users/${userId}`,
      html_url: `https://www.pagerduty.com/users/${userId}`,
    },
    content,
    created_at: createdAt,
    channel: {
      summary: 'The PagerDuty website or APIs',
    },
  };
};

export const generateMockNotes = (num) => Array.from({ length: num }, () => generateMockNote());

export const generateMockIncident = () => {
  // Generate Faker stubs for incident (slimmed down)
  const incidentNumber = Number(faker.string.numeric(5));
  const title = faker.lorem.words(20);
  const status = INCIDENT_STATES[Math.floor(Math.random() * INCIDENT_STATES.length)];
  const incidentKey = faker.string.alphanumeric(32);
  const incidentId = faker.string.alphanumeric(14);
  const logEntryId = faker.string.alphanumeric(14);
  const escalationPolicyId = faker.string.alphanumeric(7);
  const serviceId = faker.string.alphanumeric(7);
  const createdAt = faker.date
    .between({ from: '2020-01-01T00:00:00.000Z', to: '2022-01-01T00:00:00.000Z' })
    .toISOString();
  return {
    incident_number: incidentNumber,
    title,
    description: title,
    created_at: createdAt,
    status,
    incident_key: incidentKey,
    urgency: HIGH,
    id: incidentId,
    type: 'incident',
    summary: title,
    escalation_policy: {
      id: escalationPolicyId,
    },
    service: {
      id: serviceId,
    },
    alerts: generateMockAlerts(5),
    notes: generateMockNotes(5),
    first_trigger_log_entry: {
      // FIXME: This is only for a web_trigger, would not be present for alert triggered incident
      id: logEntryId,
      type: 'trigger_log_entry',
      summary: 'Triggered through the website.',
      created_at: createdAt,
      agent: {},
      channel: {
        type: 'web_trigger',
        summary: title,
        subject: title,
        details: 'Here is the description;\n\ntest1234.example.com\n\ntest5678.example.com',
      },
      service: { id: serviceId },
      incident: {
        id: incidentId,
        type: 'incident_reference',
        summary: title,
      },
      teams: [],
      contexts: [],
      event_details: { description: title },
    },
  };
};

// eslint-disable-next-line max-len
export const generateMockIncidents = (num) => Array.from({ length: num }, () => generateMockIncident());

export default generateMockIncidents;
