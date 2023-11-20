/* eslint-disable no-restricted-syntax */

import React, {
  useEffect, useState, useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  Button,
  Checkbox,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';

import {
  Select,
} from 'chakra-react-select';

import {
  CheckCircleIcon, WarningTwoIcon,
} from '@chakra-ui/icons';

import {
  setShowIncidentAlertsModalForIncidentId as setShowIncidentAlertsModalForIncidentIdConnected,
} from 'src/redux/settings/actions';

import {
  moveAlerts as moveAlertsConnected,
} from 'src/redux/incident_actions/actions';

// given an object, return an array of all key paths
const getAllKeyPaths = (obj, currentPath = [], paths = []) => {
  if (typeof obj === 'object' && obj !== null) {
    // Iterate over the object entries
    for (const [key, value] of Object.entries(obj)) {
      // For each key-value pair, construct the new path
      const newPath = [...currentPath, key];

      // If the value is an object (or array), recurse with the new path
      if (typeof value === 'object' && value !== null) {
        getAllKeyPaths(value, newPath, paths);
      } else {
        // Otherwise, we've reached a leaf in the object structure,
        // so add the current path to the results
        paths.push(newPath.join('.'));
      }
    }
  } else {
    paths.push(currentPath.join('.'));
  }

  return paths;
};

// given an array of alerts, return a CSV string
const alertsToCsv = (alerts) => {
  const uniqueAllAlertsCefDetailsPaths = [];
  alerts.forEach((alert) => {
    const alertCefDetailsPaths = getAllKeyPaths(alert.body.cef_details);
    alertCefDetailsPaths.forEach((path) => {
      if (path && !uniqueAllAlertsCefDetailsPaths.includes(`body.cef_details.${path}`)) {
        uniqueAllAlertsCefDetailsPaths.push(`body.cef_details.${path}`);
      }
    });
  });
  uniqueAllAlertsCefDetailsPaths.sort();
  const paths = [
    'id',
    'created_at',
    'resolved_at',
    'summary',
    'status',
    'severity',
    'html_url',
    'service.id',
    'service.summary',
    'incident.id',
    'incident.summary',
    'incident.html_url',
    ...uniqueAllAlertsCefDetailsPaths,
  ];

  const header = paths.join(',');
  const rows = alerts.map((alert) => paths
    .map((path) => {
      let value = null;
      try {
        value = path.split('.').reduce((o, i) => o[i], alert);
      } catch (e) {
        /* ignore */
      }
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
    .join(','));
  return `${header}\n${rows.join('\n')}`;
};

const IncidentAlertsModal = () => {
  const {
    t,
  } = useTranslation();

  const {
    showIncidentAlertsModalForIncidentId,
  } = useSelector((state) => state.settings);
  const {
    filteredIncidentsByQuery, incidentAlerts,
  } = useSelector((state) => state.incidents);
  const serviceList = useSelector((state) => state.services.services);
  const serviceListOptions = useMemo(() => {
    if (serviceList instanceof Array) {
      const serviceListSorted = [...serviceList].sort((a, b) => a.name.localeCompare(b.name));
      return serviceListSorted.map((service) => ({
        label: service.name,
        value: service.id,
      }));
    }
    // eslint-disable-next-line no-console
    console.error('serviceList is not an array', serviceList);
    return [];
  }, [serviceList]);

  const epList = useSelector((state) => state.escalationPolicies.escalationPolicies);
  const epListOptions = useMemo(() => {
    if (epList instanceof Array) {
      const epListSorted = [...epList].sort((a, b) => a.name.localeCompare(b.name));
      return epListSorted.map((ep) => ({
        label: ep.name,
        value: ep.id,
      }));
    }
    // eslint-disable-next-line no-console
    console.error('epList is not an array', epList);
    return [];
  }, [epList]);

  const {
    priorities: priorityList,
  } = useSelector((state) => state.priorities);
  const priorityListOptions = useMemo(() => {
    if (priorityList instanceof Array) {
      const priorityListSorted = [...priorityList].sort((a, b) => a.name.localeCompare(b.name));
      return priorityListSorted.map((priority) => ({
        label: priority.name,
        value: priority.id,
      }));
    }
    // eslint-disable-next-line no-console
    console.error('priorityList is not an array', priorityList);
    return [];
  }, [priorityList]);

  const dispatch = useDispatch();
  const setShowIncidentAlertsModalForIncidentId = (incidentId) => {
    dispatch(setShowIncidentAlertsModalForIncidentIdConnected(incidentId));
  };
  const moveAlerts = (fromIncidentId, toIncidentId, alertIds, options) => {
    const alertsToMove = incidentAlerts[fromIncidentId].filter((a) => alertIds.includes(a.id));
    dispatch(moveAlertsConnected(fromIncidentId, toIncidentId, alertsToMove, options));
  };

  const incident = filteredIncidentsByQuery.find(
    (i) => i.id === showIncidentAlertsModalForIncidentId,
  );
  const alerts = incidentAlerts[showIncidentAlertsModalForIncidentId];

  const moveToNewIncidentOptions = {
    label: t('New Incidents'),
    options: [
      {
        label: t('Move all selected alerts to one new incident'),
        value: 'new',
      },
      {
        label: t('Move each selected alert to its own new incident'),
        value: 'new-each',
      },
    ],
  };

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [incidentSelectOptions, setIncidentSelectOptions] = useState([moveToNewIncidentOptions]);
  const [moveTarget, setMoveTarget] = useState(null);
  const [moveTargetOptions, setMoveTargetOptions] = useState({});

  useEffect(() => {
    if (moveTarget?.value === 'new') {
      setMoveTargetOptions((prev) => ({
        ...prev,
        summary: alerts.find((a) => a.id === selectedAlerts[0]).summary,
      }));
    } else {
      setMoveTargetOptions((prev) => {
        const newOptions = { ...prev };
        delete newOptions.summary;
        return newOptions;
      });
    }
  }, [moveTarget]);

  useEffect(() => {
    if (showIncidentAlertsModalForIncidentId) {
      const newIncidentSelectOptions = [moveToNewIncidentOptions];
      const openIncidentsOptions = filteredIncidentsByQuery
        .filter((i) => i.status !== 'resolved' && i.id !== showIncidentAlertsModalForIncidentId)
        .map((i) => ({
          label: i.summary,
          value: i.id,
        }));

      if (openIncidentsOptions.length > 0) {
        newIncidentSelectOptions.push({
          label: t('Open Incidents'),
          options: openIncidentsOptions,
        });
      }
      setIncidentSelectOptions(newIncidentSelectOptions);
    }
  }, [showIncidentAlertsModalForIncidentId, filteredIncidentsByQuery]);

  if (!(alerts instanceof Array && alerts.length > 0 && showIncidentAlertsModalForIncidentId)) {
    return null;
  }

  const alertsSortedDescendingDate = [...alerts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <>
      <Modal
        isOpen={!!showIncidentAlertsModalForIncidentId}
        onClose={() => {
          setMoveTarget(null);
          setMoveTargetOptions({});
          setSelectedAlerts([]);
          setShowIncidentAlertsModalForIncidentId(null);
        }}
        size="xxl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('Alerts for incident X', { incident_number: incident.incident_number })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>
                      <Checkbox
                        id="alerts-modal-checkbox-all"
                        isChecked={selectedAlerts.length === alertsSortedDescendingDate.length}
                        isIndeterminate={
                          selectedAlerts.length > 0
                          && selectedAlerts.length < alertsSortedDescendingDate.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlerts(alertsSortedDescendingDate.map((alert) => alert.id));
                          } else {
                            setSelectedAlerts([]);
                          }
                        }}
                      />
                    </Th>
                    <Th>Created At</Th>
                    <Th>Status</Th>
                    <Th>Summary</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {alertsSortedDescendingDate.map((alert, alertIndex) => (
                    <Tr key={alert.id}>
                      <Td>
                        <Checkbox
                          id={`alerts-modal-checkbox-${alert.id}`}
                          data-alert-row-idx={alertIndex}
                          data-alert-id={alert.id}
                          isChecked={selectedAlerts.includes(alert.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAlerts([...selectedAlerts, alert.id]);
                            } else {
                              setSelectedAlerts(selectedAlerts.filter((id) => id !== alert.id));
                            }
                          }}
                        />
                      </Td>
                      <Td>{new Date(alert.created_at).toLocaleString()}</Td>
                      <Td aria-label={alert.status}>
                        {alert.status === 'triggered' ? (
                          <WarningTwoIcon color="red.500" />
                        ) : (
                          <CheckCircleIcon color="green.500" />
                        )}
                      </Td>
                      <Td maxW={500} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        <Link href={alert.html_url} isExternal>
                          {alert.summary}
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button
              id="alerts-modal-download-csv-btn"
              colorScheme="blue"
              mr={3}
              onClick={() => {
                const alertsCsv = alertsToCsv(
                  alerts.filter(
                    (a) => selectedAlerts.length === 0 || selectedAlerts.includes(a.id),
                  ),
                );
                const blob = new Blob([alertsCsv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `alerts-${incident.id}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              {t('Download CSV (X alerts)', { count: selectedAlerts.length || alerts.length })}
            </Button>
            <Button
              id="alerts-modal-move-btn"
              colorScheme="blue"
              mr={3}
              isDisabled={selectedAlerts.length === 0}
              onClick={() => setShowMoveModal(true)}
            >
              {t('Move')}
            </Button>
            <Button
              id="alerts-modal-close-btn"
              mr={3}
              onClick={() => {
                setMoveTarget(null);
                setMoveTargetOptions({});
                setSelectedAlerts([]);
                setShowIncidentAlertsModalForIncidentId(null);
              }}
            >
              {t('Close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('Move X alerts to another incident', { count: selectedAlerts.length })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="alerts-modal-move-select">{t('Move to')}</FormLabel>
              <Select
                id="alerts-modal-move-select"
                size="md"
                isSearchable
                options={incidentSelectOptions}
                value={moveTarget}
                onChange={(value) => setMoveTarget(value)}
                placeholder={`${t('Select dotdotdot')}`}
                chakraStyles={{
                  // Ensure that dropdowns appear over table header
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 2,
                    width: 'auto',
                  }),
                }}
              />
            </FormControl>
            {moveTarget && moveTarget.value.startsWith('new') && (
              <>
                <FormControl>
                  <FormLabel htmlFor="alerts-modal-move-summary-input">{t('Summary')}</FormLabel>
                  <Input
                    id="alerts-modal-move-summary-input"
                    isDisabled={moveTarget.value === 'new-each'}
                    value={
                      (moveTarget.value === 'new-each'
                        && t('Incident titles will be the same as the alert titles'))
                      || (moveTarget.value === 'new' && moveTargetOptions.summary)
                      || ''
                    }
                    onChange={(e) => setMoveTargetOptions((prev) => ({ ...prev, summary: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="alerts-modal-move-service-select">{t('Service')}</FormLabel>
                  <Select
                    id="alerts-modal-move-service-select"
                    size="md"
                    isSearchable
                    options={serviceListOptions}
                    defaultValue={serviceListOptions.find((s) => s.value === incident.service.id)}
                    onChange={(selected) => setMoveTargetOptions((prev) => ({ ...prev, serviceId: selected.value }))}
                    placeholder={`${t('Select dotdotdot')}`}
                    chakraStyles={{
                      // Ensure that dropdowns appear over table header
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 2,
                        width: 'auto',
                      }),
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="alerts-modal-move-ep-select">
                    {t('Escalation Policy')}
                  </FormLabel>
                  <Select
                    id="alerts-modal-move-ep-select"
                    size="md"
                    isSearchable
                    options={epListOptions}
                    defaultValue={epListOptions.find(
                      (s) => s.value === incident.escalation_policy.id,
                    )}
                    onChange={(selected) => setMoveTargetOptions((prev) => ({ ...prev, epId: selected.value }))}
                    placeholder={`${t('Select dotdotdot')}`}
                    chakraStyles={{
                      // Ensure that dropdowns appear over table header
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 2,
                        width: 'auto',
                      }),
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="alerts-modal-move-priority-select">{t('Priority')}</FormLabel>
                  <Select
                    id="alerts-modal-move-priority-select"
                    size="md"
                    isSearchable
                    options={priorityListOptions}
                    defaultValue={
                      incident.priority?.id
                        ? priorityListOptions.find((s) => s.value === incident.priority.id)
                        : priorityListOptions.find((s) => s.value === '--')
                    }
                    onChange={(selected) => setMoveTargetOptions((prev) => ({ ...prev, priorityId: selected.value }))}
                    placeholder={`${t('Select dotdotdot')}`}
                    chakraStyles={{
                      // Ensure that dropdowns appear over table header
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 2,
                        width: 'auto',
                      }),
                    }}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              id="alerts-modal-complete-move-btn"
              colorScheme="blue"
              mr={3}
              isDisabled={!moveTarget}
              onClick={() => {
                setShowMoveModal(false);
                // eslint-disable-next-line max-len
                // console.log('move', selectedAlerts, 'from', incident.id, 'to', moveTarget.value, 'with options', moveTargetOptions);
                moveAlerts(incident.id, moveTarget.value, selectedAlerts, moveTargetOptions);
                setMoveTarget(null);
                setMoveTargetOptions({});
                setSelectedAlerts([]);
                setShowIncidentAlertsModalForIncidentId(null);
              }}
            >
              {t('Move')}
            </Button>
            <Button mr={3} onClick={() => setShowMoveModal(false)}>
              {t('Close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IncidentAlertsModal;
