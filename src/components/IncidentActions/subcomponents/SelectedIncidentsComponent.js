import React, {
  useMemo,
} from 'react';

import {
  Badge, // Spinner,
} from 'react-bootstrap';

import {
  useSelector,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  Box, CircularProgress, Flex, Tag, useColorModeValue, useToken,
} from '@chakra-ui/react';

import {
  PieChart,
} from 'react-minimal-pie-chart';

const SelectedIncidentsComponent = () => {
  const {
    t,
  } = useTranslation();
  const {
    fetchingIncidents,
    fetchingIncidentNotes,
    fetchingIncidentAlerts,
    incidents,
    filteredIncidentsByQuery,
    refreshingIncidents,
    incidentNotes,
    incidentAlerts,
  } = useSelector((state) => state.incidents);
  const {
    selectedCount,
  } = useSelector((state) => state.incidentTable);
  const {
    error: queryError,
  } = useSelector((state) => state.querySettings);

  const tableData = useMemo(
    () => incidents.map((incident) => ({
      ...incident,
      alerts: incidentAlerts[incident.id],
      notes: incidentNotes[incident.id],
    })),
    [incidents, incidentAlerts, incidentNotes],
  );

  const notesRequested = useMemo(
    () => tableData.reduce(
      (acc, incident) => (incident.notes?.status === 'fetching' ? acc + 1 : acc),
      0,
    ),
    [tableData],
  );
  const alertsRequested = useMemo(
    () => tableData.reduce(
      (acc, incident) => (incident.alerts?.status === 'fetching' ? acc + 1 : acc),
      0,
    ),
    [tableData],
  );

  const notesStatus = useMemo(() => {
    const statuses = {
      fetching: 0,
      fetched: 0,
      error: 0,
      notFetching: 0,
    };
    tableData.forEach((incident) => {
      if (incident.notes?.status === 'fetching') statuses.fetching += 1;
      else if (incident.notes instanceof Array) statuses.fetched += 1;
      else if (incident.notes?.status === 'error') statuses.error += 1;
      else statuses.notFetching += 1;
    });
    return statuses;
  }, [tableData]);

  const alertsStatus = useMemo(() => {
    const statuses = {
      fetching: 0,
      fetched: 0,
      error: 0,
      notFetching: 0,
    };
    tableData.forEach((incident) => {
      if (incident.alerts?.status === 'fetching') statuses.fetching += 1;
      else if (incident.alerts instanceof Array) statuses.fetched += 1;
      else if (incident.alerts?.status === 'error') statuses.error += 1;
      else statuses.notFetching += 1;
    });
    return statuses;
  }, [tableData]);

  const fetchingDataRender = (variant, message) => (
    <Flex px={1} alignItems="center" justifyContent="center">
      <CircularProgress isIndeterminate size={8} color="green.300" mr={1} />
      {message}
    </Flex>
  );

  const useColorModeToken = (lightColor, darkColor) => useColorModeValue(useToken('colors', lightColor), useToken('colors', darkColor));
  const pieChartColors = {
    fetching: useColorModeToken('blue.300', 'blue.600'),
    fetched: useColorModeToken('green.200', 'green.500'),
    error: useColorModeToken('red.300', 'red.600'),
    notFetching: useColorModeToken('gray.200', 'whiteAlpha.300'),
  };

  const pieChartLabels = {
    fetching: 'Fetching',
    fetched: 'Fetched',
    error: 'Error',
    notFetching: 'Not yet requested',
  };

  const progressRender = (message, max, values, colors = pieChartColors) => {
    const chartData = ['fetched', 'error', 'fetching', 'notFetching'].map((key) => ({
      title: `${pieChartLabels[key]}: ${values[key]}`,
      value: values[key],
      color: colors[key],
    }));
    return (
      <Flex px={1} alignItems="center" justifyContent="center">
        <Box h={8} w={8} mr={1}>
          <PieChart data={chartData} lineWidth={35} />
        </Box>
        {message}
      </Flex>
    );
  };

  const selectedIncidentsRender = (
    <Flex px={1} alignContent="center" alignItems="center" justifyContent="center" m={0}>
      <Tag size="md" colorScheme="blue" mb={0} mr={1} className="selected-incidents-badge">
        {`${selectedCount}/${filteredIncidentsByQuery.length} ${t('Selected')}`}
      </Tag>
    </Flex>
  );

  const cancelledQueryRender = (
    <div className="selected-incidents-ctr">
      <h4>
        <Badge className="selected-incidents-badge" variant="warning">
          {t('N/A')}
        </Badge>
      </h4>
    </div>
  );

  return (
    <div className="selected-incidents-ctr">
      {queryError && cancelledQueryRender}
      {fetchingIncidents && fetchingDataRender('success', t('Querying'))}
      {fetchingIncidentNotes && fetchingDataRender('primary', t('Fetching Notes'))}
      {fetchingIncidentAlerts && fetchingDataRender('info', t('Fetching Alerts'))}
      {refreshingIncidents && fetchingDataRender('success', t('Refreshing'))}
      {notesRequested > 0 && progressRender(t('Fetching Notes'), tableData.length, notesStatus)}
      {alertsRequested > 0 && progressRender(t('Fetching Alerts'), tableData.length, alertsStatus)}
      {!fetchingIncidents
        && !fetchingIncidentNotes
        && !fetchingIncidentAlerts
        && !refreshingIncidents
        && selectedIncidentsRender}
    </div>
  );
};

export default SelectedIncidentsComponent;
