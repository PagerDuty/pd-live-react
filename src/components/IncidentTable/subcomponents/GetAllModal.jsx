import React, {
  useMemo, useCallback,
} from 'react';

import {
  useSelector, useDispatch,
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
  Box,
  Text,
} from '@chakra-ui/react';

import {
  getIncidentAlertsAsync, getIncidentNotesAsync,
} from 'src/redux/incidents/actions';

const GetAllModal = ({
  isOpen, onClose, exportCsv, rows: rowsToExport,
}) => {
  const maxRateLimit = useSelector((state) => state.settings.maxRateLimit);

  const dispatch = useDispatch();
  const getIncidentAlerts = (incidentId) => dispatch(getIncidentAlertsAsync(incidentId));
  const getIncidentNotes = (incidentId) => dispatch(getIncidentNotesAsync(incidentId));

  const rowsNeedingFetch = useMemo(
    () => rowsToExport.filter((row) => {
      const {
        alerts, notes,
      } = row.original;
      return !alerts || !notes;
    }),
    [rowsToExport],
  );

  const rowsFetching = useMemo(
    () => rowsToExport.filter((row) => {
      const {
        alerts,
        notes,
      } = row.original;
      return (
        (alerts && alerts.status === 'fetching')
        || (notes && notes.status === 'fetching')
      );
    }),
    [rowsToExport],
  );

  const rowsDoneFetching = useMemo(
    () => rowsToExport.filter((row) => {
      const {
        alerts,
        notes,
      } = row.original;
      return (
        (alerts && alerts instanceof Array)
        && (notes && notes instanceof Array)
      );
    }),
    [rowsToExport],
  );

  const readyToExport = useMemo(
    () => rowsNeedingFetch.length === 0 && rowsFetching.length === 0,
    [rowsNeedingFetch],
  );

  const fetchRows = useCallback(() => {
    rowsNeedingFetch.forEach((row) => {
      const {
        id,
        notes,
        alerts,
      } = row.original;
      if (!notes) {
        getIncidentNotes(id);
      }
      if (!alerts) {
        getIncidentAlerts(id);
      }
    });
  }, [rowsNeedingFetch]);

  return (
    <>
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
                  incidents before
                  exporting. This will take about
                  {' '}
                  {Math.ceil(rowsToExport.length / maxRateLimit) * 2}
                  {' '}
                  minutes.
                </p>
                <p>Fetch notes and alerts?</p>
                <Button colorScheme="blue" mr={2} onClick={fetchRows}>
                  Yes
                </Button>
                <Button onClick={exportCsv}>No, export without notes and alerts</Button>
              </>
            )}
            {rowsFetching.length > 0 && rowsNeedingFetch.length === 0 && (
              <>
                <Text fontSize="sm">Fetching notes and alerts...</Text>
                <Box rounded="md" borderWidth={1} p={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    {`${rowsFetching.length} remaining`}
                  </Text>
                  <Progress
                    min={0}
                    value={rowsDoneFetching.length}
                    max={rowsToExport.length}
                  />
                </Box>
                <Text fontSize="sm" mt={6}>
                  You can close this box and continue using the app, download will continue in the
                  background.
                </Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {readyToExport && `Ready to export ${rowsToExport.length} incidents`}
            <Button ml={2} colorScheme="blue" isDisabled={!readyToExport} onClick={exportCsv}>
              Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GetAllModal;
