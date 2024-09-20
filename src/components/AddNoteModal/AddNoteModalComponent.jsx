import React, {
  useState, useEffect,
} from 'react';
import {
  connect,
} from 'react-redux';

import {
  Button,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayAddNoteModal as toggleDisplayAddNoteModalConnected,
  addNote as addNoteConnected,
} from 'src/redux/incident_actions/actions';

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
      <Modal isOpen={displayAddNoteModal} onClose={() => { toggleDisplayAddNoteModal(); }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Add Note')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Textarea
                id="add-note-textarea"
                placeholder={t('Add Note to incident(s) here')}
                minLength={1}
                onChange={(e) => {
                  setNote(e.target.value);
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              id="add-note-button"
              colorScheme="blue"
              onClick={() => addNote(selectedRows, note)}
              disabled={note === ''}
            >
              {t('Add Note')}
            </Button>
            <Button variant="light" onClick={toggleDisplayAddNoteModal}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
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
