import {
  useEffect, useState,
} from 'react';
import {
  connect,
} from 'react-redux';

import {
  Modal,
  Button,
  ButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
  Row,
  Col,
  Form,
} from 'react-bootstrap';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import DualListBox from 'react-dual-listbox';

import {
  updateActionAlertsModal as updateActionAlertsModalConnected,
  toggleDisplayActionAlertsModal as toggleDisplayActionAlertsModalConnected,
} from 'redux/action_alerts/actions';
import {
  updateUserLocale as updateUserLocaleConnected,
} from 'redux/users/actions';
import {
  saveIncidentTable as saveIncidentTableConnected,
} from 'redux/incident_table/actions';
import {
  toggleSettingsModal as toggleSettingsModalConnected,
  setDefaultSinceDateTenor as setDefaultSinceDateTenorConnected,
  setAlertCustomDetailColumns as setAlertCustomDetailColumnsConnected,
  setMaxIncidentsLimit as setMaxIncidentsLimitConnected,
  setMaxRateLimit as setMaxRateLimitConnected,
  setAutoAcceptIncidentsQuery as setAutoAcceptIncidentsQueryConnected,
  setAutoRefreshInterval as setAutoRefreshIntervalConnected,
  clearLocalCache as clearLocalCacheConnected,
  setDarkMode as setDarkModeConnected,
} from 'redux/settings/actions';

import {
  availableIncidentTableColumns,
  availableAlertTableColumns,
} from 'config/incident-table-columns';

import {
  MAX_INCIDENTS_LIMIT_LOWER,
  MAX_INCIDENTS_LIMIT_UPPER,
  MAX_RATE_LIMIT_LOWER,
  MAX_RATE_LIMIT_UPPER,
  REFRESH_INTERVAL_LOWER,
  REFRESH_INTERVAL_UPPER,
} from 'config/constants';

import {
  defaultSinceDateTenors,
} from 'util/settings';

import {
  reactSelectStyle,
} from 'util/styles';

import {
  useTranslation,
} from 'react-i18next';

import {
  locales,
} from 'i18n.js';

import 'react-dual-listbox/lib/react-dual-listbox.css';
import './SettingsModalComponent.scss';

const columnMapper = (column, columnType) => ({
  label: column.i18n ? column.i18n : column.Header,
  value: column.Header,
  Header: column.Header,
  columnType,
});
const incidentColumnMap = (column) => columnMapper(column, 'incident');
const alertColumnMap = (column) => columnMapper(column, 'alert');

const getAllAvailableColumns = () => availableIncidentTableColumns
  .map(incidentColumnMap)
  .concat(availableAlertTableColumns.map(alertColumnMap));

const SettingsModalComponent = ({
  settings,
  incidentTable,
  toggleSettingsModal,
  users,
  updateUserLocale,
  setDefaultSinceDateTenor,
  setAlertCustomDetailColumns,
  saveIncidentTable,
  setMaxIncidentsLimit,
  setMaxRateLimit,
  setAutoAcceptIncidentsQuery,
  setAutoRefreshInterval,
  setDarkMode,
  clearLocalCache,
  updateActionAlertsModal,
  toggleDisplayActionAlertsModal,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    displaySettingsModal,
    defaultSinceDateTenor,
    maxIncidentsLimit,
    maxRateLimit,
    autoAcceptIncidentsQuery,
    autoRefreshInterval,
    alertCustomDetailFields,
    darkMode,
  } = settings;
  const {
    incidentTableColumns,
  } = incidentTable;
  const {
    currentUserLocale,
  } = users;

  // Create internal state for options
  const selectLocales = Object.keys(locales).map((locale) => ({
    label: locales[locale],
    value: locale,
  }));
  const [selectedLocale, setSelectedLocale] = useState({
    label: locales[currentUserLocale],
    value: currentUserLocale,
  });

  const [tempSinceDateTenor, setTempSinceDateTenor] = useState(defaultSinceDateTenor);

  const [isValidAutoRefreshInterval, setValidAutoRefreshInterval] = useState(true);
  const [tempAutoRefreshInterval, setTempAutoRefreshInterval] = useState(autoRefreshInterval);
  useEffect(() => {
    if (
      tempAutoRefreshInterval < REFRESH_INTERVAL_LOWER
      || tempAutoRefreshInterval > REFRESH_INTERVAL_UPPER
    ) {
      setValidAutoRefreshInterval(false);
    } else {
      setValidAutoRefreshInterval(true);
    }
  }, [tempAutoRefreshInterval]);

  const [isValidMaxIncidentsLimit, setIsValidMaxIncidentsLimit] = useState(true);
  const [tempMaxIncidentsLimit, setTempMaxIncidentsLimit] = useState(maxIncidentsLimit);
  useEffect(() => {
    if (
      tempMaxIncidentsLimit < MAX_INCIDENTS_LIMIT_LOWER
      || tempMaxIncidentsLimit > MAX_INCIDENTS_LIMIT_UPPER
    ) {
      setIsValidMaxIncidentsLimit(false);
    } else {
      setIsValidMaxIncidentsLimit(true);
    }
  }, [tempMaxIncidentsLimit]);

  const [isValidMaxRateLimit, setIsValidMaxRateLimit] = useState(true);
  const [tempMaxRateLimit, setTempMaxRateLimit] = useState(maxRateLimit);
  useEffect(() => {
    if (tempMaxRateLimit < MAX_RATE_LIMIT_LOWER || tempMaxRateLimit > MAX_RATE_LIMIT_UPPER) {
      setIsValidMaxRateLimit(false);
    } else {
      setIsValidMaxRateLimit(true);
    }
  }, [tempMaxRateLimit]);

  const [tempAutoAcceptQuery, setTempAutoAcceptQuery] = useState(autoAcceptIncidentsQuery);

  const [tempDarkMode, setTempDarkMode] = useState(darkMode);

  const [selectedColumns, setSelectedColumns] = useState(
    incidentTableColumns.map((column) => {
      // Recreate original value used from react-select in order to populate dual list
      let value;
      if (column.columnType === 'alert') {
        // Alert column based on aggregator
        if (column.accessorPath && !column.aggregator) {
          value = `${column.Header}:${column.accessorPath}`;
        } else if (column.accessorPath && column.aggregator) {
          value = `${column.Header}:${column.accessorPath}:${column.aggregator}`;
        }
      } else {
        // Incident column
        value = column.Header;
      }
      return {
        Header: column.Header,
        columnType: column.columnType,
        label: column.i18n ? column.i18n : column.Header,
        value,
      };
    }),
  );

  const [availableColumns, setAvailableColumns] = useState(getAllAvailableColumns());

  // Handle alert custom detail fields being updated
  useEffect(() => {
    const tempAvailableIncidentTableColumns = getAllAvailableColumns();
    alertCustomDetailFields.forEach((field) => {
      const tempField = { ...field };
      const [derivedHeader, derivedAccessorPath, derivedAggregator] = tempField.label.split(':');

      // Derive header, accessorPath, and aggregator for redux store
      if (derivedHeader) {
        tempField.Header = derivedHeader;
      }
      if (derivedAccessorPath) {
        tempField.accessorPath = derivedAccessorPath;
      } else {
        tempField.accessorPath = null;
      }
      if (derivedAggregator === 'agg' || derivedAggregator === 'aggregator') {
        tempField.aggregator = derivedAggregator;
      } else {
        tempField.aggregator = null;
      }
      // Verify if duplicate header is being used; disable option for column selector if so
      if (tempAvailableIncidentTableColumns.map((col) => col.Header).includes(derivedHeader)) {
        tempField.disabled = true;
      }
      tempField.columnType = 'alert';
      tempAvailableIncidentTableColumns.push(tempField);
    });
    setAvailableColumns(tempAvailableIncidentTableColumns);
  }, [alertCustomDetailFields]);

  return (
    <div className="settings-ctr">
      <Modal
        backdrop="static"
        dialogClassName="modal-90w"
        show={displaySettingsModal}
        onHide={toggleSettingsModal}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h3">{t('Settings')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="user-profile">
            <Tab eventKey="user-profile" title={t('User Profile')}>
              <br />
              <Form>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-locale-label" column sm={2}>
                    {t('Locale')}
                  </Form.Label>
                  <Col xs={6}>
                    <Select
                      id="user-locale-select"
                      classNamePrefix="react-select"
                      styles={reactSelectStyle}
                      options={selectLocales}
                      value={selectedLocale}
                      onChange={(locale) => setSelectedLocale(locale)}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-default-since-date-tenor-label" column sm={2}>
                    {t('Default Since Date Lookback')}
                  </Form.Label>
                  <Col xs={6}>
                    <ButtonGroup toggle>
                      {defaultSinceDateTenors.map((tenor) => (
                        <ToggleButton
                          key={`${tenor}`}
                          id={`default-since-date-${tenor}-button`}
                          type="radio"
                          variant="outline-secondary"
                          name="radio"
                          value={tenor}
                          checked={tempSinceDateTenor === tenor}
                          onChange={(e) => setTempSinceDateTenor(e.currentTarget.value)}
                        >
                          {t(tenor)}
                        </ToggleButton>
                      ))}
                    </ButtonGroup>
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-auto-refresh-interval-label" column sm={2}>
                    {t('Auto Refresh Interval (mins)')}
                  </Form.Label>
                  <Col xs={6}>
                    <Form.Control
                      id="user-profile-auto-refresh-interval-input"
                      type="number"
                      defaultValue={autoRefreshInterval}
                      min={REFRESH_INTERVAL_LOWER}
                      max={REFRESH_INTERVAL_UPPER}
                      step={5}
                      onChange={(e) => setTempAutoRefreshInterval(Number(e.target.value))}
                      isInvalid={!isValidAutoRefreshInterval}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-max-incidents-limit-label" column sm={2}>
                    {t('Max Incidents Limit')}
                  </Form.Label>
                  <Col xs={6}>
                    <Form.Control
                      id="user-profile-max-incidents-limit-input"
                      type="number"
                      defaultValue={maxIncidentsLimit}
                      min={MAX_INCIDENTS_LIMIT_LOWER}
                      max={MAX_INCIDENTS_LIMIT_UPPER}
                      step={100}
                      onChange={(e) => setTempMaxIncidentsLimit(Number(e.target.value))}
                      isInvalid={!isValidMaxIncidentsLimit}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-max-rate-limit-label" column sm={2}>
                    {t('Max API Call Rate')}
                  </Form.Label>
                  <Col xs={6}>
                    <Form.Control
                      id="user-profile-max-rate-limit-input"
                      type="number"
                      defaultValue={maxRateLimit}
                      min={MAX_RATE_LIMIT_LOWER}
                      max={MAX_RATE_LIMIT_UPPER}
                      step={100}
                      onChange={(e) => setTempMaxRateLimit(Number(e.target.value))}
                      isInvalid={!isValidMaxRateLimit}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-auto-accept-incident-query-label" column sm={2}>
                    {t('Auto Accept Incident Query')}
                  </Form.Label>
                  <Col xs={6}>
                    <Form.Check
                      id="user-profile-auto-accept-incident-query-checkbox"
                      type="checkbox"
                      checked={tempAutoAcceptQuery}
                      onChange={(e) => setTempAutoAcceptQuery(e.target.checked)}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label id="user-profile-dark-mode-label" column sm={2}>
                    {t('Dark Mode')}
                  </Form.Label>
                  <Col xs={6}>
                    <Form.Check
                      id="user-profile-dark-mode-checkbox"
                      type="checkbox"
                      checked={tempDarkMode}
                      onChange={(e) => setTempDarkMode(e.target.checked)}
                    />
                  </Col>
                </Form.Group>
              </Form>
              <br />
              <Button
                id="update-user-profile-button"
                variant="primary"
                disabled={(() => {
                  if (
                    !isValidAutoRefreshInterval
                    || !isValidMaxIncidentsLimit
                    || !isValidMaxRateLimit
                  ) {
                    return true;
                  }
                  return false;
                })()}
                onClick={() => {
                  updateUserLocale(selectedLocale.value);
                  setDefaultSinceDateTenor(tempSinceDateTenor);
                  setMaxIncidentsLimit(tempMaxIncidentsLimit);
                  setMaxRateLimit(tempMaxRateLimit);
                  setAutoAcceptIncidentsQuery(tempAutoAcceptQuery);
                  setAutoRefreshInterval(tempAutoRefreshInterval);
                  setDarkMode(tempDarkMode);
                  if (tempDarkMode) document.body.className = 'dark-mode';
                  else document.body.className = '';
                  updateActionAlertsModal('success', t('Updated user profile settings'));
                  toggleDisplayActionAlertsModal();
                }}
              >
                {t('Update User Profile')}
              </Button>
            </Tab>
            <Tab eventKey="incident-table" title={t('Incident Table')}>
              <br />
              <Col>
                <h4>{t('Column Selector')}</h4>
                <DualListBox
                  id="incident-column-select"
                  canFilter
                  preserveSelectOrder
                  showOrderButtons
                  showHeaderLabels
                  lang={{
                    availableFilterHeader: t('Filter available'),
                    availableHeader: t('Available'),
                    moveAllLeft: t('Move all left'),
                    moveAllRight: t('Move all right'),
                    moveBottom: t('Move to bottom'),
                    moveDown: t('Move down'),
                    moveLeft: t('Move left'),
                    moveRight: t('Move right'),
                    moveTop: t('Move to top'),
                    moveUp: t('Move up'),
                    noAvailableOptions: t('No available options'),
                    noSelectedOptions: t('No selected options'),
                    selectedFilterHeader: t('Filter selected'),
                    selectedHeader: t('Selected'),
                  }}
                  filterPlaceholder={t('Search')}
                  showNoOptionsText
                  simpleValue={false}
                  options={availableColumns}
                  selected={selectedColumns}
                  onChange={(cols) => setSelectedColumns(cols)}
                />
              </Col>
              <br />
              <Col>
                <h4>{t('Alert Custom Detail Column Definitions')}</h4>
                <CreatableSelect
                  id="alert-column-definition-select"
                  classNamePrefix="react-select"
                  isMulti
                  isClearable
                  placeholder={t('Alert Custom Detail Column Definitions Placeholder')}
                  defaultValue={alertCustomDetailFields}
                  onChange={(fields) => setAlertCustomDetailColumns(fields)}
                />
              </Col>
              <br />
              <Button
                id="update-incident-table-button"
                variant="primary"
                onClick={() => {
                  saveIncidentTable(selectedColumns);
                  updateActionAlertsModal('success', t('Updated incident table settings'));
                  toggleDisplayActionAlertsModal();
                }}
              >
                {t('Update Incident Table')}
              </Button>
            </Tab>
            <Tab eventKey="local-cache" title={t('Local Cache')}>
              <br />
              <Button
                id="clear-local-cache-button"
                variant="warning"
                onClick={() => {
                  clearLocalCache();
                  toggleSettingsModal();
                  window.location.reload();
                }}
              >
                {t('Clear Local Cache')}
              </Button>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  settings: state.settings,
  incidentTable: state.incidentTable,
  users: state.users,
});

const mapDispatchToProps = (dispatch) => ({
  toggleSettingsModal: () => dispatch(toggleSettingsModalConnected()),
  updateUserLocale: (locale) => dispatch(updateUserLocaleConnected(locale)),
  setDefaultSinceDateTenor: (defaultSinceDateTenor) => {
    dispatch(setDefaultSinceDateTenorConnected(defaultSinceDateTenor));
  },
  setAlertCustomDetailColumns: (alertCustomDetailFields) => {
    dispatch(setAlertCustomDetailColumnsConnected(alertCustomDetailFields));
  },
  saveIncidentTable: (updatedIncidentTableColumns) => {
    dispatch(saveIncidentTableConnected(updatedIncidentTableColumns));
  },
  setMaxIncidentsLimit: (maxIncidentsLimit) => {
    dispatch(setMaxIncidentsLimitConnected(maxIncidentsLimit));
  },
  setMaxRateLimit: (maxRateLimit) => {
    dispatch(setMaxRateLimitConnected(maxRateLimit));
  },
  setAutoAcceptIncidentsQuery: (autoAcceptIncidentsQuery) => {
    dispatch(setAutoAcceptIncidentsQueryConnected(autoAcceptIncidentsQuery));
  },
  setAutoRefreshInterval: (autoRefreshInterval) => {
    dispatch(setAutoRefreshIntervalConnected(autoRefreshInterval));
  },
  clearLocalCache: () => dispatch(clearLocalCacheConnected()),
  updateActionAlertsModal: (actionAlertsModalType, actionAlertsModalMessage) => {
    dispatch(updateActionAlertsModalConnected(actionAlertsModalType, actionAlertsModalMessage));
  },
  toggleDisplayActionAlertsModal: () => dispatch(toggleDisplayActionAlertsModalConnected()),
  setDarkMode: (darkMode) => {
    dispatch(setDarkModeConnected(darkMode));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsModalComponent);
