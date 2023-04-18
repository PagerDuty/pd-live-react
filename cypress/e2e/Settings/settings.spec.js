import moment from 'moment';
import 'moment/min/locales.min';

import {
  faker,
} from '@faker-js/faker';

import {
  acceptDisclaimer,
  waitForIncidentTable,
  updateUserLocale,
  updateDefaultSinceDateLookback,
  updateMaxIncidentsLimit,
  updateMaxRateLimit,
  updateAutoAcceptIncidentQuery,
  updateAutoRefreshInterval,
  updateDarkMode,
  manageIncidentTableColumns,
  manageCustomAlertColumnDefinitions,
  activateButton,
  priorityNames,
} from '../../support/util/common';

describe('Manage Settings', { failFast: { enabled: false } }, () => {
  const localeCode = 'en-US';
  moment.locale(localeCode);

  before(() => {
    acceptDisclaimer();
    priorityNames.forEach((currentPriority) => {
      activateButton(`query-priority-${currentPriority}-button`);
    });
    waitForIncidentTable();
  });

  beforeEach(() => {
    if (cy.state('test').currentRetry() > 1) {
      acceptDisclaimer();
    }
    priorityNames.forEach((currentPriority) => {
      activateButton(`query-priority-${currentPriority}-button`);
    });
    waitForIncidentTable();
  });

  it('Change user locale to fr', () => {
    const localeName = 'Français';

    updateUserLocale(localeName,'Settings', 'User Profile', 'Update User Profile', 'Paramètres du profil utilisateur mis à jour');
  });

  it('Change user locale to en-US', () => {
    const localeName = 'English (United States)';
    const expectedSinceDateFormat = moment().subtract(1, 'days').format('L');
    const expectedIncidentDateFormat = moment().format('LL');

    updateUserLocale(localeName,'Paramètres', 'Profil utilisateur', 'Mettre à jour le profil utilisateur', 'Updated user profile settings');
    cy.get('#query-date-input').should('have.value', expectedSinceDateFormat);
    cy.get('[data-incident-header="Created At"][data-incident-row-cell-idx="0"]')
      .should('be.visible')
      .should('contain', expectedIncidentDateFormat);
  });

  ['1 Day', '3 Days', '1 Week', '2 Weeks', '1 Month', '3 Months', '6 Months'].forEach((tenor) => {
    it(`Update default since date lookback to ${tenor}`, () => {
      const [sinceDateNum, sinceDateTenor] = tenor.split(' ');
      const expectedDate = moment().subtract(Number(sinceDateNum), sinceDateTenor).format('L');
      updateDefaultSinceDateLookback(tenor);
      cy.get('#query-date-input').should('have.value', expectedDate);
    });
  });

  it('Update auto-refresh interval', () => {
    const autoRefreshInterval = faker.datatype.number({ min: 5, max: 60 });
    updateAutoRefreshInterval(autoRefreshInterval);
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(
        Number(state.settings.autoRefreshInterval),
      ).to.equal(autoRefreshInterval));
  });

  it('Update max incidents limit', () => {
    const maxIncidentsLimit = faker.datatype.number({ min: 200, max: 1000 });
    updateMaxIncidentsLimit(maxIncidentsLimit);
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(
        Number(state.settings.maxIncidentsLimit),
      ).to.equal(maxIncidentsLimit));
  });

  it('Update max rate limit', () => {
    const maxRateLimit = faker.datatype.number({ min: 100, max: 1000 });
    updateMaxRateLimit(maxRateLimit);
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(
        Number(state.settings.maxRateLimit),
      ).to.equal(maxRateLimit));
  });

  it('Update auto-accept incident query', () => {
    [true, false].forEach((autoAcceptIncidentsQuery) => {
      updateAutoAcceptIncidentQuery(autoAcceptIncidentsQuery);
      cy.window()
        .its('store')
        .invoke('getState')
        .then((state) => expect(
          state.settings.autoAcceptIncidentsQuery,
        ).to.equal(autoAcceptIncidentsQuery));
    });
  });

  it('Add standard columns to incident table', () => {
    const columns = ['Teams', 'Num Alerts', 'Group', 'Component'];
    manageIncidentTableColumns('add', columns);
    columns.forEach((columnName) => {
      cy.get(`[data-column-name="${columnName}"]`).scrollIntoView().should('be.visible');
    });
  });

  it('Remove standard columns from incident table', () => {
    const columns = ['Service', 'Latest Note'];
    manageIncidentTableColumns('remove', columns);

    // Assert against DOM to see if element has been removed
    cy.get('body').then((body) => {
      columns.forEach((columnName) => {
        expect(body.find(`[data-column-name="${columnName}"]`).length).to.equal(0);
      });
    });
  });

  it('Update and store incident column width correctly', () => {
    const columnName = 'Status';
    const targetColumn = 'Priority';
    let newColumnWidth;

    // Resize column by dragging header and find updated width
    cy.get(`[data-column-name="${columnName}"] > div`).drag(
      `[data-column-name="${targetColumn}"] > div`,
    );
    cy.get(`[data-column-name="${columnName}"]`)
      .invoke('css', 'width')
      .then((str) => {
        newColumnWidth = parseInt(str, 10);
      });

    // Remove, re-add column, and ensure width has not been changed
    manageIncidentTableColumns('remove', [columnName, targetColumn]);
    manageIncidentTableColumns('add', [columnName]);
    cy.get(`[data-column-name="${columnName}"]`)
      .invoke('css', 'width')
      .then((str) => {
        expect(parseInt(str, 10)).to.equal(newColumnWidth);
      });
  });

  it('Add valid custom alert column to incident table', () => {
    const customAlertColumnDefinitions = ['Quote:details.quote'];
    manageCustomAlertColumnDefinitions(customAlertColumnDefinitions);
    manageIncidentTableColumns('add', customAlertColumnDefinitions);
    customAlertColumnDefinitions.forEach((columnName) => {
      const [header] = columnName.split(':');
      cy.get(`[data-column-name="${header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
      });
    });
  });

  it('Add invalid custom alert column to incident table', () => {
    const customAlertColumnDefinitions = ['SOMEINVALIDCOLUMN'];
    manageCustomAlertColumnDefinitions(customAlertColumnDefinitions);
    manageIncidentTableColumns('add', customAlertColumnDefinitions);
    customAlertColumnDefinitions.forEach((columnName) => {
      const [header] = columnName.split(':');
      cy.get(`[data-column-name="${header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        expect($el.text()).to.equal('Invalid JSON Path');
      });
    });
  });

  it('Clear local cache', () => {
    cy.get('.settings-panel-dropdown').click();
    cy.get('.dropdown-item').contains('Settings').click();
    cy.get('.nav-item').contains('Local Cache').click();
    cy.get('.btn').contains('Clear Local Cache').click();
    cy.get('.modal-title').contains('Disclaimer & License').should('be.visible');
  });
  
  it('Update dark mode', () => {
    [true, false].forEach((darkMode) => {
      updateDarkMode(darkMode);
      cy.window()
        .its('store')
        .invoke('getState')
        .then((state) => expect(
          state.settings.darkMode,
        ).to.equal(darkMode));
    });
  });
});
