/* eslint-disable camelcase */

import {
  useState, useEffect,
} from 'react';
import {
  connect,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  Container,
  Row,
  Col,
  Button,
  Dropdown,
  DropdownButton,
  ButtonGroup,
} from 'react-bootstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faLevelUpAlt,
  faExchangeAlt,
  faUserPlus,
  faClock,
  faCheckCircle,
  faExclamation,
  faEdit,
  faPlay,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';

import './IncidentActionsComponent.scss';

import {
  acknowledge as acknowledgeConnected,
  escalate as escalateConnected,
  toggleDisplayReassignModal as toggleDisplayReassignModalConnected,
  toggleDisplayAddResponderModal as toggleDisplayAddResponderModalConnected,
  snooze as snoozeConnected,
  toggleDisplayCustomSnoozeModal as toggleDisplayCustomSnoozeModalConnected,
  toggleDisplayMergeModal as toggleDisplayMergeModalConnected,
  resolve as resolveConnected,
  updatePriority as updatePriorityConnected,
  toggleDisplayAddNoteModal as toggleDisplayAddNoteModalConnected,
  runCustomIncidentAction as runCustomIncidentActionConnected,
  syncWithExternalSystem as syncWithExternalSystemConnected,
} from 'redux/incident_actions/actions';

import {
  runResponsePlayAsync as runResponsePlayAsyncConnected,
} from 'redux/response_plays/actions';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  RESOLVED,
  HIGH,
  getSnoozeTimes,
  filterIncidentsByField,
} from 'util/incidents';

import {
  CUSTOM_INCIDENT_ACTION, EXTERNAL_SYSTEM,
} from 'util/extensions';

import {
  getObjectsFromListbyKey,
} from 'util/helpers';

import SelectedIncidentsComponent from './subcomponents/SelectedIncidentsComponent';

const animatedComponents = makeAnimated();

const IncidentActionsComponent = ({
  incidentTable,
  priorities,
  escalationPolicies,
  extensions,
  responsePlays,
  acknowledge,
  escalate,
  toggleDisplayReassignModal,
  toggleDisplayAddResponderModal,
  snooze,
  toggleDisplayCustomSnoozeModal,
  toggleDisplayMergeModal,
  resolve,
  updatePriority,
  toggleDisplayAddNoteModal,
  runCustomIncidentAction,
  runResponsePlayAsync,
  syncWithExternalSystem,
  settings,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    selectedCount, selectedRows,
  } = incidentTable;
  const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
    TRIGGERED,
    ACKNOWLEDGED,
  ]);
  const highUrgencyIncidents = filterIncidentsByField(selectedRows, 'urgency', [HIGH]);
  const {
    darkMode,
  } = settings;

  // Determine ability of each button based on selected items
  const selectedIncident = selectedCount === 1 ? selectedRows[0] : null;
  const enableActions = !(unresolvedIncidents.length > 0);
  const enablePostActions = !(selectedCount > 0);
  const enablePostSingularAction = selectedCount !== 1;
  const enableMergeAction = !(selectedCount > 0);
  const enableEscalationAction = !(
    selectedCount === 1
    && highUrgencyIncidents.length
    && selectedIncident.status !== RESOLVED
  );
  const enablePriorityAction = !(selectedCount >= 1);

  // Create internal variables and state for escalate
  const selectedEscalationPolicyId = selectedIncident ? selectedRows[0].escalation_policy.id : null;
  const selectedEscalationPolicy = getObjectsFromListbyKey(
    escalationPolicies,
    'id',
    selectedEscalationPolicyId,
  )[0];
  const selectedEscalationRules = selectedEscalationPolicy
    ? selectedEscalationPolicy.escalation_rules.slice(0).reverse()
    : [];

  const [displayEscalate, toggleEscalate] = useState(false);
  useEffect(() => {
    toggleEscalate(false);
  }, [enableEscalationAction]);

  // Create internal state for snooze - disable toggle irrespective of actions
  const snoozeTimes = getSnoozeTimes();
  const [displaySnooze, toggleSnooze] = useState(false);
  useEffect(() => {
    toggleSnooze(false);
  }, [enableActions]);

  // Create internal state for priorities
  const [displayPriority, togglePriority] = useState(false);
  useEffect(() => {
    togglePriority(false);
  }, [enableActions]);

  // Create internal state for run actions
  const [displayRunActions, toggleRunActions] = useState(false);
  useEffect(() => {
    toggleRunActions(false);
  }, [enablePostSingularAction]);

  // Generate selection list for response plays per selected incident
  const selectListResponsePlays = responsePlays.length > 0
    ? responsePlays.map((responsePlay) => ({
      label: responsePlay.summary,
      value: responsePlay.id,
      summary: responsePlay.summary,
      id: responsePlay.id,
    }))
    : [];

  // Generate extension types per selected incident's service
  const {
    serviceExtensionMap,
  } = extensions;
  const serviceExtensions = selectedIncident
    ? serviceExtensionMap[selectedIncident.service.id]
    : [];
  const customIncidentActions = serviceExtensions
    ? serviceExtensions.filter(
      (serviceExtension) => serviceExtension.extension_type === CUSTOM_INCIDENT_ACTION,
    )
    : [];
  const externalSystemsTemp = serviceExtensions
    ? serviceExtensions.filter(
      (serviceExtension) => serviceExtension.extension_type === EXTERNAL_SYSTEM,
    )
    : [];

  // Identify extensions (ext systems) that have already been sync'd with on the selected incident
  // NB - need intermediate variables to stop race condition of empty array
  const [externalSystems, setExternalSystems] = useState([]);
  useEffect(() => {
    const tempExternalSystems = selectedIncident
      ? externalSystemsTemp.map((serviceExtension) => {
        const tempServiceExtension = { ...serviceExtension };
        const result = selectedIncident.external_references
          ? selectedIncident.external_references.find(
            ({
              webhook,
            }) => webhook.id === serviceExtension.id,
          )
          : null;
        if (result) {
          tempServiceExtension.synced = true;
          tempServiceExtension.extension_label = `Synced with
            ${result.webhook.summary} (${result.external_id})`;
        } else {
          tempServiceExtension.synced = false;
        }
        return tempServiceExtension;
      })
      : [];
    setExternalSystems(tempExternalSystems);
  }, [displayRunActions, selectedIncident]);

  // Const for theme based on dark mode
  const theme = darkMode ? 'dark' : 'light';

  return (
    <div>
      <Container className="incident-actions-ctr" id="incident-actions-ctr" fluid>
        <Row>
          <Col sm={{ span: -1 }}>
            <SelectedIncidentsComponent />
          </Col>
          <Col>
            <Button
              id="incident-action-acknowledge-button"
              className="action-button"
              variant={enableActions ? 'outline-secondary' : theme}
              onClick={() => acknowledge(selectedRows)}
              disabled={enableActions}
            >
              <div className="action-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              {t('Acknowledge')}
            </Button>
            <DropdownButton
              id="incident-action-escalate-button"
              as={ButtonGroup}
              className="action-button"
              variant={enableEscalationAction ? 'outline-secondary' : theme}
              drop="up"
              title={(
                <>
                  <div className="action-icon">
                    <FontAwesomeIcon icon={faLevelUpAlt} />
                  </div>
                  {t('Escalate')}
                </>
              )}
              disabled={enableEscalationAction}
              onClick={() => toggleEscalate(!displayEscalate)}
            >
              {selectedEscalationRules.map((escalation_rule, idx) => {
                const escalationLevel = selectedEscalationRules.length - idx;
                return (
                  <Dropdown.Item
                    id={`escalation-level-${escalationLevel}-button`}
                    key={escalation_rule.id}
                    variant="light"
                    onClick={() => escalate(selectedRows, escalationLevel)}
                  >
                    {`Level ${escalationLevel}: ${escalation_rule.targets
                      .map((target) => target.summary)
                      .join(', ')}`}
                  </Dropdown.Item>
                );
              })}
            </DropdownButton>
            <Button
              id="incident-action-reassign-button"
              className="action-button"
              variant={enableActions ? 'outline-secondary' : theme}
              onClick={() => toggleDisplayReassignModal()}
              disabled={enableActions}
            >
              <div className="action-icon">
                <FontAwesomeIcon icon={faExchangeAlt} />
              </div>
              {t('Reassign')}
            </Button>
            <Button
              id="incident-action-add-responders-button"
              className="action-button"
              variant={enableActions ? 'outline-secondary' : theme}
              onClick={() => toggleDisplayAddResponderModal()}
              disabled={enableActions}
            >
              <div className="action-icon">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              {t('Add Responders')}
            </Button>
            <DropdownButton
              id="incident-action-snooze-button"
              as={ButtonGroup}
              className="action-button"
              variant={enableActions ? 'outline-secondary' : theme}
              drop="up"
              title={(
                <>
                  <div className="action-icon">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  {t('Snooze')}
                </>
              )}
              disabled={enableActions}
              onClick={() => toggleSnooze(!displaySnooze)}
            >
              {Object.keys(snoozeTimes).map((duration) => (
                <Dropdown.Item
                  id={`snooze-duration-${duration}-button`}
                  key={duration}
                  variant="light"
                  onClick={() => snooze(selectedRows, duration)}
                >
                  {snoozeTimes[duration].i18n}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item
                id="snooze-duration-custom-modal-button"
                onClick={() => toggleDisplayCustomSnoozeModal()}
              >
                {t('Custom')}
              </Dropdown.Item>
            </DropdownButton>
            <Button
              id="incident-action-merge-button"
              className="action-button"
              variant={enableMergeAction ? 'outline-secondary' : theme}
              onClick={() => toggleDisplayMergeModal()}
              disabled={enableMergeAction}
            >
              <div className="action-icon">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              {t('Merge')}
            </Button>
            <Button
              id="incident-action-resolve-button"
              className="action-button"
              variant={enableActions ? 'outline-secondary' : theme}
              disabled={enableActions}
              onClick={() => resolve(selectedRows)}
            >
              <div className="action-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              {t('Resolve')}
            </Button>
          </Col>
          <Col sm={{ span: 3.5 }}>
            <DropdownButton
              id="incident-action-update-priority-button"
              as={ButtonGroup}
              className="action-button"
              variant={enablePriorityAction ? 'outline-secondary' : theme}
              drop="up"
              title={(
                <>
                  <div className="action-icon">
                    <FontAwesomeIcon icon={faExclamation} />
                  </div>
                  {t('Update Priority')}
                </>
              )}
              disabled={enablePriorityAction}
              onClick={() => togglePriority(!displayPriority)}
            >
              {priorities.map((priority) => (
                <Dropdown.Item
                  id={`update-priority-${priority.name}-button`}
                  key={priority.id}
                  variant="light"
                  onClick={() => updatePriority(selectedRows, priority.id)}
                >
                  <p
                    style={{
                      backgroundColor: `#${priority.color}`,
                      color: 'white',
                    }}
                    className="priority-label-dropdown"
                  >
                    {priority.name}
                  </p>
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <Button
              id="incident-action-add-note-button"
              className="action-button"
              variant={enablePostActions ? 'outline-secondary' : theme}
              onClick={() => toggleDisplayAddNoteModal()}
              disabled={enablePostActions}
            >
              <div className="action-icon">
                <FontAwesomeIcon icon={faEdit} />
              </div>
              {t('Add Note')}
            </Button>
            <DropdownButton
              id="incident-action-run-action-button"
              as={ButtonGroup}
              className="action-button"
              variant={enablePostSingularAction ? 'outline-secondary' : theme}
              drop="up"
              title={(
                <>
                  <div className="action-icon">
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                  {t('Run Action')}
                </>
              )}
              align="end"
              disabled={enablePostSingularAction}
              show={displayRunActions}
              onClick={(e) => {
                if (e.target.id === 'incident-action-run-action-button') {
                  toggleRunActions(!displayRunActions);
                }
              }}
            >
              {selectListResponsePlays.length > 0 ? (
                <>
                  <Dropdown.Header>{t('Response Plays')}</Dropdown.Header>
                  <Dropdown.Item>
                    <Select
                      id="response-play-select"
                      classNamePrefix="react-select"
                      className="response-play-dropdown"
                      menuPlacement="top"
                      components={animatedComponents}
                      options={selectListResponsePlays}
                      onChange={(selectedResponsePlay) => {
                        runResponsePlayAsync(selectedRows, selectedResponsePlay);
                        toggleRunActions(!displayRunActions);
                      }}
                      placeholder={`${t('Select dotdotdot')}`}
                    />
                  </Dropdown.Item>
                  <Dropdown.Divider />
                </>
              ) : (
                <></>
              )}
              {customIncidentActions.length > 0 ? (
                <>
                  <Dropdown.Header>{t('Actions')}</Dropdown.Header>
                  {customIncidentActions.map((customIncidentAction) => (
                    <Dropdown.Item
                      id={`custom-incident-action-${customIncidentAction.name}-button`}
                      key={customIncidentAction.id}
                      onClick={() => {
                        runCustomIncidentAction(selectedRows, customIncidentAction);
                        toggleRunActions(!displayRunActions);
                      }}
                    >
                      {customIncidentAction.name}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                </>
              ) : (
                <></>
              )}
              {externalSystems.length > 0 ? (
                <>
                  <Dropdown.Header>{t('External Systems')}</Dropdown.Header>
                  {externalSystems.map((externalSystem) => (
                    <Dropdown.Item
                      id={`external-system-${externalSystem.extension_label}-button`}
                      key={externalSystem.id}
                      disabled={externalSystem.synced}
                      onClick={() => {
                        syncWithExternalSystem(selectedRows, externalSystem);
                        toggleRunActions(!displayRunActions);
                      }}
                    >
                      {externalSystem.extension_label}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                </>
              ) : (
                <></>
              )}
            </DropdownButton>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => ({
  incidentTable: state.incidentTable,
  priorities: state.priorities.priorities,
  escalationPolicies: state.escalationPolicies.escalationPolicies,
  extensions: state.extensions,
  responsePlays: state.responsePlays.responsePlays,
  settings: state.settings,
});

const mapDispatchToProps = (dispatch) => ({
  acknowledge: (incidents) => dispatch(acknowledgeConnected(incidents)),
  escalate: (incidents, escalationLevel) => dispatch(escalateConnected(incidents, escalationLevel)),
  toggleDisplayReassignModal: () => dispatch(toggleDisplayReassignModalConnected()),
  toggleDisplayAddResponderModal: () => dispatch(toggleDisplayAddResponderModalConnected()),
  snooze: (incidents, duration) => dispatch(snoozeConnected(incidents, duration)),
  toggleDisplayCustomSnoozeModal: () => dispatch(toggleDisplayCustomSnoozeModalConnected()),
  toggleDisplayMergeModal: () => dispatch(toggleDisplayMergeModalConnected()),
  resolve: (incidents) => dispatch(resolveConnected(incidents)),
  updatePriority: (incidents, priorityId) => {
    dispatch(updatePriorityConnected(incidents, priorityId));
  },
  toggleDisplayAddNoteModal: () => dispatch(toggleDisplayAddNoteModalConnected()),
  runCustomIncidentAction: (incidents, webhook) => {
    dispatch(runCustomIncidentActionConnected(incidents, webhook));
  },
  runResponsePlayAsync: (incidents, responsePlay) => {
    dispatch(runResponsePlayAsyncConnected(incidents, responsePlay));
  },
  syncWithExternalSystem: (incidents, webhook) => {
    dispatch(syncWithExternalSystemConnected(incidents, webhook));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(IncidentActionsComponent);
