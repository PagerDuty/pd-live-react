import {
  useState, useEffect,
} from 'react';
import {
  connect,
} from 'react-redux';

import moment from 'moment';

import {
  Row,
  Col,
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Accordion,
  Container,
} from 'react-bootstrap';
import Select from 'react-select';

import DatePicker from 'react-datepicker';

import {
  useTranslation,
} from 'react-i18next';

import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faShieldAlt,
  faCheckCircle,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

import {
  updateQuerySettingsSinceDate as updateQuerySettingsSinceDateConnected,
  updateQuerySettingsIncidentStatus as updateQuerySettingsIncidentStatusConnected,
  updateQuerySettingsIncidentUrgency as updateQuerySettingsIncidentUrgencyConnected,
  updateQuerySettingsIncidentPriority as updateQuerySettingsIncidentPriorityConnected,
  updateQuerySettingsTeams as updateQuerySettingsTeamsConnected,
  updateQuerySettingsEscalationPolicies as updateQuerySettingsEscalationPoliciesConnected,
  updateQuerySettingsServices as updateQuerySettingsServicesConnected,
  updateQuerySettingsUsers as updateQuerySettingsUsersConnected,
} from 'redux/query_settings/actions';
import {
  FETCH_TEAMS_COMPLETED,
} from 'redux/teams/actions';
import {
  FETCH_ESCALATION_POLICIES_COMPLETED,
} from 'redux/escalation_policies/actions';
import {
  FETCH_SERVICES_COMPLETED,
} from 'redux/services/actions';

import {
  TRIGGERED, ACKNOWLEDGED, RESOLVED, HIGH, LOW,
} from 'util/incidents';

import {
  getObjectsFromList,
} from 'util/helpers';

import {
  reactSelectStyle,
} from 'util/styles';

import {
  DEBUG_SINCE_DATE,
} from 'config/constants';

import './QuerySettingsComponent.scss';

const QuerySettingsComponent = ({
  querySettings,
  escalationPolicies,
  services,
  teams,
  priorities,
  users,
  settings,
  updateQuerySettingsSinceDate,
  updateQuerySettingsIncidentStatus,
  updateQuerySettingsIncidentUrgency,
  updateQuerySettingsIncidentPriority,
  updateQuerySettingsTeams,
  updateQuerySettingsEscalationPolicies,
  updateQuerySettingsServices,
  updateQuerySettingsUsers,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    displayQuerySettings,
    incidentStatus,
    incidentUrgency,
    incidentPriority,
    teamIds,
    escalationPolicyIds,
    serviceIds,
    userIds,
  } = querySettings;
  const {
    teams: teamList, status: teamStatus,
  } = teams;
  const {
    escalationPolicies: escalationPolicyList, status: escalationPolicyStatus,
  } = escalationPolicies;
  const {
    services: serviceList, status: serviceStatus,
  } = services;
  const {
    currentUserLocale, users: userList,
  } = users;
  const {
    defaultSinceDateTenor, darkMode,
  } = settings;
  const eventKey = displayQuerySettings ? '0' : '1';

  // Identify when to enable selects once data has been fetched
  const isTeamSelectDisabled = teamStatus !== FETCH_TEAMS_COMPLETED;
  // eslint-disable-next-line max-len
  const isEscalationPolicySelectDisabled = escalationPolicyStatus !== FETCH_ESCALATION_POLICIES_COMPLETED;
  const isServiceSelectDisabled = serviceStatus !== FETCH_SERVICES_COMPLETED;
  const isUserSelectDisabled = !userList.length; // There are multiple states which affect this

  // Generate lists/data from store
  const selectListTeams = teamList.map((team) => ({
    label: team.name,
    value: team.id,
  }));

  const selectListEscalationPolicies = escalationPolicyList.map((escalationPolicy) => ({
    label: escalationPolicy.name,
    value: escalationPolicy.id,
  }));

  const selectListServices = serviceList.map((service) => ({
    label: service.name,
    value: service.id,
  }));

  const selectListUsers = userList.map((user) => ({
    label: user.name,
    value: user.id,
  }));

  const toggleButtonPriorities = priorities.map((priority) => ({
    label: priority.name,
    value: priority.id,
    color: priority.color,
  }));

  // Get "stored" option values
  const storedSelectTeams = getObjectsFromList(selectListTeams, teamIds, 'value');
  const storedSelectEscalationPolicies = getObjectsFromList(
    selectListEscalationPolicies,
    escalationPolicyIds,
    'value',
  );
  const storedSelectServices = getObjectsFromList(selectListServices, serviceIds, 'value');
  const storedSelectUsers = getObjectsFromList(selectListUsers, userIds, 'value');

  // Generate since date based on configured default and dispatch action for query.
  const today = moment();
  const [sinceDateNum, sinceDateTenor] = defaultSinceDateTenor
    ? defaultSinceDateTenor.split(' ')
    : ['1', 'Day'];
  const sinceDateCalc = DEBUG_SINCE_DATE
    ? new Date(DEBUG_SINCE_DATE)
    : today.subtract(Number(sinceDateNum), sinceDateTenor).toDate();
  const [sinceDate, setSinceDate] = useState(sinceDateCalc);

  useEffect(() => {
    const flattedSinceDate = moment(sinceDate)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toDate();
    updateQuerySettingsSinceDate(flattedSinceDate);
  }, [sinceDate]);

  return (
    <div className="query-settings-ctr" id="query-settings-ctr">
      <Accordion defaultActiveKey="0">
        <Accordion.Collapse id="query-settings-accordion" eventKey={eventKey}>
          <Container
            className={
              darkMode
                ? 'card bg-dark query-settings-inner-ctr'
                : 'card bg-light query-settings-inner-ctr'
            }
            fluid
          >
            <Row>
              <Col xs="auto">
                {t('Since')}
                {': '}
                <br />
                <DatePicker
                  id="query-date-input"
                  className="date-picker"
                  dateFormat="P"
                  locale={currentUserLocale}
                  todayButton="Today"
                  selected={sinceDate}
                  minDate={today.subtract(6, 'Months').toDate()}
                  maxDate={new Date()}
                  onChange={(date) => {
                    setSinceDate(date);
                  }}
                />
              </Col>
              <Col xs="auto">
                {t('State')}
                {': '}
                <Form.Group>
                  <ToggleButtonGroup
                    type="checkbox"
                    value={incidentStatus}
                    onChange={(val) => updateQuerySettingsIncidentStatus(val)}
                  >
                    <ToggleButton
                      id="query-status-triggered-button"
                      variant="outline-danger"
                      value={TRIGGERED}
                    >
                      <div className="action-icon">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      </div>
                      {t('Triggered')}
                    </ToggleButton>
                    <ToggleButton
                      id="query-status-acknowledged-button"
                      variant="outline-warning"
                      value={ACKNOWLEDGED}
                    >
                      <div className="action-icon">
                        <FontAwesomeIcon icon={faShieldAlt} />
                      </div>
                      {t('Acknowledged')}
                    </ToggleButton>
                    <ToggleButton
                      id="query-status-resolved-button"
                      variant="outline-success"
                      value={RESOLVED}
                    >
                      <div className="action-icon">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      {t('Resolved')}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Form.Group>
              </Col>
              <Col xs="auto">
                {t('Urgency')}
                {': '}
                <Form.Group>
                  <ToggleButtonGroup
                    type="checkbox"
                    value={incidentUrgency}
                    onChange={(val) => updateQuerySettingsIncidentUrgency(val)}
                  >
                    <ToggleButton
                      id="query-urgency-high-button"
                      variant="outline-secondary"
                      value={HIGH}
                    >
                      <div className="action-icon">
                        <FontAwesomeIcon icon={faChevronUp} />
                      </div>
                      {t('High')}
                    </ToggleButton>
                    <ToggleButton
                      id="query-urgency-low-button"
                      variant="outline-secondary"
                      value={LOW}
                    >
                      <div className="action-icon">
                        <FontAwesomeIcon icon={faChevronDown} />
                      </div>
                      {t('Low')}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Form.Group>
              </Col>
              <Col xs="auto">
                {t('Priorities')}
                {': '}
                <Form.Group>
                  <ToggleButtonGroup
                    type="checkbox"
                    value={incidentPriority}
                    onChange={(val) => updateQuerySettingsIncidentPriority(val)}
                  >
                    {toggleButtonPriorities.map((priority) => (
                      <ToggleButton
                        id={`query-priority-${priority.label}-button`}
                        key={priority.value}
                        variant="outline-secondary"
                        value={priority.value}
                        style={{
                          color: `#${priority.color}`,
                          fontWeight: 1000,
                        }}
                      >
                        {priority.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Form.Group>
              </Col>
              <Col>
                {t('Team')}
                {': '}
                <Form.Group>
                  <Select
                    id="query-team-select"
                    classNamePrefix="react-select"
                    styles={reactSelectStyle}
                    onChange={(selectedTeams) => {
                      const teamIdsInt = selectedTeams.map((team) => team.value);
                      updateQuerySettingsTeams(teamIdsInt);
                    }}
                    isMulti
                    options={selectListTeams}
                    value={storedSelectTeams}
                    isLoading={isTeamSelectDisabled}
                    isDisabled={isTeamSelectDisabled}
                    placeholder={`${t('Select dotdotdot')}`}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                {t('Users')}
                {': '}
                <Form.Group>
                  <Select
                    id="query-user-select"
                    classNamePrefix="react-select"
                    styles={reactSelectStyle}
                    onChange={(selectedUsers) => {
                      const userIdsInt = selectedUsers.map((user) => user.value);
                      updateQuerySettingsUsers(userIdsInt);
                    }}
                    isMulti
                    options={selectListUsers}
                    value={storedSelectUsers}
                    isLoading={isUserSelectDisabled}
                    isDisabled={isUserSelectDisabled}
                    placeholder={`${t('Select dotdotdot')}`}
                  />
                </Form.Group>
              </Col>
              <Col>
                {t('Escalation Policy')}
                {': '}
                <Form.Group>
                  <Select
                    id="query-escalation-policy-select"
                    classNamePrefix="react-select"
                    styles={reactSelectStyle}
                    onChange={(selectedEscalationPolicies) => {
                      const escalationPolicyIdsInt = selectedEscalationPolicies.map(
                        (escalationPolicy) => escalationPolicy.value,
                      );
                      updateQuerySettingsEscalationPolicies(escalationPolicyIdsInt);
                    }}
                    isMulti
                    options={selectListEscalationPolicies}
                    value={storedSelectEscalationPolicies}
                    isLoading={isEscalationPolicySelectDisabled}
                    isDisabled={isEscalationPolicySelectDisabled}
                    placeholder={`${t('Select dotdotdot')}`}
                  />
                </Form.Group>
              </Col>
              <Col>
                {t('Service')}
                {': '}
                <Form.Group>
                  <Select
                    id="query-service-select"
                    classNamePrefix="react-select"
                    styles={reactSelectStyle}
                    onChange={(selectedServices) => {
                      const serviceIdsInt = selectedServices.map((service) => service.value);
                      updateQuerySettingsServices(serviceIdsInt);
                    }}
                    isMulti
                    options={selectListServices}
                    value={storedSelectServices}
                    isLoading={isServiceSelectDisabled}
                    isDisabled={isServiceSelectDisabled}
                    placeholder={`${t('Select dotdotdot')}`}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Container>
        </Accordion.Collapse>
      </Accordion>
    </div>
  );
};

const mapStateToProps = (state) => ({
  querySettings: state.querySettings,
  services: state.services,
  escalationPolicies: state.escalationPolicies,
  teams: state.teams,
  priorities: state.priorities.priorities,
  users: state.users,
  settings: state.settings,
});

const mapDispatchToProps = (dispatch) => ({
  updateQuerySettingsSinceDate: (sinceDate) => {
    dispatch(updateQuerySettingsSinceDateConnected(sinceDate));
  },
  updateQuerySettingsIncidentStatus: (incidentStatus) => {
    dispatch(updateQuerySettingsIncidentStatusConnected(incidentStatus));
  },
  updateQuerySettingsIncidentUrgency: (incidentUrgency) => {
    dispatch(updateQuerySettingsIncidentUrgencyConnected(incidentUrgency));
  },
  updateQuerySettingsIncidentPriority: (incidentPriority) => {
    dispatch(updateQuerySettingsIncidentPriorityConnected(incidentPriority));
  },
  updateQuerySettingsTeams: (teamIds) => dispatch(updateQuerySettingsTeamsConnected(teamIds)),
  updateQuerySettingsEscalationPolicies: (escalationPolicyIds) => {
    dispatch(updateQuerySettingsEscalationPoliciesConnected(escalationPolicyIds));
  },
  updateQuerySettingsServices: (serviceIds) => {
    dispatch(updateQuerySettingsServicesConnected(serviceIds));
  },
  updateQuerySettingsUsers: (userIds) => {
    dispatch(updateQuerySettingsUsersConnected(userIds));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(QuerySettingsComponent);
