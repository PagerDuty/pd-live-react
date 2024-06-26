/* eslint-disable cypress/unsafe-to-chain-command */
import moment from 'moment/min/moment-with-locales';

import gb from 'date-fns/locale/en-GB';
import {
  registerLocale,
} from 'react-datepicker';

import {
  acceptDisclaimer,
  waitForIncidentTable,
  checkIncidentCellContentAllRows,
  checkIncidentCellIconAllRows,
  manageIncidentTableColumns,
  priorityNames,
  selectIncident,
} from '../../support/util/common';

registerLocale('en-GB', gb);
moment.locale('en-GB');

describe('Query Incidents', { failFast: { enabled: true } }, () => {
  beforeEach(() => {
    acceptDisclaimer();
    manageIncidentTableColumns('remove', ['latest_note']);
    manageIncidentTableColumns('add', ['urgency', 'teams', 'escalation_policy']);
    waitForIncidentTable();
  });

  it('Query for incidents within T-1 since date', () => {
    // Limit dataset to high-urgency triggered, ackd and resolved incidents
    // activateButton('query-status-resolved-button');
    // deactivateButton('query-urgency-low-button');
    cy.get('.query-status-resolved-button').check({ force: true });
    cy.get('.query-urgency-low-button').uncheck({ force: true });

    // Update since date to T-1
    const queryDate = moment()
      .subtract(1, 'days')
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    cy.get('#query-date-input').click();
    cy.get('#since-date-input').clear().type(queryDate.format('DD/MM/yyyy')).type('{enter}');
    cy.get('#query-date-submit').click();
    waitForIncidentTable();

    // Iterate through incident table and perform Moment date comparison
    cy.get('.incident-table-fixed-list > div').then(($tbody) => {
      const visibleIncidentCount = $tbody.find('[role="row"]').length;
      for (let incidentIdx = 0; incidentIdx < visibleIncidentCount; incidentIdx++) {
        cy.get(
          `[data-incident-header="Created At"][data-incident-row-cell-idx="${incidentIdx}"]`,
        ).then(($el) => {
          expect(moment($el.text(), 'LL \\at h:mm:ss A').diff(queryDate)).to.be.greaterThan(0);
        });
      }
    });
  });

  it('Query for triggered incidents only', () => {
    cy.get('.query-status-triggered-button').check({ force: true });
    cy.get('.query-status-acknowledged-button').uncheck({ force: true });
    cy.get('.query-status-resolved-button').uncheck({ force: true });
    waitForIncidentTable();
    checkIncidentCellIconAllRows('Status', 'fa-triangle-exclamation');
  });

  it('Query for acknowledged incidents only', () => {
    // Ensure at least one incident is acknowledged for test
    waitForIncidentTable();
    selectIncident(0);
    cy.get('#incident-action-acknowledge-button').click();

    cy.get('.query-status-triggered-button').uncheck({ force: true });
    cy.get('.query-status-acknowledged-button').check({ force: true });
    cy.get('.query-status-resolved-button').uncheck({ force: true });
    waitForIncidentTable();
    checkIncidentCellIconAllRows('Status', 'fa-shield-halved');
  });

  it('Query for resolved incidents only', () => {
    cy.get('.query-status-triggered-button').uncheck({ force: true });
    cy.get('.query-status-acknowledged-button').uncheck({ force: true });
    cy.get('.query-status-resolved-button').check({ force: true });
    waitForIncidentTable();
    checkIncidentCellIconAllRows('Status', 'fa-circle-check');
  });

  it('Query for high urgency incidents only', () => {
    cy.get('.query-urgency-high-button').check({ force: true });
    cy.get('.query-urgency-low-button').uncheck({ force: true });
    waitForIncidentTable();
    checkIncidentCellContentAllRows('Urgency', ' High');
  });

  it('Query for low urgency incidents only', () => {
    cy.get('.query-urgency-high-button').uncheck({ force: true });
    cy.get('.query-urgency-low-button').check({ force: true });
    waitForIncidentTable();
    checkIncidentCellContentAllRows('Urgency', ' Low');
  });

  priorityNames.forEach((currentPriority) => {
    it(`Query for priority "${currentPriority}" incidents only`, () => {
      cy.get(`.query-priority-${currentPriority}-button`).check({ force: true });
      const excludedPriorities = priorityNames.filter((priority) => currentPriority !== priority);
      excludedPriorities.forEach((excludedPriority) => {
        cy.get(`.query-priority-${excludedPriority}-button`).uncheck({ force: true });
      });
      waitForIncidentTable();
      checkIncidentCellContentAllRows('Priority', currentPriority);
      cy.get(`.query-priority-${currentPriority}-button`).uncheck({ force: true });
    });
  });

  const teams = ['Team A', 'Team B'];
  teams.forEach((team) => {
    it(`Query for incidents on ${team} only`, () => {
      cy.get('#query-team-select').click().type(`${team}`);
      cy.get('div[role="button"]').contains(team).should('exist').click();
      waitForIncidentTable();
      checkIncidentCellContentAllRows('Teams', team);
      cy.get('#query-team-select').click().type('{del}');
    });
  });

  const escalationPolicies = ['Team A (EP)', 'Team B (EP)'];
  escalationPolicies.forEach((escalationPolicy) => {
    it(`Query for incidents on ${escalationPolicy} only`, () => {
      cy.get('#query-escalation-policy-select').click().type(`${escalationPolicy}`);
      cy.get('div[role="button"]').contains(escalationPolicy).should('exist').click();
      waitForIncidentTable();
      checkIncidentCellContentAllRows('Escalation Policy', escalationPolicy);
      cy.get('#query-escalation-policy-select').click().type('{del}');
    });
  });

  const services = ['Service A1', 'Service B2'];
  services.forEach((service) => {
    it(`Query for incidents on ${service} only`, () => {
      cy.get('#query-service-select').click().type(`${service}`);
      cy.get('div[role="button"]').contains(service).should('exist').click();
      waitForIncidentTable();
      checkIncidentCellContentAllRows('Service', service);
      cy.get('#query-service-select').click().type('{del}');
    });
  });

  it('Query for incidents on Team A and Service A1 only', () => {
    cy.get('#query-team-select').click().type('Team A');
    cy.get('div[role="button"]').contains('Team A').should('exist').click();
    cy.get('#query-service-select').click().type('Service A1');
    cy.get('div[role="button"]').contains('Service A1').should('exist').click();

    waitForIncidentTable();
    checkIncidentCellContentAllRows('Service', 'Service A1');
    checkIncidentCellContentAllRows('Teams', 'Team A');

    cy.get('#query-team-select').click().type('{del}');
    cy.get('#query-service-select').click().type('{del}');
  });

  it('Query for incidents on Team A (EP) and Service A1 only', () => {
    cy.get('#query-escalation-policy-select').click().type('Team A (EP)');
    cy.get('div[role="button"]').contains('Team A (EP)').should('exist').click();
    cy.get('#query-service-select').click().type('Service A1');
    cy.get('div[role="button"]').contains('Service A1').should('exist').click();

    waitForIncidentTable();
    checkIncidentCellContentAllRows('Service', 'Service A1');
    checkIncidentCellContentAllRows('Escalation Policy', 'Team A (EP)');

    cy.get('#query-escalation-policy-select').click().type('{del}');
    cy.get('#query-service-select').click().type('{del}');
  });

  // TODO: Do this functionality and test in a way that makes sense
  xit('Query on Team A only allows further querying for associated services and users', () => {
    cy.get('#query-team-select').click().type('Team A{enter}');
    waitForIncidentTable();

    cy.get('#query-service-select').click();
    cy.get('body').then((body) => {
      ['Service A1', 'Service A2'].forEach((service) => {
        expect(body.find(`[class*="-option"]:contains("${service}")`).length).to.equal(1);
      });
    });

    cy.get('#query-user-select').click();
    cy.get('body').then((body) => {
      ['User A1', 'User A2', 'User A3'].forEach((user) => {
        expect(body.find(`[class*="-option"]:contains("${user}")`).length).to.equal(1);
      });
    });

    cy.get('#query-team-select').click().type('{del}');
  });

  it('Query for incidents assigned to User A1, A2, or A3', () => {
    ['User A1', 'User A2', 'User A3'].forEach((user) => {
      cy.get('#query-user-select').click().type(user);
      cy.get('div[role="button"]').contains(user).should('exist').click();
    });

    waitForIncidentTable();
    checkIncidentCellContentAllRows('Assignees', 'UA');

    cy.get('#query-user-select').click().type('{del}{del}{del}');
  });

  it('Sort incident columns', () => {
    cy.get('[data-column-name="#"]')
      .click()
      .then(($el) => {
        const cls = $el.attr('class');
        expect(cls).to.contain('th-sorted');
        cy.wrap($el).contains('# ▲');
      });

    cy.get('[data-column-name="#"]')
      .click()
      .then(($el) => {
        const cls = $el.attr('class');
        expect(cls).to.contain('th-sorted');
        cy.wrap($el).contains('# ▼');
      });

    cy.get('[data-column-name="#"]')
      .click()
      .then(($el) => {
        const cls = $el.attr('class');
        expect(cls).to.contain('th');
        cy.wrap($el).contains('#');
      });
  });
});
