/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable cypress/unsafe-to-chain-command */

import {
  acceptDisclaimer,
  waitForIncidentTable,
  addNote,
  checkActionAlertsModalContent,
  selectIncident,
  selectAllIncidents,
  updateFuzzySearch,
} from '../../support/util/common';

describe('Search Incidents', { failFast: { enabled: true } }, () => {
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
    cy.get('[data-incident-header="Service"]').each(($el) => {
      cy.wrap($el).should('have.text', 'Service A1');
    });
    cy.get('#global-search-input').clear();
  });

  it('Search for 2nd selected incident returns exactly 1 incident only', () => {
    const incidentIdx = 1;
    selectIncident(incidentIdx);
    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      cy.get('#global-search-input').clear().type(incidentId);
    });
    cy.get('.selected-incidents-badge').then(($el) => {
      const text = $el.text().split(' ')[0];
      expect(text).to.equal('1/1');
    });
    // Click the select all checkbox twice to unselect all
    cy.get('#global-search-input').clear();
    selectAllIncidents();
    selectAllIncidents();
  });

  it('Search for `zzzzzz` returns no incidents', () => {
    cy.get('#global-search-input').clear().type('zzzzzz');
    cy.get('.empty-incidents-badge').should('be.visible');
    cy.get('#global-search-input').clear();
  });

  it('Fuzzy search disabled returns incident with note exact match', () => {
    const incidentIdx = 0;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then(() => {
      addNote('foobar');
      checkActionAlertsModalContent('have been updated with a note');
      selectIncident(incidentIdx);
      cy.get('#global-search-input').clear().type('foobar');
      cy.get('[data-incident-header="Latest Note"]').each(($el) => {
        // cy.wrap($el).should('have.text', 'foobar');
        cy.wrap($el)
          .find('*')
          .should((subElements) => {
            const elementWithFoobar = subElements
              .toArray()
              .find((el) => el.textContent.includes('foobar'));
            assert.isNotNull(
              elementWithFoobar,
              'Expected to find a subelement containing "foobar"',
            );
          });
      });
    });
    cy.get('#global-search-input').clear();
  });

  it('Fuzzy search disabled does not return incident with note fuzzy match', () => {
    cy.get('#global-search-input').clear().type('foobaz');
    cy.get('.empty-incidents-badge').should('be.visible');
    cy.get('#global-search-input').clear();
  });

  it('Fuzzy search enabled returns incident with note fuzzy match', () => {
    updateFuzzySearch(true);
    const incidentIdx = 0;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then(() => {
      cy.get('#global-search-input').clear().type('foobaz');
      cy.get('[data-incident-header="Latest Note"]').each(($el) => {
        cy.wrap($el)
          .find('*')
          .should((subElements) => {
            const elementWithFoobar = subElements
              .toArray()
              .find((el) => el.textContent.includes('foobar'));
            assert.isNotNull(
              elementWithFoobar,
              'Expected to find a subelement containing "foobar"',
            );
          });
      });
    });
    cy.get('#global-search-input').clear();
  });

  it('Column filtering on Service column for `A1` returns incidents only on Service A1', () => {
    cy.get('#service-filter-icon').realHover();
    cy.get('input[placeholder="Filter"]').filter(':visible').click().type('A1');
    cy.get('[data-incident-header="Service"]').each(($el) => {
      cy.wrap($el).should('have.text', 'Service A1');
    });
    cy.get('#service-filter-icon').realHover();
    cy.get('button[aria-label="Clear Filter"]').filter(':visible').click();
  });
});
