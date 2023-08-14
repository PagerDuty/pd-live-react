import React, {
  useCallback, useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tooltip,
} from '@chakra-ui/react';

import {
  CloseIcon, SearchIcon,
} from '@chakra-ui/icons';

import {
  useTranslation,
} from 'react-i18next';

import {
  updateSearchQuery as updateSearchQueryConnected,
} from 'redux/query_settings/actions';

import {
  getIncidentAlertsAsync as getIncidentAlertsAsyncConnected,
  getIncidentNotesAsync as getIncidentNotesAsyncConnected,
} from 'redux/incidents/actions';

const GlobalSearchComponent = () => {
  const searchQuery = useSelector((state) => state.querySettings.searchQuery);
  const {
    incidents, incidentAlerts, incidentNotes,
  } = useSelector((state) => state.incidents);
  const dispatch = useDispatch();
  const updateSearchQuery = (newSearchQuery) => dispatch(updateSearchQueryConnected(newSearchQuery));
  const getIncidentAlerts = useCallback(
    (incidentId) => {
      dispatch(getIncidentAlertsAsyncConnected(incidentId));
    },
    [dispatch],
  );
  const getIncidentNotes = useCallback(
    (incidentId) => {
      dispatch(getIncidentNotesAsyncConnected(incidentId));
    },
    [dispatch],
  );

  const {
    t,
  } = useTranslation();

  const incidentsNeedingAlertsFetched = useMemo(
    () => incidents.filter((incident) => incidentAlerts[incident.id] === undefined),
    [incidents, incidentAlerts],
  );
  const incidentsNeedingNotesFetched = useMemo(
    () => incidents.filter((incident) => incidentNotes[incident.id] === undefined),
    [incidents, incidentNotes],
  );

  const incidentsNeedingFetch = useMemo(
    () => (incidents.length > 0 && !!searchQuery.trim()
      ? Math.max(incidentsNeedingAlertsFetched.length, incidentsNeedingNotesFetched.length)
      : 0),
    [incidentsNeedingAlertsFetched, incidentsNeedingNotesFetched],
  );

  const fetchAlertsAndNotes = useCallback(() => {
    incidentsNeedingAlertsFetched.forEach((incident) => {
      getIncidentAlerts(incident.id);
    });
    incidentsNeedingNotesFetched.forEach((incident) => {
      getIncidentNotes(incident.id);
    });
  }, [incidentsNeedingAlertsFetched, incidentsNeedingNotesFetched]);

  return (
    <>
      {incidentsNeedingFetch > 0 && (
        <Tooltip label={`${incidentsNeedingFetch} ${t('incidents need notes/alerts fetched')}`}>
          <Button size="sm" onClick={fetchAlertsAndNotes} mr={1} w={64}>
            {t('Get notes/alerts')}
          </Button>
        </Tooltip>
      )}
      <InputGroup size="sm">
        <Input
          id="global-search-input"
          placeholder={t('Search')}
          onChange={(e) => updateSearchQuery(e.target.value)}
          value={searchQuery}
          mr={2}
        />
        <InputLeftElement>
          <SearchIcon />
        </InputLeftElement>
        <InputRightElement>
          <IconButton
            display={searchQuery ? 'block' : 'none'}
            mr={3}
            aria-label="Clear search"
            icon={<CloseIcon />}
            size="xs"
            onClick={() => {
              updateSearchQuery('');
            }}
          />
        </InputRightElement>
      </InputGroup>
    </>
  );
};

export default GlobalSearchComponent;
