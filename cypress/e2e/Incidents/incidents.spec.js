/* eslint-disable no-underscore-dangle */
import {
  acceptDisclaimer,
  waitForIncidentTable,
  selectIncident,
  selectAllIncidents,
  escalate,
  reassign,
  addResponders,
  snooze,
  snoozeCustom,
  merge,
  updatePriority,
  addNote,
  runAction,
  runExternalSystemSync,
  runResponsePlay,
  checkActionAlertsModalContent,
  checkIncidentCellContent,
  checkNoIncidentsSelected,
  checkIncidentCellContentHasLink,
  priorityNames,
} from '../../support/util/common';

describe('Manage Open Incidents', { failFast: { enabled: false } }, () => {
  before(() => {
    acceptDisclaimer();
    // priorityNames.forEach((currentPriority) => {
    //   activateButton(`query-priority-${currentPriority}-button`);
    // });
    waitForIncidentTable();
  });

  // We use beforeEach as each test will reload/clear the session
  beforeEach(() => {
    // Handle failing tests by clearing cache
    if (cy.state('test').currentRetry() > 1) {
      acceptDisclaimer();
    }
    // priorityNames.forEach((currentPriority) => {
    //   activateButton(`query-priority-${currentPriority}-button`);
    // });
    waitForIncidentTable();
  });

  afterEach(() => {
    checkNoIncidentsSelected();
  });

  it('Select all incidents', () => {
    selectAllIncidents();
    cy.get('.selected-incidents-badge').then(($el) => {
      const text = $el.text();
      const incidentNumbers = text.split(' ')[0].split('/');
      expect(incidentNumbers[0]).to.equal(incidentNumbers[1]);
    });
    // Unselect all incidents for the next run
    selectAllIncidents();
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

    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      addNote(note);
      checkActionAlertsModalContent('have been updated with a note');
      checkIncidentCellContent(incidentId, 'Latest Note', note);
    });
  });

  it('Add a very long note to singular incident which overflows', () => {
    const note = 'This note is so long that I gave up writing a novel and decided to quit!';
    const incidentIdx = 1;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      addNote(note);
      checkActionAlertsModalContent('have been updated with a note');
      checkIncidentCellContent(incidentId, 'Latest Note', note);
    });
  });

  it('Add note with URL to singular incident', () => {
    const note = 'This note has a URL example.com included';
    const incidentIdx = 2;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      addNote(note);
      checkActionAlertsModalContent('have been updated with a note');
      checkIncidentCellContent(incidentId, 'Latest Note', note);
      checkIncidentCellContentHasLink(incidentId, 'Latest Note', 'example.com');
    });
  });

  // Assumed environment has 3 levels on escalation policy
  for (let escalationLevel = 1; escalationLevel < 4; escalationLevel++) {
    it(`Escalate singular incident to level: ${escalationLevel}`, () => {
      // Ensure that only high urgency incidents are visible
      // deactivateButton('query-urgency-low-button');
      cy.get('.query-urgency-low-button').uncheck({ force: true });
      waitForIncidentTable();
      selectIncident(0);
      escalate(escalationLevel);
      checkActionAlertsModalContent(`have been manually escalated to level ${escalationLevel}`);
    });
  }

  it('Reassign singular incident to User A1', () => {
    // activateButton('query-urgency-low-button'); // bring back low urgency incidents
    cy.get('.query-urgency-low-button').check({ force: true });
    const assignment = 'User A1';
    selectIncident(0);
    reassign(assignment);
    checkActionAlertsModalContent(`have been reassigned to ${assignment}`);
  });

  it('Reassign singular incident to Team A', () => {
    const assignment = 'Team A';
    selectIncident(1);
    reassign(assignment);
    checkActionAlertsModalContent(`have been reassigned to ${assignment}`);
  });

  it('Add responder (User A1) to singular incident', () => {
    const responders = ['User A1'];
    const message = 'Need help with this incident';
    selectIncident(0);
    addResponders(responders, message);
    checkActionAlertsModalContent('Requested additional response for incident(s)');
  });

  it('Add responder (Team A) to singular incident', () => {
    const responders = ['Team A'];
    const message = 'Need help with this incident';
    selectIncident(0);
    addResponders(responders, message);
    checkActionAlertsModalContent('Requested additional response for incident(s)');
  });

  it('Add multiple responders (Team A + Team B) to singular incident', () => {
    const responders = ['Team A', 'Team B'];
    const message = "Need everyone's help with this incident";
    selectIncident(0);
    addResponders(responders, message);
    checkActionAlertsModalContent('Requested additional response for incident(s)');
  });

  it('Snooze singular incident for specified duration (5 minutes)', () => {
    const duration = '5 minutes';
    selectIncident(0);
    snooze(duration);
    checkActionAlertsModalContent('have been snoozed.');
  });

  it('Snooze singular incident for custom duration (2 hours)', () => {
    const type = 'hours';
    const option = 2;
    selectIncident(0);
    snoozeCustom(type, option);
    checkActionAlertsModalContent('have been snoozed.');
  });

  it('Snooze singular incident for custom duration (tomorrow for 9:00 AM)', () => {
    const type = 'tomorrow';
    const option = '9:00 AM';
    selectIncident(0);
    snoozeCustom(type, option);
    checkActionAlertsModalContent('have been snoozed.');
  });

  it('Merge two incidents together', () => {
    const targetIncidentIdx = 0;
    selectIncident(targetIncidentIdx);
    selectIncident(targetIncidentIdx + 1);
    merge(targetIncidentIdx);
    checkActionAlertsModalContent('and their alerts have been merged onto');
  });

  it('Resolve singular incident', () => {
    selectIncident(0);
    cy.get('#incident-action-resolve-button').click();
    checkActionAlertsModalContent('have been resolved');
  });

  priorityNames.forEach((priorityName, idx) => {
    it(`Update priority of singular incident to ${priorityName}`, () => {
      const incidentIdx = idx;
      selectIncident(incidentIdx);
      cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
        updatePriority(priorityName);
        checkActionAlertsModalContent(`have been updated with priority = ${priorityName}`);
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        checkIncidentCellContent(incidentId, 'Priority', priorityName); // FIXME: Race conditions
      });
    });
  });

  it('Run external system sync on singular incident', () => {
    // For some reason this doesn't work on first attempt - clearing cache as a workaround
    // acceptDisclaimer();
    // waitForIncidentTable();

    const externalSystemName = 'ServiceNow';
    selectIncident(0);
    runExternalSystemSync(externalSystemName);
  });

  it('Run custom incident action on singular incident', () => {
    const actionName = 'Restart Service';
    selectIncident(0);
    runAction(actionName);
    checkActionAlertsModalContent(
      `Custom Incident Action "${actionName}" triggered for incident(s)`,
    );
  });

  it('Run response play on singular incident', () => {
    const responsePlayName = 'Major Incident Response';
    selectIncident(0);
    runResponsePlay(responsePlayName);
    checkActionAlertsModalContent(`Ran "${responsePlayName}" response play for incident(s)`);
  });
});
