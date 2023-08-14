import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button,
} from '@chakra-ui/react';

import {
  AtSignIcon,
} from '@chakra-ui/icons';

import {
  useTranslation,
} from 'react-i18next';

import {
  TRIGGERED, ACKNOWLEDGED, filterIncidentsByField,
} from 'src/util/incidents';

import {
  toggleDisplayReassignModal as toggleDisplayReassignModalConnected,
} from 'src/redux/incident_actions/actions';

const ReassignButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const toggleDisplayReassignModal = () => dispatch(toggleDisplayReassignModalConnected());
  const enabled = useMemo(() => {
    const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);
    return unresolvedIncidents.length > 0;
  }, [selectedRows]);
  return (
    <Button
      id="incident-action-reassign-button"
      size="sm"
      leftIcon={<AtSignIcon />}
      mr={2}
      mb={2}
      onClick={toggleDisplayReassignModal}
      isDisabled={!enabled}
    >
      {t('Reassign')}
    </Button>
  );
};

export default ReassignButton;
