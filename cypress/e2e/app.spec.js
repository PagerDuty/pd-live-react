import moment from 'moment';

import {
  acceptDisclaimer, waitForIncidentTable, pd,
} from '../support/util/common';

import packageConfig from '../../package.json';

describe('Integration User Token', { failFast: { enabled: false } }, () => {
  before(() => {
    expect(Cypress.env('PD_USER_TOKEN')).to.be.a('string');
    cy.intercept('GET', 'https://api.pagerduty.com/users/me').as('getCurrentUser');
  });

  it('Valid integration user token present', () => {
    pd.get('users/me')
      .then(({
        data,
      }) => {
        // eslint-disable-next-line no-unused-expressions
        expect(data).to.exist;
      })
      .catch((err) => {
        // Terminate Cypress tests if invalid token detected
        expect(err.status).to.equal(200);
      });
    cy.wait('@getCurrentUser', { timeout: 10000 });
  });
});

describe('PagerDuty Live', () => {
  before(() => {
    acceptDisclaimer();
    waitForIncidentTable();
  });

  beforeEach(() => {
    if (cy.state('test').currentRetry() > 1) {
      acceptDisclaimer();
      waitForIncidentTable();
    }
  });

  it('Renders the main application page', () => {
    cy.get('#navbar-ctr').contains('Live Incidents Console');
  });

  it('Renders the correct version from package.json', () => {
    cy.get('.settings-panel-dropdown').click();
    cy.get('.version-info').should('be.visible');
    cy.get('.version-info').contains(`Version: ${packageConfig.version}`);
  });

  it('Application indicates when the required ability is available on the account', () => {
    cy.get('.status-beacon-ctr').realHover();
    cy.get('[data-popper-placement="bottom"]').should('be.visible');
    cy.get('[data-popper-placement="bottom"]').contains('Connected', { timeout: 30000 });
  });

  it('Application indicates when the required ability is missing/disabled on the account', () => {
    // Intercept call to PagerDuty API with mock fixture
    cy.intercept('https://api.pagerduty.com/abilities*', {
      abilities: ['teams', 'read_only_users', 'service_support_hours', 'urgencies'],
    }).as('getAbilities');
    cy.visit('http://localhost:3000/pd-live-react');
    acceptDisclaimer();
    cy.wait('@getAbilities', { timeout: 30000 });

    // The mock response will render an error in the application
    cy.get('.status-beacon-ctr').realHover();
    cy.get('[data-popper-placement="bottom"]').should('be.visible');
    cy.get('[data-popper-placement="bottom"]').contains(
      'Current subdomain does not have the correct ability to use PagerDuty Live',
    );
  });

  it('Application indicates when polling is disabled through url parameter disable-polling', () => {
    cy.visit('http://localhost:3000/pd-live-react/?disable-polling=true');

    cy.get('.modal-title', { timeout: 30000 }).contains('Disclaimer & License');
    cy.get('#disclaimer-agree-checkbox').click({ force: true });
    cy.get('#disclaimer-accept-button').click({ force: true });

    cy.get('.status-beacon-ctr').realHover();
    cy.get('[data-popper-placement="bottom"]').should('be.visible');
    cy.get('[data-popper-placement="bottom"]').contains('Live updates disabled');
  });

  it('Application correctly uses url parameters since & until to query PD API', () => {
    const since = moment()
      .subtract(1, 'days')
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toISOString();
    const until = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
    cy.visit(
      `http://localhost:3000/pd-live-react/?disable-polling=true&since=${since}&until=${until}`,
    );

    cy.get('.modal-title', { timeout: 30000 }).contains('Disclaimer & License');
    cy.get('#disclaimer-agree-checkbox').click({ force: true });
    cy.get('#disclaimer-accept-button').click({ force: true });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.requestsCountByUrl(
      [
        'https://api.pagerduty.com/incidents',
        '?limit=100&total=true&offset=0',
        `&since=${since}&until=${until}`,
        '&include[]=first_trigger_log_entries&include[]=external_references',
        '&sort_by=created_at:desc&statuses[]=triggered&statuses[]=acknowledged',
        '&urgencies[]=high&urgencies[]=low',
      ].join(''),
    ).should('eq', 1);
  });
});
