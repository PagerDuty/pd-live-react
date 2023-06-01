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
  FaHandshake,
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
  acknowledge as acknowledgeConnected,
} from 'redux/incident_actions/actions';

const AcknowledgeButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const acknowledge = (incidents) => dispatch(acknowledgeConnected(incidents));
  const enabled = useMemo(() => {
    const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);
    return (unresolvedIncidents.length > 0);
  }, [selectedRows]);
  return (
    <Button
      size="sm"
      leftIcon={<FaHandshake />}
      mr={2}
      mb={2}
      onClick={() => acknowledge(selectedRows)}
      isDisabled={!enabled}
    >
      {t('Acknowledge')}
    </Button>
  );
};

export default AcknowledgeButton;
