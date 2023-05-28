import React, {
  useMemo,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Button,
} from '@chakra-ui/react';

import {
  FaStickyNote,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayAddNoteModal as toggleDisplayAddNoteModalConnected,
} from 'redux/incident_actions/actions';

const AddNoteButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedCount = useSelector((state) => state.incidentTable.selectedCount);
  const dispatch = useDispatch();
  const toggleDisplayAddNoteModal = () => dispatch(toggleDisplayAddNoteModalConnected());
  const enabled = useMemo(() => selectedCount > 0, [selectedCount]);
  return (
    <Button
      size="sm"
      leftIcon={<FaStickyNote />}
      mr={2}
      mb={2}
      onClick={toggleDisplayAddNoteModal}
      isDisabled={!enabled}
    >
      {t('Add Note')}
    </Button>
  );
};

export default AddNoteButton;
