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
  toggleDisplayReassignModal as toggleDisplayReassignModalConnected,
  reassign as reassignConnected,
} from 'redux/incident_actions/actions';

import './ReassignModalComponent.scss';

const animatedComponents = makeAnimated();

const ReassignModalComponent = ({
  incidentActions,
  incidentTable,
  escalationPolicies,
  users,
  toggleDisplayReassignModal,
  reassign,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    displayReassignModal,
  } = incidentActions;
  const {
    selectedRows,
  } = incidentTable;

  const [assignment, setAssignment] = useState(null);

  // Generate lists/data from store
  const selectListAssignments = escalationPolicies
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
    <div className="resassign-modal-ctr">
      <Modal
        show={displayReassignModal}
        onHide={() => {
          setAssignment(null);
          toggleDisplayReassignModal();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('Reassign To')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Select
              id="reassign-select"
              classNamePrefix="react-select"
              onChange={(selectedAssignment) => {
                setAssignment(selectedAssignment);
              }}
              components={animatedComponents}
              options={selectListAssignments}
              placeholder={t('Search for Escalation Policy or User')}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="reassign-button"
            variant="primary"
            disabled={assignment === null}
            onClick={() => {
              setAssignment(null);
              reassign(selectedRows, assignment);
            }}
          >
            {t('Reassign')}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setAssignment(null);
              toggleDisplayReassignModal();
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
});

const mapDispatchToProps = (dispatch) => ({
  toggleDisplayReassignModal: () => dispatch(toggleDisplayReassignModalConnected()),
  reassign: (incidents, assignment) => dispatch(reassignConnected(incidents, assignment)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReassignModalComponent);
