import {
  useState,
} from 'react';
import {
  connect,
} from 'react-redux';

import {
  Modal, Form, Button,
} from 'react-bootstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayAddResponderModal as toggleDisplayAddResponderModalConnected,
  addResponder as addResponderConnected,
} from 'redux/incident_actions/actions';

import './AddResponderModalComponent.scss';

const animatedComponents = makeAnimated();

const AddResponderModalComponent = ({
  incidentActions,
  incidentTable,
  escalationPolicies,
  users,
  currentUser,
  toggleDisplayAddResponderModal,
  addResponder,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    displayAddResponderModal,
  } = incidentActions;
  const {
    selectedRows,
  } = incidentTable;
  const {
    id: currentUserId,
  } = currentUser;

  const messageMaxChars = 110;

  const [responderRequestTargets, setResponderRequestTargets] = useState([]);
  const [message, setMessage] = useState('');

  // Generate lists/data from store
  const selectListResponderRequestTargets = escalationPolicies
    .map((escalationPolicy) => ({
      label: `EP: ${escalationPolicy.name}`,
      name: escalationPolicy.name,
      value: escalationPolicy.id,
      type: 'escalation_policy',
    }))
    .concat(
      users.map((user) => ({
        label: `User: ${user.name}`,
        name: user.name,
        value: user.id,
        type: 'user',
      })),
    );

  return (
    <div className="add-responder-modal-ctr">
      <Modal
        show={displayAddResponderModal}
        onHide={() => {
          setResponderRequestTargets([]);
          toggleDisplayAddResponderModal();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('Add Responders')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>{t('Responders')}</Form.Label>
              <Select
                id="add-responders-select"
                classNamePrefix="react-select"
                onChange={(selectedTargets) => {
                  setResponderRequestTargets(selectedTargets);
                }}
                components={animatedComponents}
                options={selectListResponderRequestTargets}
                placeholder={t('Search for Escalation Policies and/or Users')}
                isMulti
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Message</Form.Label>
              <Form.Control
                id="add-responders-textarea"
                as="textarea"
                placeholder={t('Provide brief message for additional responders')}
                minLength={1}
                maxLength={messageMaxChars}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
              <div className="add-responder-message-remaining-chars">
                {`${messageMaxChars - message.length} `}
                {t('characters remaining')}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="add-responders-button"
            variant="primary"
            disabled={responderRequestTargets.length === 0}
            onClick={() => {
              setResponderRequestTargets([]);
              addResponder(selectedRows, currentUserId, responderRequestTargets, message);
            }}
          >
            {t('Add Responders')}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setResponderRequestTargets([]);
              toggleDisplayAddResponderModal();
            }}
          >
            {t('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  incidentActions: state.incidentActions,
  incidentTable: state.incidentTable,
  escalationPolicies: state.escalationPolicies.escalationPolicies,
  users: state.users.users,
  currentUser: state.users.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  toggleDisplayAddResponderModal: () => dispatch(toggleDisplayAddResponderModalConnected()),
  addResponder: (incidents, requesterId, responderRequestTargets, message) => {
    dispatch(addResponderConnected(incidents, requesterId, responderRequestTargets, message));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddResponderModalComponent);
