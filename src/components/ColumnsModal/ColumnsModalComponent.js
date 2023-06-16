import {
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  useDrop,
} from 'react-dnd';

import {
  defaultColumns,
  customAlertColumns,
  columnsForSavedColumns,
} from 'config/column-generator';

import {
  saveIncidentTable as saveIncidentTableConnected,
} from 'redux/incident_table/actions';

import {
  toggleColumnsModal as toggleColumnsModalConnected,
  setAlertCustomDetailColumns as setAlertCustomDetailColumnsConnected,
} from 'redux/settings/actions';

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  VStack,
  Box,
  InputGroup,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';

import {
  AddIcon,
} from '@chakra-ui/icons';

import ColumnsModalItem from './subcomponents/ColumnsModalItem';
import DraggableColumnsModalItem from './subcomponents/DraggableColumnsModalItem';

const TableColumnsModalComponent = () => {
  const displayColumnsModal = useSelector((state) => state.settings.displayColumnsModal);
  const alertCustomDetailFields = useSelector((state) => state.settings.alertCustomDetailFields);
  const incidentTableColumns = useSelector((state) => state.incidentTable.incidentTableColumns);

  const dispatch = useDispatch();
  const toggleColumnsModal = () => dispatch(toggleColumnsModalConnected());
  const setAlertCustomDetailColumns = (newAlertCustomDetailFields) => {
    dispatch(setAlertCustomDetailColumnsConnected(newAlertCustomDetailFields));
  };
  const saveIncidentTable = (updatedIncidentTableColumns) => {
    dispatch(saveIncidentTableConnected(updatedIncidentTableColumns));
  };

  const {
    t,
  } = useTranslation();

  const toast = useToast();

  const columnValue = (column) => {
    if (!column) return '';
    let value;
    if (column.columnType === 'alert') {
      // Alert column based on aggregator
      value = column.Header
        + (column.accessorPath ? `:${column.accessorPath}` : '')
        + (column.aggregator ? `:${column.aggregator}` : '');
    } else {
      // Incident column
      value = column.Header;
    }
    return value;
  };

  const getAllAvailableColumns = () => {
    const v = [
      ...defaultColumns(),
      ...customAlertColumns(alertCustomDetailFields),
    ].sort((a, b) => columnValue(a).localeCompare(columnValue(b)));
    return v;
  };

  const allAvailableColumns = useMemo(getAllAvailableColumns, [alertCustomDetailFields]);

  const getSelectedColumns = () => columnsForSavedColumns(incidentTableColumns).map((column) => {
    // Recreate original value used from react-select in order to populate dual list
    const value = columnValue(column);
    return {
      id: column.id,
      Header: column.Header,
      columnType: column.columnType,
      label: column.i18n ? column.i18n : column.Header,
      value,
    };
  });
  const [selectedColumns, setSelectedColumns] = useState(getSelectedColumns());

  const getUnselectedColumns = () => allAvailableColumns.filter(
    (c) => !selectedColumns.find((s) => columnValue(s) === columnValue(c)),
  );
  const unselectedColumns = useMemo(getUnselectedColumns, [allAvailableColumns, selectedColumns]);

  const unselectColumn = (column) => {
    setSelectedColumns((prev) => prev.filter((c) => columnValue(c) !== columnValue(column)));
  };
  const selectColumn = (column) => {
    setSelectedColumns((prev) => [...prev, column]);
  };

  const addCustomAlertColumn = (value) => {
    const [Header, accessorPath, aggregator] = value.split(':');
    const newColumn = {
      Header,
      accessorPath,
      aggregator,
      value,
      label: value,
      columnType: 'alert',
    };
    const newAlertCustomDetailFields = [...alertCustomDetailFields, newColumn];
    setAlertCustomDetailColumns(newAlertCustomDetailFields);
  };

  const removeCustomAlertColumn = (column) => {
    unselectColumn(column);
    const newAlertCustomDetailFields = alertCustomDetailFields.filter(
      (c) => c.value !== column.value,
    );
    setAlertCustomDetailColumns(newAlertCustomDetailFields);
  };

  const headerInputRef = useRef(null);
  const accessorPathInputRef = useRef(null);
  const addButtonRef = useRef(null);

  const [inputIsValid, setInputIsValid] = useState(false);
  const validateInput = () => {
    let valid = true;
    if (
      !headerInputRef.current.value
      || !headerInputRef.current.value.match(/^[a-zA-Z0-9_.]+$/)
    ) {
      valid = false;
    }
    if (
      !accessorPathInputRef.current.value
      || !accessorPathInputRef.current.value.match(/^[a-zA-Z0-9_.]+$/)
    ) {
      valid = false;
    }
    setInputIsValid(valid);
  };

  const findColumnInSelectedColumns = useCallback((value) => {
    const column = selectedColumns.find((c) => columnValue(c) === value);
    return {
      column,
      index: selectedColumns.indexOf(column),
    };
  }, [selectedColumns]);

  const moveColumnInSelectedColumns = useCallback((value, toIndex) => {
    const {
      column,
      index,
    } = findColumnInSelectedColumns(value);
    const newSelectedColumns = [...selectedColumns];
    newSelectedColumns.splice(index, 1);
    newSelectedColumns.splice(toIndex, 0, column);
    setSelectedColumns(newSelectedColumns);
  }, [findColumnInSelectedColumns, selectedColumns]);

  const [, drop] = useDrop(() => ({ accept: 'DraggableColumnsModalItem' }));
  return (
    <Modal
      isOpen={displayColumnsModal}
      onClose={toggleColumnsModal}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Incident Table')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="top">
            <Card
              size="sm"
              borderWidth="1px"
            >
              <CardHeader>
                <Heading size="sm">Selected</Heading>
              </CardHeader>
              <CardBody>
                <Box ref={drop}>
                  {selectedColumns.map((column) => (
                    <DraggableColumnsModalItem
                      key={columnValue(column)}
                      column={column}
                      onClick={() => unselectColumn(column)}
                      itemType="selected"
                      findColumnInSelectedColumns={findColumnInSelectedColumns}
                      moveColumnInSelectedColumns={moveColumnInSelectedColumns}
                    />
                  ))}
                </Box>
              </CardBody>
              <CardFooter>
                <Text m="auto" fontSize="sm" color="gray.500" as="i">
                  {t('Drag and drop to reorder')}
                </Text>
              </CardFooter>
            </Card>
            <Card size="sm">
              <CardHeader>
                <Heading size="sm">Available</Heading>
              </CardHeader>
              <CardBody>
                <Box>
                  {unselectedColumns.map((column) => (
                    <ColumnsModalItem
                      key={columnValue(column)}
                      column={column}
                      onClick={() => selectColumn(column)}
                      itemType="available"
                    />
                  ))}
                </Box>
              </CardBody>
            </Card>
            <Card size="sm">
              <CardHeader>
                <Heading size="sm">Custom</Heading>
              </CardHeader>
              <CardBody>
                <Box
                  id="custom-columns-card-body"
                >
                  {alertCustomDetailFields.map((column) => (
                    <ColumnsModalItem
                      key={columnValue(column)}
                      column={column}
                      onClick={() => removeCustomAlertColumn(column)}
                      itemType="custom"
                    />
                  ))}
                </Box>
                <InputGroup>
                  <Input
                    ref={headerInputRef}
                    onChange={validateInput}
                    m={1}
                    w="30%"
                    placeholder="Header"
                    size="sm"
                  />
                  <Input
                    ref={accessorPathInputRef}
                    onChange={validateInput}
                    m={1}
                    w="60%"
                    placeholder="Accessor Path"
                    size="sm"
                  />
                  <Button
                    ref={addButtonRef}
                    isDisabled={!inputIsValid}
                    onClick={() => {
                      const value = `${headerInputRef.current.value}:`
                        + `${accessorPathInputRef.current.value}`;
                      addCustomAlertColumn(value);
                    }}
                    m={1}
                    variant="solid"
                    colorScheme="blue"
                    aria-label="Add custom column"
                    rightIcon={<AddIcon />}
                    size="sm"
                  >
                    Add
                  </Button>
                </InputGroup>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            id="save-columns-button"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              saveIncidentTable(selectedColumns);
              toggleColumnsModal();
              toast({
                title: 'Incident table columns saved',
                status: 'success',
              });
            }}
          >
            OK
          </Button>
          <Button variant="ghost" onClick={toggleColumnsModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TableColumnsModalComponent;
