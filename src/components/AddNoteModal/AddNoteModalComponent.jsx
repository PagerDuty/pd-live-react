import {
  useState, useEffect,
} from 'react';
import {
  connect,
} from 'react-redux';

import {
  Modal, Form, Button,
} from 'react-bootstrap';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayAddNoteModal as toggleDisplayAddNoteModalConnected,
  addNote as addNoteConnected,
} from 'redux/incident_actions/actions';

const AddNoteModalComponent = ({
  incidentActions,
  incidentTable,
  toggleDisplayAddNoteModal,
  addNote,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    displayAddNoteModal,
  } = incidentActions;
  const {
    selectedRows,
  } = incidentTable;

  const [note, setNote] = useState('');
  useEffect(() => {
    setNote('');
  }, [displayAddNoteModal]);

  return (
    <div className="add-note-modal-ctr">
      <Modal show={displayAddNoteModal} onHide={toggleDisplayAddNoteModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('Add Note')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              id="add-note-textarea"
              as="textarea"
              placeholder={t('Add Note to incident(s) here')}
              minLength={1}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="add-note-button"
            variant="primary"
            onClick={() => addNote(selectedRows, note)}
            disabled={note === ''}
          >
            {t('Add Note')}
          </Button>
          <Button variant="light" onClick={toggleDisplayAddNoteModal}>
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
});

const mapDispatchToProps = (dispatch) => ({
  toggleDisplayAddNoteModal: () => dispatch(toggleDisplayAddNoteModalConnected()),
  addNote: (incidents, note) => dispatch(addNoteConnected(incidents, note)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNoteModalComponent);
