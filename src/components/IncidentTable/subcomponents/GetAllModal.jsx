import React, {
  useMemo,
} from 'react';

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

const GetAllModal = ({
  isOpen, onClose, exportCsv, rows: rowsToExport,
}) => {
  const rowsFetching = useMemo(
    () => rowsToExport.filter((row) => {
      const {
        alerts, notes,
      } = row.original;
      return (alerts && alerts.status === 'fetching') || (notes && notes.status === 'fetching');
    }),
    [rowsToExport],
  );

  const rowsDoneFetching = useMemo(
    () => rowsToExport.filter((row) => {
      const {
        alerts, notes,
      } = row.original;
      return alerts && alerts instanceof Array && notes && notes instanceof Array;
    }),
    [rowsToExport],
  );

  const readyToExport = useMemo(
    () => rowsToExport.length === rowsDoneFetching.length,
    [rowsToExport, rowsDoneFetching],
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export CSV</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {rowsFetching.length > 0 && (
              <>
                <Text fontSize="sm">Fetching notes and alerts...</Text>
                <Box rounded="md" borderWidth={1} p={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    {`${rowsFetching.length} remaining`}
                  </Text>
                  <Progress min={0} value={rowsDoneFetching.length} max={rowsToExport.length} />
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
