import React, {
  useMemo,
  // useState,
  useCallback,
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
} from '@chakra-ui/react';

import {
  getIncidentAlertsAsync, getIncidentNotesAsync,
} from 'src/redux/incidents/actions';

const GetAllForSortModal = ({
  isOpen, onClose, columnType, rows,
}) => {
  const maxRateLimit = useSelector((state) => state.settings.maxRateLimit);
  const dispatch = useDispatch();
  const getIncidentAlerts = (incidentId) => dispatch(getIncidentAlertsAsync(incidentId));
  const getIncidentNotes = (incidentId) => dispatch(getIncidentNotesAsync(incidentId));

  const rowsNeedingFetchAlerts = useMemo(
    () => rows.filter((incident) => !incident.original.alerts),
    [rows],
  );

  const rowsNeedingFetchNotes = useMemo(
    () => rows.filter((incident) => !incident.original.notes),
    [rows],
  );

  const fetchRows = useCallback(() => {
    if (columnType === 'alert') {
      rowsNeedingFetchAlerts.forEach((row) => {
        getIncidentAlerts(row.original.id);
      });
    }
    if (columnType === 'notes') {
      rowsNeedingFetchNotes.forEach((row) => {
        getIncidentNotes(row.original.id);
      });
    }
  }, [
    rowsNeedingFetchAlerts,
    rowsNeedingFetchNotes,
    columnType,
    getIncidentAlerts,
    getIncidentNotes,
  ]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Additional Data Needed</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {columnType === 'alert' && (
              <>
                <p>
                  {'To sort on this column, you need to load alerts '
                    + `for ${rowsNeedingFetchAlerts.length} incidents. `
                    + 'This will take about '
                    + `${Math.ceil(rowsNeedingFetchAlerts.length / maxRateLimit)} minutes.`}
                </p>
                <p>Fetch alerts?</p>
              </>
            )}
            {columnType === 'notes' && (
              <>
                <p>
                  {'To sort on this column, you need to load notes '
                    + `for ${rowsNeedingFetchNotes.length} incidents. `
                    + 'This will take about '
                    + `${Math.ceil(rowsNeedingFetchNotes.length / maxRateLimit)} minutes.`}
                </p>
                <p>Fetch notes?</p>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={2}
              onClick={() => {
                onClose();
                fetchRows();
              }}
            >
              Yes
            </Button>
            <Button onClick={onClose}>
              {`No, sort without loading ${columnType === 'alert' ? 'alerts' : 'notes'}`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GetAllForSortModal;
