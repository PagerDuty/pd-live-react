/* eslint-disable no-underscore-dangle */
/* eslint-disable cypress/unsafe-to-chain-command */

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
  checkPopoverContent,
  checkIncidentCellContent,
  checkNoIncidentsSelected,
  checkIncidentCellContentHasLink,
  manageIncidentTableColumns,
  priorityNames,
  selectAlert,
} from '../../support/util/common';

describe('Manage Open Incidents', { failFast: { enabled: false } }, () => {
  before(() => {
    acceptDisclaimer();
    const columns = [
      ['Responders', 'responders'],
      ['Latest Log Entry Type', 'latest_log_entry_type'],
    ];
    manageIncidentTableColumns(
      'add',
      columns.map((column) => column[1]),
    );
    waitForIncidentTable();
  });

  // We use beforeEach as each test will reload/clear the session
  beforeEach(() => {
    // Handle failing tests by clearing cache
    if (cy.state('test').currentRetry() > 1) {
      acceptDisclaimer();
      const columns = [
        ['Responders', 'responders'],
        ['Latest Log Entry Type', 'latest_log_entry_type'],
      ];
      manageIncidentTableColumns(
        'add',
        columns.map((column) => column[1]),
      );
    }
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

  it('Shift-select multiple incidents', () => {
    selectIncident(0);
    selectIncident(4, true);
    cy.get('.selected-incidents-badge').then(($el) => {
      const text = $el.text();
      const incidentNumbers = text.split(' ')[0].split('/');
      expect(incidentNumbers[0]).to.equal('5');
    });
    // Unselect all incidents for the next run
    selectAllIncidents();
    selectAllIncidents();
  });

  it('Acknowledge singular incident', () => {
    const incidentIdx = 0;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      cy.get('#incident-action-acknowledge-button').click();
      checkActionAlertsModalContent('have been acknowledged');
      checkIncidentCellContent(incidentId, 'Latest Log Entry Type', 'acknowledge');
    });
  });

  it('Add note to singular incident', () => {
    const note = 'All your base are belong to us';
    const incidentIdx = 0;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      addNote(note);
      checkActionAlertsModalContent('have been updated with a note');
      checkIncidentCellContent(incidentId, 'Latest Note', note);
      checkIncidentCellContent(incidentId, 'Latest Log Entry Type', 'annotate');
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
      checkIncidentCellContent(incidentId, 'Latest Log Entry Type', 'annotate');
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
      checkIncidentCellContentHasLink(
        incidentId,
        'Latest Note',
        'example.com',
        'http://example.com',
      );
    });
  });

  it('Add note with email to singular incident', () => {
    const note = 'This note has an email test@example.com included';
    const incidentIdx = 3;
    selectIncident(incidentIdx);

    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      addNote(note);
      checkActionAlertsModalContent('have been updated with a note');
      checkIncidentCellContent(incidentId, 'Latest Note', note);
      checkIncidentCellContentHasLink(
        incidentId,
        'Latest Note',
        'test@example.com',
        'mailto:test@example.com',
      );
    });
  });

  // Assumed environment has 3 levels on escalation policy
  for (let escalationLevel = 1; escalationLevel < 4; escalationLevel++) {
    it(`Escalate singular incident to level: ${escalationLevel}`, () => {
      // Ensure that only high urgency incidents are visible
      // deactivateButton('query-urgency-low-button');
      cy.get('.query-urgency-low-button').uncheck({ force: true });
      waitForIncidentTable();
      const incidentIdx = 0;
      selectIncident(incidentIdx);
      cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
        escalate(escalationLevel);
        checkActionAlertsModalContent(`have been manually escalated to level ${escalationLevel}`);
        checkIncidentCellContent(incidentId, 'Latest Log Entry Type', /escalate|notify/);
      });
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
    const incidentIdx = 0;
    selectIncident(incidentIdx);
    addResponders(responders, message);
    checkActionAlertsModalContent('Requested additional response for incident(s)');
    cy.get(`@selectedIncidentId_${incidentIdx}`).then((incidentId) => {
      checkIncidentCellContent(incidentId, 'Responders', 'UA');
      checkPopoverContent(incidentId, 'Responders', 'user_a1@example.com');
      checkIncidentCellContent(incidentId, 'Latest Log Entry Type', 'responder_request');
    });
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

  it('Hovering over Num Alerts count should popup alert table', () => {
    // Remove the other columns to make it easier to see the alert count without scrolling
    const removeColumns = [
      ['Responders', 'responders'],
      ['Latest Log Entry Type', 'latest_log_entry_type'],
    ];
    manageIncidentTableColumns(
      'remove',
      removeColumns.map((column) => column[1]),
    );

    const addColumns = [['Num Alerts', 'num_alerts']];
    manageIncidentTableColumns(
      'add',
      addColumns.map((column) => column[1]),
    );

    const incidentIdx = 0;

    cy.get(`[data-incident-header="Num Alerts"][data-incident-row-cell-idx="${incidentIdx}"]`)
      .should('be.visible')
      .should('contain', '1');

    cy.get(
      `[data-incident-header="Num Alerts"][data-incident-row-cell-idx="${incidentIdx}"]`,
    ).within(() => {
      cy.get('[aria-haspopup="dialog"]').realHover();
    });

    cy.get('[data-popper-placement="bottom"]').should('be.visible');
    cy.get('[data-popper-placement="bottom"]').should('contain', 'Created At');
    cy.get('[data-popper-placement="bottom"]').should('contain', 'Status');
    cy.get('[data-popper-placement="bottom"]').should('contain', 'Summary');

    // Reset hover state
    cy.get('body').realHover({ position: 'topLeft' });
  });

  it('Split/move alert from one incident to a new incident', () => {
    const incidentIdx = 0;

    cy.get(
      `[data-incident-header="Num Alerts"][data-incident-row-cell-idx="${incidentIdx}"]`,
    ).within(() => {
      cy.get('[aria-haspopup="dialog"]').click();
    });

    selectAlert(0);

    cy.get('#alerts-modal-move-btn').click();
    cy.get('#alerts-modal-move-select').type('Move all selected alerts to one new incident{enter}');
    cy.get('#alerts-modal-move-summary-input')
      .clear()
      .type('New incident created from split alert');
    cy.get('#alerts-modal-complete-move-btn').click();

    checkActionAlertsModalContent('Alerts moved');
    waitForIncidentTable();

    cy.get(`[data-incident-header="Title"][data-incident-row-cell-idx="${incidentIdx}"]`)
      .should('be.visible')
      .should('have.text', 'New incident created from split alert');
  });

  it('Merge incidents then split alerts to their own incidents', () => {
    const targetIncidentIdx = 0;
    selectIncident(targetIncidentIdx);
    selectIncident(targetIncidentIdx + 1);
    merge(targetIncidentIdx);
    checkActionAlertsModalContent('and their alerts have been merged onto');
    waitForIncidentTable();
    const incidentIdx = 0;

    cy.get(
      `[data-incident-header="Num Alerts"][data-incident-row-cell-idx="${incidentIdx}"]`,
    ).within(() => {
      cy.get('[aria-haspopup="dialog"]').should('be.visible').should('have.text', '2').click();
    });

    selectAlert(0);
    selectAlert(1);

    cy.get('#alerts-modal-move-btn').click();
    cy.get('#alerts-modal-move-select').type(
      'Move each selected alert to its own new incident{enter}',
    );
    cy.get('#alerts-modal-complete-move-btn').click();

    checkActionAlertsModalContent('Alerts moved');
    waitForIncidentTable();
  });

  it('Move alerts to a specific incident', () => {
    const targetIncidentIdx = 0;
    const sourceIncidentIdx = 1;
    selectIncident(targetIncidentIdx);

    cy.get(`@selectedIncidentId_${targetIncidentIdx}`).then((incidentId) => {
      cy.get(`[data-incident-header="Num Alerts"][data-incident-cell-id="${incidentId}"]`).within(
        () => {
          cy.get('[aria-haspopup="dialog"]').should('be.visible').should('have.text', '1');
        },
      );

      cy.get(`[data-incident-header="Title"][data-incident-cell-id="${incidentId}"]`).within(() => {
        cy.get('a').invoke('text').as('targetIncidentTitle');
      });
    });

    cy.get(
      `[data-incident-header="Num Alerts"][data-incident-row-cell-idx="${sourceIncidentIdx}"]`,
    ).within(() => {
      cy.get('[aria-haspopup="dialog"]').should('be.visible').should('have.text', '1').click();
    });

    selectAlert(0);

    cy.get('#alerts-modal-move-btn').click();
    cy.get('@targetIncidentTitle').then((targetIncidentTitle) => {
      cy.log(`targetIncidentTitle: ${targetIncidentTitle}`);
      cy.get('#alerts-modal-move-select').type(`${targetIncidentTitle}{enter}`);
    });
    cy.get('#alerts-modal-complete-move-btn').click();

    checkActionAlertsModalContent('Alerts moved');
    waitForIncidentTable();

    cy.get(`@selectedIncidentId_${targetIncidentIdx}`).then((incidentId) => {
      cy.get(`[data-incident-header="Num Alerts"][data-incident-cell-id="${incidentId}"]`).within(
        () => {
          cy.get('[aria-haspopup="dialog"]').should('be.visible').should('have.text', '2');
        },
      );
    });

    // Tidy up by resolving the incident with two alerts
    selectIncident(0);
    cy.get('#incident-action-resolve-button').click();
    checkActionAlertsModalContent('have been resolved');
  });
});
