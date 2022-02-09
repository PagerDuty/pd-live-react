import {
  acceptDisclaimer,
  waitForIncidentTable,
  selectIncident,
  addNote,
  checkActionAlertsModalContent,
  checkIncidentCellContent,
  deactivateButtonIfActive,
} from '../../support/util/common';

describe('Manage Open Incidents', () => {
  // We use beforeEach as each test will reload/clear the session
  beforeEach(() => {
    acceptDisclaimer();
    waitForIncidentTable();
  });

  it('Acknowledge singular incident', () => {
    selectIncident(0);
    cy.get('#incident-action-acknowledge-button').click();
    checkActionAlertsModalContent('have been acknowledged');
  });

  it('Add note to singular incident', () => {
    const note = 'All your base are belong to us';
    const incidentIdx = 0;

    selectIncident(incidentIdx);
    addNote(note);

    checkActionAlertsModalContent('have been updated with a note');
    checkIncidentCellContent('Latest Note', incidentIdx, note);
  });

  it('Add a very long note to singular incident which overflows', () => {
    const note = 'This note is so long that I gave up writing a novel and decided to quit!';
    const incidentIdx = 1;

    selectIncident(incidentIdx);
    addNote(note);

    checkActionAlertsModalContent('have been updated with a note');
    checkIncidentCellContent('Latest Note', incidentIdx, note);
  });

  it('Escalate singular incident to multiple levels', () => {
    // Ensure that only high urgency incidents are visible
    deactivateButtonIfActive('query-urgency-low-button');
    waitForIncidentTable();

    // Assumed environment has 3 levels on escalation policy
    for (let escalationLevel = 1; escalationLevel < 4; escalationLevel++) {
      selectIncident(0);
      cy.get('#incident-action-escalate-button').click();
      cy.get(`#escalation-level-${escalationLevel}-button`).click();
      checkActionAlertsModalContent(`have been manually escalated to level ${escalationLevel}`);
    }
  });
});
