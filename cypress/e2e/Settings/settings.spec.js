/* eslint-disable cypress/unsafe-to-chain-command */

import moment from 'moment/min/moment-with-locales';
import 'moment/min/locales.min';

import {
  acceptDisclaimer,
  waitForIncidentTable,
  updateUserLocale,
  updateDefaultSinceDateLookback,
  updateMaxRateLimit,
  updateDarkMode,
  updateRelativeDates,
  manageIncidentTableColumns,
  manageCustomColumnDefinitions,
  checkIncidentCellContentAllRows,
  checkActionAlertsModalContent,
} from '../../support/util/common';

describe('Manage Settings', { failFast: { enabled: true } }, () => {
  const localeCode = 'en-US';
  moment.locale(localeCode);

  beforeEach(() => {
    acceptDisclaimer();
    waitForIncidentTable();
  });

  it('Change user locale to fr', () => {
    const localeName = 'Français';

    updateUserLocale(localeName, 'Settings', 'Paramètres du profil utilisateur mis à jour');
  });

  it('Change user locale to en-US', () => {
    const localeName = 'English (United States)';
    const expectedSinceDateFormat = moment().subtract(1, 'days').format('L');
    const expectedIncidentDateFormat = moment().format('LL');

    updateUserLocale(localeName, 'Settings', 'Updated user profile settings');
    cy.get('#query-date-input').should('contain', expectedSinceDateFormat);
    cy.get('[data-incident-header="Created At"][data-incident-row-cell-idx="0"]')
      .should('be.visible')
      .should('contain', expectedIncidentDateFormat);
  });

  // 1 Day is the default
  ['Today', '1 Day', '3 Days', '1 Week', '2 Weeks', '1 Month', '3 Months', '180 Days'].forEach(
    (tenor) => {
      it(`Update default since date lookback to ${tenor}`, () => {
        let [sinceDateNum, sinceDateTenor] = tenor.split(' ');
        if (tenor === 'Today') {
          sinceDateNum = '0';
          sinceDateTenor = 'Day';
        }
        const expectedDate = moment().subtract(Number(sinceDateNum), sinceDateTenor).format('L');
        updateDefaultSinceDateLookback(tenor);
        updateUserLocale('English (United States)', 'Settings', 'Updated user profile settings');
        cy.get('#query-date-input').should('contain', expectedDate);
      });
    },
  );

  it('Update max rate limit', () => {
    const maxRateLimit = 600;
    updateMaxRateLimit(maxRateLimit);
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(Number(state.settings.maxRateLimit)).to.equal(maxRateLimit));
  });

  it('Add standard columns to incident table', () => {
    const columns = [
      ['Teams', 'teams'],
      ['Num Alerts', 'num_alerts'],
      ['Group', 'service_group'],
      ['Component', 'source_component'],
    ];
    manageIncidentTableColumns(
      'add',
      columns.map((column) => column[1]),
    );
    columns
      .map((column) => column[0])
      .forEach((columnName) => {
        cy.get(`[data-column-name="${columnName}"]`).scrollIntoView().should('be.visible');
      });
  });

  it('Remove standard columns from incident table', () => {
    const columns = [
      ['Service', 'service'],
      ['Latest Note', 'latest_note'],
    ];
    manageIncidentTableColumns(
      'remove',
      columns.map((column) => column[1]),
    );

    // Assert against DOM to see if element has been removed
    cy.get('body').then((body) => {
      columns
        .map((column) => column[0])
        .forEach((columnName) => {
          expect(body.find(`[data-column-name="${columnName}"]`).length).to.equal(0);
        });
    });
  });

  it('Update and store incident column width correctly', () => {
    const columnToResize = ['Status', 'status'];
    const targetColumn = ['Priority', 'priority'];
    let newColumnWidth;

    cy.get(`[data-column-name="${columnToResize[0]}"] > .resizer`).trigger('mousedown', {
      which: 1,
    });
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
    const customColumnDefinitions = [
      { header: 'Quote', accessorPath: 'details.quote', expression: '' },
    ];
    manageCustomColumnDefinitions(customColumnDefinitions);
    customColumnDefinitions.forEach((column) => {
      cy.get(`[data-column-name="${column.header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${column.header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
        // Quote exists in the alert body, so it should not be empty
        expect($el.text()).to.not.equal('--');
        expect($el.text().length).to.be.greaterThan(20);
      });
    });
  });

  it('Add valid custom alert column with JSON path containing spaces to incident table', () => {
    const customColumnDefinitions = [
      { header: 'Fav Flavour', accessorPath: "details.['favorite ice cream flavor']", expression: '' },
    ];
    manageCustomColumnDefinitions(customColumnDefinitions);
    customColumnDefinitions.forEach((column) => {
      cy.get(`[data-column-name="${column.header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${column.header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
        // Fav Flavour doesn't exist in the alert body, so it should be empty
        expect($el.text()).to.equal('--');
      });
    });
  });

  it('Add valid custom computed column to incident table', () => {
    const customColumnDefinitions = [
      { header: 'CI', accessorPath: 'first_trigger_log_entry.channel.details', expression: '(.*.example.com)' },
    ];
    manageCustomColumnDefinitions(customColumnDefinitions, 'computed');
    customColumnDefinitions.forEach((column) => {
      cy.get(`[data-column-name="${column.header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${column.header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
        // CI doesn't exist in the alert body, so it should be empty
        expect($el.text()).to.equal('--');
      });
    });
  });

  it('Add two valid custom computed column to incident table with different expressions', () => {
    const customColumnDefinitions = [
      { header: 'CI', accessorPath: 'first_trigger_log_entry.channel.details', expression: '(.*.example.com)' },
      { header: 'Category', accessorPath: 'first_trigger_log_entry.channel.details', expression: 'Category(.*)' },
    ];
    manageCustomColumnDefinitions(customColumnDefinitions, 'computed');
    customColumnDefinitions.forEach((column) => {
      cy.get(`[data-column-name="${column.header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${column.header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
        // CI or Category don't exist in the alert body, so it should be empty
        expect($el.text()).to.equal('--');
      });
    });
  });

  it('Add valid quote custom computed column to incident table', () => {
    const customColumnDefinitions = [
      { header: 'QuoteRegex', accessorPath: 'first_trigger_log_entry.channel.details', expression: '{"quote":"(.*)"}' },
    ];
    manageCustomColumnDefinitions(customColumnDefinitions, 'computed');
    customColumnDefinitions.forEach((column) => {
      cy.get(`[data-column-name="${column.header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${column.header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
        // eslint-disable-next-line no-unused-expressions
        expect($el.text()).to.exist;
        // Quote does exist in the alert body, so it should not be empty and also shouldn't contain the custom details JSON with quote key, just the quote value
        expect($el.text()).to.not.equal('--');
        expect($el.text()).to.not.contain('"quote"');
        expect($el.text().length).to.be.greaterThan(20);
      });
    });
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
      .then((state) => expect(state.settings.darkMode).to.equal(!currentDarkMode));
  });

  it('Update relative dates', () => {
    [true, false].forEach((relativeDates) => {
      updateRelativeDates(relativeDates);
      cy.window()
        .its('store')
        .invoke('getState')
        .then((state) => expect(state.settings.relativeDates).to.equal(relativeDates));

      if (relativeDates) {
        checkIncidentCellContentAllRows('Created At', /second[s]? ago|minute[s]? ago|hour[s]? ago/);
      }
    });
  });

  it('Add age column to incident table', () => {
    const columns = [['Age', 'age']];
    manageIncidentTableColumns(
      'add',
      columns.map((column) => column[1]),
    );
    columns
      .map((column) => column[0])
      .forEach((columnName) => {
        cy.get(`[data-column-name="${columnName}"]`).scrollIntoView().should('be.visible');
      });
    checkIncidentCellContentAllRows('Age', /second[s]?|minute[s]?|hour[s]?/);
  });

  it('Save presets', () => {
    updateDarkMode();
    const columns = [
      ['Teams', 'teams'],
      ['Num Alerts', 'num_alerts'],
      ['Group', 'service_group'],
      ['Component', 'source_component'],
    ];
    manageIncidentTableColumns(
      'add',
      columns.map((column) => column[1]),
    );
    columns
      .map((column) => column[0])
      .forEach((columnName) => {
        cy.get(`[data-column-name="${columnName}"]`).scrollIntoView().should('be.visible');
      });
    cy.get('.settings-panel-dropdown').click();
    cy.get('.dropdown-item').contains('Load/Save Presets').click();
    cy.get('#save-presets-button').click();
    cy.readFile('cypress/downloads/presets.json');
    cy.get('#close-button').click();
  });

  it('Load presets', () => {
    cy.get('.settings-panel-dropdown').click();
    cy.get('.dropdown-item').contains('Load/Save Presets').click();
    // cy.get('#load-presets-button').click();
    cy.get('input[type=file]#load-presets-file').selectFile('cypress/downloads/presets.json', {
      force: true,
    });
    checkActionAlertsModalContent('Presets loaded');
    waitForIncidentTable();
    // Check some settings configured above have been restored
    const columns = [
      ['Teams', 'teams'],
      ['Num Alerts', 'num_alerts'],
      ['Group', 'service_group'],
      ['Component', 'source_component'],
    ];
    columns
      .map((column) => column[0])
      .forEach((columnName) => {
        cy.get(`[data-column-name="${columnName}"]`).scrollIntoView().should('be.visible');
      });
    cy.window()
      .its('store')
      .invoke('getState')
      .then((state) => expect(state.settings.darkMode).to.equal(true));
  });
});
