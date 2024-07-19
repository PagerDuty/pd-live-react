import React, {
  useState, useMemo, useRef, useCallback,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  useDrop,
} from 'react-dnd';

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
  Select,
} from '@chakra-ui/react';
import {
  AddIcon,
} from '@chakra-ui/icons';
import {
  defaultColumns,
  customAlertColumns,
  customComputedColumns,
  // columnsForSavedColumns,
} from 'src/config/column-generator';

import {
  saveIncidentTable as saveIncidentTableConnected,
  updateIncidentTableState as updateIncidentTableStateConnected,
} from 'src/redux/incident_table/actions';

import {
  toggleColumnsModal as toggleColumnsModalConnected,
  setAlertCustomDetailColumns as setAlertCustomDetailColumnsConnected,
  setComputedColumns as setComputedColumnsConnected,
} from 'src/redux/settings/actions';

import ColumnsModalItem from './subcomponents/ColumnsModalItem';
import DraggableColumnsModalItem from './subcomponents/DraggableColumnsModalItem';

const TableColumnsModalComponent = () => {
  const displayColumnsModal = useSelector((state) => state.settings.displayColumnsModal);
  const alertCustomDetailFields = useSelector((state) => state.settings.alertCustomDetailFields) || [];
  const computedFields = useSelector((state) => state.settings.computedFields) || [];
  const incidentTableColumns = useSelector((state) => state.incidentTable.incidentTableColumns);
  const {
    incidentTableState,
  } = useSelector((state) => state.incidentTable);

  const dispatch = useDispatch();
  const toggleColumnsModal = () => dispatch(toggleColumnsModalConnected());
  const setAlertCustomDetailColumns = (newAlertCustomDetailFields) => {
    dispatch(setAlertCustomDetailColumnsConnected(newAlertCustomDetailFields));
  };
  const setComputedColumns = (newComputedFields) => {
    dispatch(setComputedColumnsConnected(newComputedFields));
  };
  const saveIncidentTable = (updatedIncidentTableColumns) => {
    dispatch(saveIncidentTableConnected(updatedIncidentTableColumns));
  };
  const updateIncidentTableState = (updatedIncidentTableState) => {
    dispatch(updateIncidentTableStateConnected(updatedIncidentTableState));
  };

  const {
    t,
  } = useTranslation();

  const toast = useToast();

  const getAllAvailableColumns = () => {
    // eslint-disable-next-line max-len
    const v = [...defaultColumns(), ...customAlertColumns(alertCustomDetailFields), ...customComputedColumns(computedFields)].sort((a, b) => a.value.localeCompare(b.value));
    return v;
  };

  const allAvailableColumns = useMemo(getAllAvailableColumns, [alertCustomDetailFields, computedFields]);

  const getSelectedColumns = () => incidentTableColumns.map((column) => (
    {
      ...column,
      label: column.i18n ? column.i18n : column.Header,
    }
  ));
  const [selectedColumns, setSelectedColumns] = useState(getSelectedColumns());

  const getUnselectedColumns = () => {
    const unselected = allAvailableColumns.filter(
      (c) => !selectedColumns.find((s) => s.value === c.value),
    );
    return unselected;
  };
  const unselectedColumns = useMemo(getUnselectedColumns, [allAvailableColumns, selectedColumns]);

  const unselectColumn = (column) => {
    setSelectedColumns((prev) => prev.filter((c) => c.value !== column.value));
  };
  const selectColumn = (column) => {
    setSelectedColumns((prev) => [...prev, column]);
  };

  const addCustomAlertColumn = (Header, accessorPath) => {
    const value = `${Header}:${accessorPath}`;
    if (!Header || !accessorPath) {
      return;
    }
    const newColumn = {
      id: value,
      Header,
      accessorPath,
      value,
      label: value,
      columnType: 'alert',
    };
    const newAlertCustomDetailFields = [...alertCustomDetailFields, newColumn];
    setAlertCustomDetailColumns(newAlertCustomDetailFields);
  };

  const addCustomComputedColumn = (Header, accessorPath, expression) => {
    const value = `${Header}:${accessorPath}:${expression.replace(/:/g, '\\:')}`;
    if (!Header || !accessorPath || !expression) {
      return;
    }
    const newColumn = {
      id: value,
      Header,
      accessorPath,
      value,
      expressionType: 'regex-single',
      expression,
      label: value,
      columnType: 'computed',
    };
    const newComputedFields = [...computedFields, newColumn];
    setComputedColumns(newComputedFields);
  };

  const removeCustomAlertColumn = (column) => {
    unselectColumn(column);
    const newAlertCustomDetailFields = alertCustomDetailFields.filter(
      (c) => c.value !== column.value,
    );
    setAlertCustomDetailColumns(newAlertCustomDetailFields);
  };

  const removeCustomComputedColumn = (column) => {
    unselectColumn(column);
    const newComputedFields = computedFields.filter(
      (c) => c.value !== column.value,
    );
    setComputedColumns(newComputedFields);
  };

  const columnTypeInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const accessorPathInputRef = useRef(null);
  const regexInputRef = useRef(null);
  const addButtonRef = useRef(null);

  const [columnType, setColumnType] = useState('alert');

  const [inputIsValid, setInputIsValid] = useState(false);
  const validateInput = () => {
    let valid = true;
    if (!headerInputRef.current.value || headerInputRef.current.value.match(/:/)) {
      valid = false;
    }
    if (!accessorPathInputRef.current.value) {
      valid = false;
    }
    setInputIsValid(valid);
  };

  const findColumnInSelectedColumns = useCallback(
    (value) => {
      const column = selectedColumns.find((c) => c.value === value);
      return {
        column,
        index: selectedColumns.indexOf(column),
      };
    },
    [selectedColumns],
  );

  const moveColumnInSelectedColumns = useCallback(
    (value, toIndex) => {
      const {
        column, index,
      } = findColumnInSelectedColumns(value);
      const newSelectedColumns = [...selectedColumns];
      newSelectedColumns.splice(index, 1);
      newSelectedColumns.splice(toIndex, 0, column);
      setSelectedColumns(newSelectedColumns);
    },
    [findColumnInSelectedColumns, selectedColumns],
  );

  const [, drop] = useDrop(() => ({ accept: 'DraggableColumnsModalItem' }));
  return (
    <Modal isOpen={displayColumnsModal} onClose={toggleColumnsModal} size="xxl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Incident Table')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="top">
            <Card size="sm" borderWidth="1px">
              <CardHeader>
                <Heading mb={0} size="sm">{t('Selected')}</Heading>
              </CardHeader>
              <CardBody py={0}>
                <Box id="selected-columns-card-body" ref={drop}>
                  {selectedColumns.map((column) => (
                    <DraggableColumnsModalItem
                      key={column.value}
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
                <Text p={0} mx="auto" my={0} fontSize="sm" color="gray.500" as="i">
                  {t('Drag and drop to reorder')}
                </Text>
              </CardFooter>
            </Card>
            <Card size="sm" borderWidth="1px">
              <CardHeader>
                <Heading mb={0} size="sm">{t('Available')}</Heading>
              </CardHeader>
              <CardBody py={0}>
                <Box mb={2} id="available-columns-card-body">
                  {unselectedColumns.map((column) => (
                    <ColumnsModalItem
                      key={column.value}
                      column={column}
                      onClick={() => selectColumn(column)}
                      itemType="available"
                    />
                  ))}
                </Box>
              </CardBody>
            </Card>
            <Card size="sm" borderWidth="1px">
              <CardHeader>
                <Heading mb={0} size="sm">{t('Custom')}</Heading>
              </CardHeader>
              <CardBody py={0}>
                <Box id="custom-columns-card-body">
                  <Card size="xs" mb={1}>
                    <CardHeader pb={0}>
                      <Heading size="xs">{t('alert')}</Heading>
                    </CardHeader>
                    <CardBody>
                      {alertCustomDetailFields.map((column) => (
                        <ColumnsModalItem
                          key={column.value}
                          column={column}
                          onClick={() => removeCustomAlertColumn(column)}
                          itemType="custom"
                        />
                      ))}
                    </CardBody>
                  </Card>
                  <Card size="xs" mb={1}>
                    <CardHeader pb={0}>
                      <Heading mb={0} size="xs">{t('computed')}</Heading>
                    </CardHeader>
                    <CardBody>
                      {computedFields.map((column) => (
                        <ColumnsModalItem
                          key={column.value}
                          column={column}
                          onClick={() => removeCustomComputedColumn(column)}
                          itemType="custom"
                          columnType="computed"
                        />
                      ))}
                    </CardBody>
                  </Card>
                </Box>
                <InputGroup mb={2}>
                  <Select
                    id="column-type-select"
                    ref={columnTypeInputRef}
                    minWidth="8em"
                    width="auto"
                    onChange={() => {
                      setColumnType(columnTypeInputRef.current.value);
                    }}
                  >
                    {['alert', 'computed'].map((type) => (
                      <option key={type} value={type}>
                        {t(type)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    ref={headerInputRef}
                    onChange={validateInput}
                    m={1}
                    w="30%"
                    placeholder={t('Header')}
                    size="sm"
                  />
                  <Input
                    ref={accessorPathInputRef}
                    onChange={validateInput}
                    m={1}
                    w="50%"
                    placeholder={t('JSON Path')}
                    size="sm"
                  />
                  <Input
                    ref={regexInputRef}
                    onChange={validateInput}
                    m={1}
                    w="50%"
                    placeholder={t('Regex')}
                    size="sm"
                    isDisabled={columnType !== 'computed'}
                  />
                  <Button
                    ref={addButtonRef}
                    isDisabled={!inputIsValid}
                    onClick={() => {
                      if (columnType === 'alert') {
                        addCustomAlertColumn(
                          headerInputRef.current.value,
                          accessorPathInputRef.current.value,
                        );
                      } else {
                        addCustomComputedColumn(
                          headerInputRef.current.value,
                          accessorPathInputRef.current.value,
                          regexInputRef.current.value,
                        );
                      }
                    }}
                    m={1}
                    px={6}
                    variant="solid"
                    colorScheme="blue"
                    aria-label={t('Add custom column')}
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
              // remove any filters on columns that are no longer selected
              const selectedColumnIds = selectedColumns.map((c) => c.value);
              const filters = incidentTableState.filters.filter((f) => selectedColumnIds.includes(f.id));
              updateIncidentTableState({ ...incidentTableState, filters });

              saveIncidentTable(selectedColumns);
              toggleColumnsModal();
              toast({
                title: 'Incident table columns saved',
                status: 'success',
              });
            }}
          >
            {t('OK')}
          </Button>
          <Button variant="ghost" onClick={toggleColumnsModal}>
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TableColumnsModalComponent;
