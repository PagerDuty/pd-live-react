/* eslint-disable cypress/unsafe-to-chain-command */

import moment from 'moment';
import 'moment/min/locales.min';

import {
  acceptDisclaimer,
  waitForIncidentTable,
  updateUserLocale,
  updateDefaultSinceDateLookback,
  updateMaxRateLimit,
  updateDarkMode,
  manageIncidentTableColumns,
  manageCustomAlertColumnDefinitions,
  // activateButton,
  // priorityNames,
} from '../../support/util/common';

describe('Manage Settings', { failFast: { enabled: false } }, () => {
  const localeCode = 'en-US';
  moment.locale(localeCode);

  before(() => {
    acceptDisclaimer();
    // priorityNames.forEach((currentPriority) => {
    //   activateButton(`query-priority-${currentPriority}-button`);
    // });
    waitForIncidentTable();
  });

  beforeEach(() => {
    if (cy.state('test').currentRetry() > 1) {
      acceptDisclaimer();
    }
    // priorityNames.forEach((currentPriority) => {
    //   activateButton(`query-priority-${currentPriority}-button`);
    // });
    waitForIncidentTable();
  });

  it('Change user locale to fr', () => {
    const localeName = 'Français';

    updateUserLocale(
      localeName,
      'Settings',
      'Paramètres du profil utilisateur mis à jour',
    );
  });

  it('Change user locale to en-US', () => {
    const localeName = 'English (United States)';
    const expectedSinceDateFormat = moment().subtract(1, 'days').format('L');
    const expectedIncidentDateFormat = moment().format('LL');

    updateUserLocale(
      localeName,
      'Paramètres',
      'Updated user profile settings',
    );
    cy.get('#query-date-input').should('have.value', expectedSinceDateFormat);
    cy.get('[data-incident-header="Created At"][data-incident-row-cell-idx="0"]')
      .should('be.visible')
      .should('contain', expectedIncidentDateFormat);
  });

  [
    '1 Day',
    '3 Days',
    '1 Week',
    '2 Weeks',
    '1 Month',
    '3 Months',
    '6 Months',
  ].forEach((tenor) => {
    it(`Update default since date lookback to ${tenor}`, () => {
      const [sinceDateNum, sinceDateTenor] = tenor.split(' ');
      const expectedDate = moment().subtract(Number(sinceDateNum), sinceDateTenor).format('L');
      updateDefaultSinceDateLookback(tenor);
      updateUserLocale(
        'English (United States)',
        'Settings',
        'Updated user profile settings',
      );
      cy.get('#query-date-input').should('have.value', expectedDate);
    });
  });

  it('Update max rate limit', () => {
    const maxRateLimit = 600;
    updateMaxRateLimit(maxRateLimit);
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(
        Number(state.settings.maxRateLimit),
      ).to.equal(maxRateLimit));
  });

  it('Add standard columns to incident table', () => {
    const columns = [
      ['Teams', 'teams'],
      ['Num Alerts', 'num_alerts'],
      ['Group', 'service_group'],
      ['Component', 'source_component'],
    ];
    manageIncidentTableColumns('add', columns.map((column) => column[1]));
    columns.map((column) => column[0]).forEach((columnName) => {
      cy.get(`[data-column-name="${columnName}"]`).scrollIntoView().should('be.visible');
    });
  });

  it('Remove standard columns from incident table', () => {
    const columns = [
      ['Service', 'service'],
      ['Latest Note', 'latest_note'],
    ];
    manageIncidentTableColumns('remove', columns.map((column) => column[1]));

    // Assert against DOM to see if element has been removed
    cy.get('body').then((body) => {
      columns.map((column) => column[0]).forEach((columnName) => {
        expect(body.find(`[data-column-name="${columnName}"]`).length).to.equal(0);
      });
    });
  });

  it('Update and store incident column width correctly', () => {
    const columnToResize = ['Status', 'status'];
    const targetColumn = ['Priority', 'priority'];
    let newColumnWidth;

    cy.get(`[data-column-name="${columnToResize[0]}"] > .resizer`)
      .trigger('mousedown', { which: 1 });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get(`[data-column-name="${targetColumn[0]}"] > .resizer`)
      .trigger('mousemove')
      .trigger('mouseup');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get(`[data-column-name="${columnToResize[0]}"]`)
      .invoke('css', 'width')
      .then((str) => {
        newColumnWidth = parseInt(str, 10);
      });

    // Remove, re-add column, and ensure width has not been changed
    manageIncidentTableColumns('remove', [columnToResize[1], targetColumn[1]]);
    manageIncidentTableColumns('add', [columnToResize[1]]);
    cy.get(`[data-column-name="${columnToResize[0]}"]`)
      .invoke('css', 'width')
      .then((str) => {
        expect(parseInt(str, 10)).to.equal(newColumnWidth);
      });
  });

  it('Add valid custom alert column to incident table', () => {
    const customAlertColumnDefinitions = ['Quote:details.quote'];
    manageCustomAlertColumnDefinitions(customAlertColumnDefinitions);
    // manageIncidentTableColumns('add', customAlertColumnDefinitions);
    customAlertColumnDefinitions.forEach((columnName) => {
      const header = columnName.split(':')[0];
      cy.get(`[data-column-name="${header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
      });
    });
  });

  it('Clear local cache', () => {
    cy.get('.settings-panel-dropdown').click();
    cy.get('.dropdown-item').contains('Clear Local Cache').click();
    cy.get('.modal-title').contains('Disclaimer & License').should('be.visible');
    acceptDisclaimer();
  });

  it('Update dark mode', () => {
    let currentDarkMode;
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => {
        currentDarkMode = state.settings.darkMode;
      });
    updateDarkMode();
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(
        state.settings.darkMode,
      ).to.equal(!currentDarkMode));
  });
});
