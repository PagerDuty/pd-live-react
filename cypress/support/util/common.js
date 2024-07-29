/* eslint-disable cypress/unsafe-to-chain-command */
/* eslint-disable import/prefer-default-export */
import {
  api,
} from '@pagerduty/pdjs';

export const pd = api({ token: Cypress.env('PD_USER_TOKEN') });

/*
  Cypress Helpers
*/
export const acceptDisclaimer = () => {
  cy.visit('/');
  cy.get('.modal-title').contains('Disclaimer & License').should('be.visible');
  cy.get('#disclaimer-agree-checkbox').click({ force: true });
  cy.get('#disclaimer-accept-button').click({ force: true });
};

export const waitForIncidentTable = () => {
  // Ref: https://stackoverflow.com/a/60065672/6480733
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(3000); // Required for query debounce
  cy.get('#incident-table-ctr', { timeout: 60000 }).should('be.visible');
  cy.get('.selected-incidents-ctr', { timeout: 60000 }).should('not.include.text', 'Querying');
  // will move on to next command even if table is not scrollable
  cy.get('.incident-table-fixed-list').scrollTo('top', { ensureScrollable: false });
};

export const waitForAlerts = () => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(3000); // Required for query debounce
  cy.get('.selected-incidents-ctr', { timeout: 60000 }).should(
    'not.include.text',
    'Fetching Alerts',
  );
};

export const selectIncident = (incidentIdx = 0, shiftKey = false) => {
  const selector = `[data-incident-row-idx="${incidentIdx}"]`;
  cy.get(selector).invoke('attr', 'data-incident-id').as(`selectedIncidentId_${incidentIdx}`);
  cy.get(selector).click({ shiftKey, force: true });
};

export const selectAlert = (alertIdx = 0) => {
  const selector = `[data-alert-row-idx="${alertIdx}"]`;
  cy.get(selector).invoke('attr', 'data-alert-id').as(`selectedAlertId_${alertIdx}`);
  cy.get(selector).click();
};

export const selectAllIncidents = () => {
  cy.get('#select-all', { timeout: 20000 }).click({ force: true });
};

export const checkNoIncidentsSelected = () => {
  cy.get('.selected-incidents-badge').should(($el) => {
    const text = $el.text();
    const incidentNumbers = text.split(' ')[0].split('/');
    expect(incidentNumbers[0]).to.equal('0');
  });
};

export const checkActionAlertsModalContent = (content) => {
  cy.get('.chakra-alert__title').contains(content, { timeout: 10000 });
};

export const checkPopoverContent = (incidentId, incidentHeader, content) => {
  cy.get(
    `[data-incident-header="${incidentHeader}"][data-incident-cell-id="${incidentId}"]`,
  ).within(() => {
    cy.get('.chakra-avatar__group').realHover();
    cy.get('.chakra-popover__popper').should('be.visible').contains(content, { timeout: 10000 });
  });
};

export const checkIncidentCellContent = (incidentId, incidentHeader, content) => {
  cy.get(`[data-incident-header="${incidentHeader}"][data-incident-cell-id="${incidentId}"]`)
    .should('be.visible')
    .contains(content);
};

export const checkIncidentCellContentAllRows = (incidentHeader, content) => {
  cy.get('.incident-table-fixed-list').scrollTo('top', { ensureScrollable: true });
  cy.get('.incident-table-fixed-list > div').then(($tbody) => {
    const visibleIncidentCount = $tbody.find('[role="row"]').length;
    for (let incidentIdx = 0; incidentIdx < visibleIncidentCount; incidentIdx++) {
      cy.get(
        `[data-incident-header="${incidentHeader}"][data-incident-row-cell-idx="${incidentIdx}"]`,
      )
        .scrollIntoView()
        .should('be.visible')
        .contains(content);
    }
  });
};

export const checkIncidentCellIcon = (incidentIdx, incidentHeader, icon) => {
  cy.get(
    `[data-incident-header="${incidentHeader}"][data-incident-row-cell-idx="${incidentIdx}"]`,
  ).within(() => {
    cy.get('svg').then(($el) => {
      cy.wrap($el).should('have.class', icon);
    });
  });
};

export const checkIncidentCellIconAllRows = (incidentHeader, icon) => {
  cy.get('.incident-table-fixed-list > div').then(($tbody) => {
    const visibleIncidentCount = $tbody.find('[role="row"]').length;
    for (let incidentIdx = 0; incidentIdx < visibleIncidentCount; incidentIdx++) {
      checkIncidentCellIcon(incidentIdx, incidentHeader, icon);
    }
  });
};

export const checkIncidentCellContentHasLink = (incidentId, incidentHeader, text, link) => {
  cy.get(`[data-incident-header="${incidentHeader}"][data-incident-cell-id="${incidentId}"]`)
    .should('be.visible')
    .contains('a', text)
    .should('have.attr', 'href', link);
};

export const deactivateButton = (domId) => {
  cy.get(`#${domId}`).then(($el) => {
    const cls = $el.attr('class');
    if (cls.includes('active')) {
      cy.wrap($el).click().should('not.have.class', 'active');
    }
  });
};

export const activateButton = (domId) => {
  cy.get(`#${domId}`).then(($el) => {
    const cls = $el.attr('class');
    if (!cls.includes('active')) {
      cy.wrap($el).click().should('have.class', 'active');
    }
  });
};

export const escalate = (escalationLevel) => {
  cy.get('.incident-action-escalate-button').click();
  cy.get(`.escalation-level-${escalationLevel}-button`).click();
};

export const reassign = (assignment, type = 'ep') => {
  // fail if type is not 'ep' or 'user'
  if (type !== 'ep' && type !== 'user') {
    throw new Error('Invalid type');
  }
  const tabId = type === 'ep' ? 'reassign-ep-tab' : 'reassign-user-tab';
  const tabSelector = `[data-tab-id="${tabId}"]`;
  cy.get('#incident-action-reassign-button').click();
  cy.get(tabSelector).click();
  cy.get('#reassign-select').click();
  cy.get('#reassign-select input').first().type(assignment);
  cy.get('div[role="button"]').contains(assignment).should('exist').click();
  cy.get('#reassign-button').click();
};

export const addResponders = (responders = [], message = null) => {
  cy.get('#incident-action-add-responders-button').click();
  responders.forEach((responder) => {
    if (responder.type !== 'user' && responder.type !== 'ep') {
      throw new Error(`Invalid responder type: ${JSON.stringify(responder)}`);
    }
    const selectId = responder.type === 'user' ? 'add-responders-select-users' : 'add-responders-select-eps';
    cy.get(`#${selectId}`).click();
    cy.get(`#${selectId} input`).first().type(responder.assignment);
    cy.get('div[role="button"]').contains(responder.assignment).should('exist').click();
  });
  if (message) cy.get('#add-responders-textarea').type(message);
  cy.get('#add-responders-button').click();
};

export const snooze = (duration) => {
  cy.get('.incident-action-snooze-button').click();
  cy.get('.dropdown-item').contains(duration).click();
};

export const snoozeCustom = (type, option) => {
  cy.get('.incident-action-snooze-button').click();
  cy.get('.snooze-duration-custom-modal-button').click();
  if (type === 'hours') {
    cy.get('#snooze-hours').click();
    cy.get('#snooze-hours-input').clear().type(option);
  } else if (type === 'tomorrow') {
    cy.get('#snooze-tomorrow').click();
    cy.get('#snooze-tomorrow-datepicker').click();
    cy.get('.react-datepicker__time-list-item').contains(option).click();
  }
  cy.get('#snooze-custom-button').click();
};

export const merge = (targetIncidentIdx) => {
  cy.get('#incident-action-merge-button').click();
  cy.get('#merge-select').click();
  cy.get(`[id*="-option-0-${targetIncidentIdx}"]`).click();
  cy.get('#merge-button').click();
};

export const updatePriority = (priorityName) => {
  cy.get('.incident-action-update-priority-button').click();
  cy.get('.dropdown-item').contains(priorityName).click();
};

export const addNote = (note) => {
  cy.get('#incident-action-add-note-button').click();
  cy.get('#add-note-textarea').type(note);
  cy.get('#add-note-button').click();
};

const toggleRunAction = () => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(2000); // Unsure why we can't find DOM of action without wait
  cy.get('.incident-action-run-action-button').click();
};

export const runAction = (actionName) => {
  toggleRunAction();
  cy.get('.dropdown-item').contains(actionName).click();
};

export const runExternalSystemSync = (externalSystemName) => {
  toggleRunAction();
  cy.get('.dropdown-item')
    .contains(externalSystemName)
    .then(($el) => {
      const cls = $el.attr('class');
      if (!cls.includes('disabled')) {
        cy.wrap($el).click();
        checkActionAlertsModalContent(`Synced with "${externalSystemName}" on incident(s)`);
      } else {
        expect($el).to.contain('Synced with');
      }
    });
};

export const runResponsePlay = (responsePlayName) => {
  toggleRunAction();
  // cy.get('#response-play-select').click();
  // cy.contains('div', responsePlayName).click();
  cy.get('.dropdown-item').contains(responsePlayName).click();
};

export const manageIncidentTableColumns = (desiredState = 'add', columns = []) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Columns').click();
  // cy.get('.nav-item').contains('Incident Table').click();

  columns.forEach((columnId) => {
    cy.get(`#column-${columnId}-${desiredState}-icon`).click();
  });

  cy.get('#save-columns-button').click();
  checkActionAlertsModalContent('Incident table columns saved');
};

export const manageCustomColumnDefinitions = (customColumnDefinitions, type = 'alert') => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Columns').click();

  cy.get('#custom-columns-card-body .chakra-icon').each(($el) => {
    cy.wrap($el).click();
  });

  customColumnDefinitions.forEach((customColumnDefinition) => {
    const {
      header, accessorPath, expression,
    } = customColumnDefinition;
    cy.get('#column-type-select').select(type);
    cy.get('input[placeholder="Header"]').clear().type(header);
    cy.get('input[placeholder="JSON Path"]').clear().type(accessorPath);
    if (type === 'computed') {
      cy.get('input[placeholder="Regex"]')
        .clear()
        .type(expression, { parseSpecialCharSequences: false });
    }
    cy.get('button[aria-label="Add custom column"]').click();
    // Need to escape special characters in accessorPath
    // https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-use-special-characters-with-cyget
    const columnId = Cypress.$.escapeSelector(
      [header, accessorPath, expression.replace(/:/g, '\\:')]
        .filter((value) => value !== '')
        .join(':'),
    );
    cy.get(`#column-${columnId}-add-icon`).click();
  });
  cy.get('#save-columns-button').click();
  checkActionAlertsModalContent('Incident table columns saved');
};

export const updateUserLocale = (
  localeName = 'English (United Kingdom)',
  settingsMenu = 'Settings',
  updatedUserProfileSettings = 'Updated user profile settings',
) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains(settingsMenu).click();

  cy.get('#user-locale-select').select(localeName);

  cy.get('#save-settings-button').click();
  checkActionAlertsModalContent(updatedUserProfileSettings);
};

export const updateDefaultSinceDateLookback = (tenor = '1 Day') => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();

  cy.get('#since-date-tenor-select').select(tenor);

  cy.get('#save-settings-button').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.visit('/');
};

export const updateAutoRefreshInterval = (autoRefreshInterval = 5) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('User Profile').click();

  cy.get('#user-profile-auto-refresh-interval-input').clear().type(`${autoRefreshInterval}{enter}`);

  cy.get('.btn').contains('Update User Profile').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.get('.close').click();
};

export const updateMaxRateLimit = (limit = 200) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();

  cy.get('[aria-label="Max Rate Limit"]').focus().type('{home}');
  for (let i = 100; i < limit; i += 100) {
    cy.get('[aria-label="Max Rate Limit"]').focus().type('{rightArrow}');
  }
  cy.get('#save-settings-button').click();
  checkActionAlertsModalContent('Updated user profile settings');
};

export const updateRelativeDates = (relativeDates = false) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();

  if (relativeDates) {
    cy.get('#relative-dates-switch').check({ force: true });
  } else {
    cy.get('#relative-dates-switch').uncheck({ force: true });
  }

  cy.get('#save-settings-button').click();
  checkActionAlertsModalContent('Updated user profile settings');
};

export const updateFuzzySearch = (fuzzySearch = false) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();

  if (fuzzySearch) {
    cy.get('#fuzzy-search-switch').check({ force: true });
  } else {
    cy.get('#fuzzy-search-switch').uncheck({ force: true });
  }

  cy.get('#save-settings-button').click();
  checkActionAlertsModalContent('Updated user profile settings');
};

export const updateDarkMode = () => {
  cy.get('[aria-label="Toggle Dark Mode"]').click();
};

export const clearLocalCache = () => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Clear Local Cache').click();
};

export const priorityNames = ['--', 'P5', 'P4', 'P3', 'P2', 'P1'];

/*
  PagerDuty API Helpers
*/

// TODO: Figure out how to query API and use incident object for comparison
export const getIncident = (incidentId) => {
  pd.get(`incidents/${incidentId}`).then(({
    data,
  }) => {
    cy.window().then((win) => {
      win.sessionStorage.setItem('incident', data.incident);
    });
  });
};
