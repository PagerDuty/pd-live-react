import moment from 'moment';
import 'moment/min/locales.min';

import {
  acceptDisclaimer,
  waitForIncidentTable,
  updateUserLocale,
  updateDefaultSinceDateLookback,
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

  it('Change user locale to en-US', () => {
    const localeName = 'English (United States)';
    const expectedSinceDateFormat = moment().subtract(1, 'days').format('L');
    const expectedIncidentDateFormat = moment().format('LL');

    updateUserLocale(localeName);
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

  it('Add valid custom alert column to incident table', () => {
    const customAlertColumnDefinitions = ['Quote:details.quote'];
    manageCustomAlertColumnDefinitions(customAlertColumnDefinitions);
    manageIncidentTableColumns('add', customAlertColumnDefinitions);
    customAlertColumnDefinitions.forEach((columnName) => {
      const [header] = columnName.split(':');
      cy.get(`[data-column-name="${header}"]`).scrollIntoView().should('be.visible');
      cy.get(`[data-incident-header="${header}"][data-incident-row-cell-idx="0"]`).then(($el) => {
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
});
