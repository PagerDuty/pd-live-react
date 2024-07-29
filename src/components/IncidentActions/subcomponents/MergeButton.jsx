import React, {
  // useEffect,
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button,
} from '@chakra-ui/react';

import {
  BsSignMergeRightFill,
} from 'react-icons/bs';

import {
  useTranslation,
} from 'react-i18next';

import {
  updateActionAlertsModal as updateActionAlertsModalConnected,
  toggleDisplayActionAlertsModal as toggleDisplayActionAlertsModalConnected,
} from 'src/redux/action_alerts/actions';

import {
  toggleDisplayMergeModal as toggleDisplayMergeModalConnected,
} from 'src/redux/incident_actions/actions';

const MergeButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedCount = useSelector((state) => state.incidentTable.selectedCount);
  const {
    selectedRows,
  } = useSelector((state) => state.incidentTable);
  const dispatch = useDispatch();
  const updateActionAlertsModal = (actionAlertsModalType, actionAlertsModalMessage) => dispatch(updateActionAlertsModalConnected(actionAlertsModalType, actionAlertsModalMessage));
  const toggleDisplayActionAlertsModal = () => dispatch(toggleDisplayActionAlertsModalConnected());
  const toggleDisplayMergeModal = () => dispatch(toggleDisplayMergeModalConnected());
  const displayActionModal = (actionAlertsModalType, actionAlertsModalMessage) => {
    updateActionAlertsModal(actionAlertsModalType, actionAlertsModalMessage);
    toggleDisplayActionAlertsModal();
  };

  const enabled = useMemo(() => selectedCount > 0, [selectedCount]);

  const selectedIncidentsTotalAlerts = useMemo(() => {
    if (!(selectedRows instanceof Array)) {
      return 0;
    }
    return selectedRows.reduce((acc, incident) => acc + (incident.alert_counts?.all || 0), 0);
  }, [selectedRows]);

  const handleClick = () => {
    if (selectedIncidentsTotalAlerts > 1000) {
      displayActionModal('error', t('Cannot merge incidents containing more than 1000 alerts'));
    } else {
      toggleDisplayMergeModal();
    }
  };

  return (
    <Button
      id="incident-action-merge-button"
      size="sm"
      leftIcon={<BsSignMergeRightFill />}
      mr={2}
      mb={2}
      onClick={handleClick}
      isDisabled={!enabled}
    >
      {t('Merge')}
    </Button>
  );
};

export default MergeButton;
