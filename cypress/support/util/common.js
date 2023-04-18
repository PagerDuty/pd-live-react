/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable import/prefer-default-export */
import {
  api,
} from '@pagerduty/pdjs';

export const pd = api({ token: Cypress.env('PD_USER_TOKEN') });

/*
  Cypress Helpers
*/
export const acceptDisclaimer = () => {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      win.sessionStorage.clear();
    },
  });
  cy.get('.modal-title', { timeout: 30000 }).contains('Disclaimer & License');
  cy.get('#disclaimer-agree-checkbox').click();
  cy.get('#disclaimer-accept-button').click();
};

export const waitForIncidentTable = () => {
  // Ref: https://stackoverflow.com/a/60065672/6480733
  cy.wait(3000); // Required for query debounce
  cy.get('.incident-table-ctr', { timeout: 60000 }).should('be.visible');
};

export const selectIncident = (incidentIdx = 0) => {
  const selector = `[data-incident-row-idx="${incidentIdx}"]`;
  cy.get(selector).invoke('attr', 'data-incident-id').as(`selectedIncidentId_${incidentIdx}`);
  cy.get(selector).click();
};

export const selectAllIncidents = () => {
  cy.get('#all-incidents-checkbox', { timeout: 20000 }).click();
};

export const checkActionAlertsModalContent = (content) => {
  cy.wait(2000);
  cy.get('.action-alerts-modal').contains(content, { timeout: 10000 });
  cy.get('.action-alerts-modal').type('{esc}');
};

export const checkIncidentCellContent = (incidentId, incidentHeader, content) => {
  cy.wait(2000);
  cy.get(`[data-incident-header="${incidentHeader}"][data-incident-cell-id="${incidentId}"]`)
    .should('be.visible')
    .should('have.text', content);
};

export const checkIncidentCellContentAllRows = (incidentHeader, content) => {
  cy.wait(2000);
  cy.get('.tbody').then(($tbody) => {
    const visibleIncidentCount = $tbody.find('tr').length;
    for (let incidentIdx = 0; incidentIdx < visibleIncidentCount; incidentIdx++) {
      cy.get(
        `[data-incident-header="${incidentHeader}"][data-incident-row-cell-idx="${incidentIdx}"]`,
      )
        .scrollIntoView()
        .should('be.visible')
        .should('have.text', content);
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
  cy.wait(2000);
  cy.get('.tbody').then(($tbody) => {
    const visibleIncidentCount = $tbody.find('tr').length;
    for (let incidentIdx = 0; incidentIdx < visibleIncidentCount; incidentIdx++) {
      checkIncidentCellIcon(incidentIdx, incidentHeader, icon);
    }
  });
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
  cy.get('#incident-action-escalate-button').click();
  cy.get(`#escalation-level-${escalationLevel}-button`).click();
};

export const reassign = (assignment) => {
  cy.get('#incident-action-reassign-button').click();
  cy.get('#reassign-select').click();
  cy.contains('div', assignment).click();
  cy.get('#reassign-button').click();
};

export const addResponders = (responders = [], message = null) => {
  cy.get('#incident-action-add-responders-button').click();
  responders.forEach((responder) => {
    cy.get('#add-responders-select').click();
    cy.contains('div', responder).click();
  });
  if (message) cy.get('#add-responders-textarea').type(message);
  cy.get('#add-responders-button').click();
};

export const snooze = (duration) => {
  cy.get('#incident-action-snooze-button').click();
  cy.get('.dropdown-item').contains(duration).click();
};

export const snoozeCustom = (type, option) => {
  cy.get('#incident-action-snooze-button').click();
  cy.get('#snooze-duration-custom-modal-button').click();
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
  cy.get(`[id*="-option-${targetIncidentIdx}"]`).click();
  cy.get('#merge-button').click();
};

export const updatePriority = (priorityName) => {
  cy.get('#incident-action-update-priority-button').click();
  cy.get('.dropdown-item').contains(priorityName).click();
};

export const addNote = (note) => {
  cy.get('#incident-action-add-note-button').click();
  cy.get('#add-note-textarea').type(note);
  cy.get('#add-note-button').click();
};

const toggleRunAction = () => {
  cy.wait(2000); // Unsure why we can't find DOM of action without wait
  cy.get('#incident-action-run-action-button').click();
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
  cy.get('#response-play-select').click();
  cy.contains('div', responsePlayName).click();
};

export const manageIncidentTableColumns = (desiredState = 'add', columns = []) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('Incident Table').click();

  columns.forEach((columnName) => {
    if (desiredState === 'add') {
      cy.get('[id*="-available"][class="rdl-control"]').select(columnName);
      cy.get('[aria-label="Move right"]').click();
    } else if (desiredState === 'remove') {
      cy.get('[id*="-selected"][class="rdl-control"]').select(columnName);
      cy.get('[aria-label="Move left"]').click();
    }
  });

  cy.get('.btn').contains('Update Incident Table').click();
  checkActionAlertsModalContent('Updated incident table settings');
  cy.get('.close').click();
};

export const manageCustomAlertColumnDefinitions = (customAlertColumnDefinitions) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('Incident Table').click();

  cy.get('#alert-column-definition-select').click().type('{del}'); // Clear default example
  customAlertColumnDefinitions.forEach((customAlertColumnDefinition) => {
    cy.get('#alert-column-definition-select').click().type(`${customAlertColumnDefinition}{enter}`);
  });

  cy.get('.btn').contains('Update Incident Table').click();
  checkActionAlertsModalContent('Updated incident table settings');
  cy.get('.close').click();
};

export const updateUserLocale = (localeName = 'English (United Kingdom)', settingsMenu = 'Settings', userProfile = 'User Profile', updateuserProfile = 'Update User Profile', updatedUserProfileSettings = 'Updated user profile settings') => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains(settingsMenu).click();
  cy.get('.nav-item').contains(userProfile).click();

  cy.get('#user-locale-select').click();
  cy.contains('div', localeName).click();

  cy.get('.btn').contains(updateuserProfile).click();
  checkActionAlertsModalContent(updatedUserProfileSettings);
  cy.get('.close').click();
};

export const updateDefaultSinceDateLookback = (tenor = '1 Day') => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('User Profile').click();

  cy.get(`input[value="${tenor}"]`).parent().click();

  cy.get('.btn').contains('Update User Profile').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.get('.close').click();
  cy.reload();
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

export const updateMaxIncidentsLimit = (limit = 200) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('User Profile').click();

  cy.get('#user-profile-max-incidents-limit-input').clear().type(`${limit}{enter}`);

  cy.get('.btn').contains('Update User Profile').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.get('.close').click();
};

export const updateMaxRateLimit = (limit = 200) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('User Profile').click();

  cy.get('#user-profile-max-rate-limit-input').clear().type(`${limit}{enter}`);

  cy.get('.btn').contains('Update User Profile').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.get('.close').click();
};

export const updateAutoAcceptIncidentQuery = (autoAcceptIncidentsQuery = false) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('User Profile').click();

  if (autoAcceptIncidentsQuery) {
    cy.get('#user-profile-auto-accept-incident-query-checkbox').check({ force: true });
  } else {
    cy.get('#user-profile-auto-accept-incident-query-checkbox').uncheck({ force: true });
  }

  cy.get('.btn').contains('Update User Profile').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.get('.close').click();
};

export const updateDarkMode = (darkMode = false) => {
  cy.get('.settings-panel-dropdown').click();
  cy.get('.dropdown-item').contains('Settings').click();
  cy.get('.nav-item').contains('User Profile').click();

  if (darkMode) {
    cy.get('#user-profile-dark-mode-checkbox').check({ force: true });
  } else {
    cy.get('#user-profile-dark-mode-checkbox').uncheck({ force: true });
  }

  cy.get('.btn').contains('Update User Profile').click();
  checkActionAlertsModalContent('Updated user profile settings');
  cy.get('.close').click();
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
