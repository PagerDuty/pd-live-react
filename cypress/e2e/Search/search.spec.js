/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable cypress/unsafe-to-chain-command */

import {
  acceptDisclaimer,
  waitForIncidentTable,
  // activateButton,
  // priorityNames,
  selectIncident,
} from '../../support/util/common';

describe('Search Incidents', { failFast: { enabled: false } }, () => {
  before(() => {
    acceptDisclaimer();
    waitForIncidentTable();
  });

  beforeEach(() => {
    if (cy.state('test').currentRetry() > 1) {
      acceptDisclaimer();
    }
    waitForIncidentTable();
  });

  it('Search for `Service A1` returns incidents only on Service A1', () => {
    cy.get('#global-search-input').clear().type('Service A1');
    cy.wait(5000);
    cy.get('[data-incident-header="Service"]').each(($el) => {
      cy.wrap($el).should('have.text', 'Service A1');
    });
  });

  it('Search for 2nd selected incident returns exactly 1 incident only', () => {
    const incidentIdx = 1;
    selectIncident(incidentIdx);
    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      cy.get('#global-search-input').clear().type(incidentId);
    });
    cy.wait(1000);
    cy.get('.selected-incidents-badge').then(($el) => {
      const text = $el.text().split(' ')[0];
      expect(text).to.equal('1/1');
    });
  });

  it('Search for `zzzzzz` returns no incidents', () => {
    cy.get('#global-search-input').clear().type('zzzzzz');
    cy.wait(5000);
    cy.get('.empty-incidents-badge').should('be.visible');
  });
});
