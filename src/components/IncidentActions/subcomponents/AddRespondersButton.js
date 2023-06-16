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
  FaUserPlus,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  filterIncidentsByField,
} from 'util/incidents';

import {
  toggleDisplayAddResponderModal as toggleDisplayAddResponderModalConnected,
} from 'redux/incident_actions/actions';

const AddRespondersButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const toggleDisplayAddResponderModal = () => dispatch(toggleDisplayAddResponderModalConnected());
  const enabled = useMemo(() => {
    const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);
    return (unresolvedIncidents.length > 0);
  }, [selectedRows]);
  return (
    <Button
      id="incident-action-add-responders-button"
      size="sm"
      leftIcon={<FaUserPlus />}
      mr={2}
      mb={2}
      onClick={toggleDisplayAddResponderModal}
      isDisabled={!enabled}
    >
      {t('Add Responders')}
    </Button>
  );
};

export default AddRespondersButton;
