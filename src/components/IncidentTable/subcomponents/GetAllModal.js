import React, {
  useMemo,
  // useState,
  useCallback,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  // Stack,
  Box,
  Text,
} from '@chakra-ui/react';

import {
  getIncidentAlertsAsync,
  getIncidentNotesAsync,
} from 'redux/incidents/actions';

const GetAllModal = ({
  isOpen,
  onClose,
  exportCsv,
}) => {
  const maxRateLimit = useSelector((state) => state.settings.maxRateLimit);
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const {
    filteredIncidentsByQuery,
    incidentAlerts,
    incidentNotes,
  } = useSelector((state) => state.incidents);
  const dispatch = useDispatch();
  const getIncidentAlerts = (incidentId) => dispatch(getIncidentAlertsAsync(incidentId));
  const getIncidentNotes = (incidentId) => dispatch(getIncidentNotesAsync(incidentId));

  const rowsToExport = useMemo(() => (
    selectedRows && selectedRows.length > 0
      ? selectedRows
      : filteredIncidentsByQuery.map(
        (incident) => ({
          ...incident,
          alerts: incidentAlerts[incident.id],
          notes: incidentNotes[incident.id],
        }),
      )
  ), [selectedRows, filteredIncidentsByQuery, incidentAlerts, incidentNotes]);

  const rowsNeedingFetch = useMemo(() => (
    rowsToExport.filter((incident) => !incident.alerts || !incident.notes)
  ), [rowsToExport]);

  const rowsFetchingAlerts = useMemo(() => (
    rowsToExport.filter((incident) => incident.alerts && incident.alerts.status === 'fetching')
  ), [rowsToExport]);

  const rowsDoneFetchingAlerts = useMemo(() => (
    rowsToExport.filter((incident) => incident.alerts && incident.alerts instanceof Array)
  ), [rowsToExport]);

  const readyToExport = useMemo(() => (
    rowsNeedingFetch.length === 0 && rowsFetchingAlerts.length === 0
  ), [rowsNeedingFetch, rowsFetchingAlerts]);

  const fetchRows = useCallback(() => {
    rowsNeedingFetch.forEach((incident) => {
      getIncidentAlerts(incident.id);
      getIncidentNotes(incident.id);
    });
  }, [rowsNeedingFetch]);

  // const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* <Button
        size="sm"
        px={8}
        mx={2}
        onClick={() => (
          readyToExport ? exportRows(rowsToExport) : setIsOpen(true)
        )}
      >
        Export CSV
      </Button> */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export CSV</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {rowsNeedingFetch.length > 0 && (
              <>
                <p>
                  You need to load alerts and notes for
                  {' '}
                  {rowsNeedingFetch.length}
                  {' '}
                  incidents before exporting.
                  This will take about
                  {' '}
                  {Math.ceil(rowsToExport.length / maxRateLimit) * 2}
                  {' '}
                  minutes.
                </p>
                <p>Fetch notes and alerts?</p>
                <Button colorScheme="blue" mr={2} onClick={fetchRows}>Yes</Button>
                <Button onClick={exportCsv}>
                  No, export without notes and alerts
                </Button>
              </>
            )}
            {rowsFetchingAlerts.length > 0
              && rowsNeedingFetch.length === 0
              && (
                <Box
                  rounded="md"
                  borderWidth={1}
                  p={2}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    {`${rowsFetchingAlerts.length} remaining`}
                  </Text>
                  <Progress
                    min={0}
                    value={rowsDoneFetchingAlerts.length}
                    max={rowsToExport.length}
                  />
                </Box>
              )}
          </ModalBody>
          <ModalFooter>
            {readyToExport && (
              `Ready to export ${rowsToExport.length} incidents`
            )}
            <Button
              ml={2}
              colorScheme="blue"
              isDisabled={!readyToExport}
              onClick={exportCsv}
            >
              Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GetAllModal;
