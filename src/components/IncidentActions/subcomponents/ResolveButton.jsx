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
  FaCheckCircle,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  TRIGGERED, ACKNOWLEDGED, filterIncidentsByField,
} from 'src/util/incidents';

import {
  resolve as resolveConnected,
} from 'src/redux/incident_actions/actions';

const ResolveButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const resolve = (incidents) => dispatch(resolveConnected(incidents));
  const enabled = useMemo(() => {
    const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);
    return unresolvedIncidents.length > 0;
  }, [selectedRows]);
  return (
    <Button
      id="incident-action-resolve-button"
      size="sm"
      leftIcon={<FaCheckCircle />}
      mr={2}
      mb={2}
      onClick={() => resolve(selectedRows)}
      isDisabled={!enabled}
    >
      {t('Resolve')}
    </Button>
  );
};

export default ResolveButton;
