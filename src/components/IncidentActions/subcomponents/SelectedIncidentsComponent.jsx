import React from 'react';

import {
  useSelector,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  // Box,
  CircularProgress,
  Flex,
  Tag, // useColorModeValue, useToken,
} from '@chakra-ui/react';

import {
  ACKNOWLEDGE_REQUESTED,
  ESCALATE_REQUESTED,
  REASSIGN_REQUESTED,
  ADD_RESPONDER_REQUESTED,
  SNOOZE_REQUESTED,
  MERGE_REQUESTED,
  RESOLVE_REQUESTED,
  UPDATE_PRIORITY_REQUESTED,
  ADD_NOTE_REQUESTED,
  RUN_CUSTOM_INCIDENT_ACTION_REQUESTED,
  SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED,
} from 'src/redux/incident_actions/actions';

const SelectedIncidentsComponent = () => {
  const {
    t,
  } = useTranslation();
  const {
    fetchingIncidents,
    fetchingIncidentNotes,
    fetchingIncidentAlerts,
    filteredIncidentsByQuery,
    refreshingIncidents,
  } = useSelector((state) => state.incidents);
  const {
    selectedCount,
  } = useSelector((state) => state.incidentTable);
  const {
    error: queryError,
  } = useSelector((state) => state.querySettings);
  const {
    status: incidentActionsStatus,
  } = useSelector((state) => state.incidentActions);

  const textForActionInProgress = (action) => {
    switch (action) {
      case ACKNOWLEDGE_REQUESTED:
        return t('Acknowledging');
      case ESCALATE_REQUESTED:
        return t('Escalating');
      case REASSIGN_REQUESTED:
        return t('Reassigning');
      case ADD_RESPONDER_REQUESTED:
        return t('Adding responders');
      case SNOOZE_REQUESTED:
        return t('Snoozing');
      case MERGE_REQUESTED:
        return t('Merging');
      case RESOLVE_REQUESTED:
        return t('Resolving');
      case UPDATE_PRIORITY_REQUESTED:
        return t('Updating priority');
      case ADD_NOTE_REQUESTED:
        return t('Adding note');
      case RUN_CUSTOM_INCIDENT_ACTION_REQUESTED:
        return t('Running custom action');
      case SYNC_WITH_EXTERNAL_SYSTEM_REQUESTED:
        return t('Syncing with external system');
      default:
        return null;
    }
  };

  const FetchIndicator = ({
    message,
  }) => (
    <Flex px={1} alignItems="center" justifyContent="center">
      <CircularProgress isIndeterminate size={8} color="green.300" mr={1} />
      {message}
    </Flex>
  );

  const SelectedIndicator = () => (
    <Flex px={1} alignContent="center" alignItems="center" justifyContent="center" m={0}>
      <Tag size="md" colorScheme="blue" mb={0} mr={1} className="selected-incidents-badge">
        {`${selectedCount}/${filteredIncidentsByQuery.length} ${t('Selected')}`}
      </Tag>
    </Flex>
  );

  return (
    <div className="selected-incidents-ctr">
      {queryError}
      {fetchingIncidents && <FetchIndicator message={t('Querying')} />}
      {incidentActionsStatus.endsWith('_REQUESTED')
        && !!textForActionInProgress(incidentActionsStatus) && (
          <FetchIndicator message={textForActionInProgress(incidentActionsStatus)} />
      )}
      {refreshingIncidents && <FetchIndicator message={t('Refreshing')} />}
      {!fetchingIncidents
        && !fetchingIncidentNotes
        && !fetchingIncidentAlerts
        && !refreshingIncidents && <SelectedIndicator />}
    </div>
  );
};

export default SelectedIncidentsComponent;
