import {
  acceptDisclaimer,
  waitForIncidentTable,
  selectIncident,
  escalate,
  reassign,
  addResponders,
  addNote,
  checkActionAlertsModalContent,
  checkIncidentCellContent,
  deactivateButtonIfActive,
  getIncident,
} from '../../support/util/common';

describe('Manage Open Incidents', () => {
  // We use beforeEach as each test will reload/clear the session
  beforeEach(() => {
    acceptDisclaimer();
    waitForIncidentTable();
    cy.intercept('GET', 'https://api.pagerduty.com/incidents/*').as('getIncident');
  });

  // it('Acknowledge singular incident', () => {
  //   selectIncident(0);
  //   cy.get('#incident-action-acknowledge-button').click();
  //   checkActionAlertsModalContent('have been acknowledged');
  // });

  // it('Add note to singular incident', () => {
  //   const note = 'All your base are belong to us';
  //   const incidentIdx = 0;

  //   selectIncident(incidentIdx);
  //   addNote(note);

  //   checkActionAlertsModalContent('have been updated with a note');
  //   checkIncidentCellContent('Latest Note', incidentIdx, note);
  // });

  // it('Add a very long note to singular incident which overflows', () => {
  //   const note = 'This note is so long that I gave up writing a novel and decided to quit!';
  //   const incidentIdx = 1;

  //   selectIncident(incidentIdx);
  //   addNote(note);

  //   checkActionAlertsModalContent('have been updated with a note');
  //   checkIncidentCellContent('Latest Note', incidentIdx, note);
  // });

  // it('Escalate singular incident to multiple levels', () => {
  //   // Ensure that only high urgency incidents are visible
  //   deactivateButtonIfActive('query-urgency-low-button');
  //   waitForIncidentTable();

  //   // Assumed environment has 3 levels on escalation policy
  //   for (let escalationLevel = 1; escalationLevel < 4; escalationLevel++) {
  //     selectIncident(0);
  //     escalate(escalationLevel);
  //     checkActionAlertsModalContent(`have been manually escalated to level ${escalationLevel}`);
  //   }
  // });

  // it('Reassign singular incident to User A1', () => {
  //   const assignment = 'User A1';
  //   selectIncident(0);
  //   reassign(assignment);
  //   checkActionAlertsModalContent(`have been reassigned to ${assignment}`);
  // });

  // it('Reassign singular incident to Team A', () => {
  //   const assignment = 'Team A';
  //   selectIncident(1);
  //   reassign(assignment);
  //   checkActionAlertsModalContent(`have been reassigned to ${assignment}`);
  // });

  it('Add responder (User A1) to singular incident', () => {
    const responders = ['User A1'];
    const message = 'Need help with this incident';
    selectIncident(0);

    cy.window().then((win) => {
      const incidentId = win.sessionStorage.getItem('incidentId');
      cy.wrap(incidentId).should('exist');
      getIncident(incidentId);
      cy.wait('@getIncident', { timeout: 10000 });
    });

    cy.window().then((win) => {
      const incident = win.sessionStorage.getItem('incident');
      cy.wrap(incident).should('exist');
      console.log('incident data', incident);
    });

    // addResponders(responders, message);
    // checkActionAlertsModalContent('Requested additional response for incident(s)');
  });
});
