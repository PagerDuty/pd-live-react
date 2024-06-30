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
  // columnsForSavedColumns,
} from 'src/config/column-generator';

import {
  saveIncidentTable as saveIncidentTableConnected,
  updateIncidentTableState as updateIncidentTableStateConnected,
} from 'src/redux/incident_table/actions';

import {
  toggleColumnsModal as toggleColumnsModalConnected,
  setAlertCustomDetailColumns as setAlertCustomDetailColumnsConnected,
} from 'src/redux/settings/actions';

import ColumnsModalItem from './subcomponents/ColumnsModalItem';
import DraggableColumnsModalItem from './subcomponents/DraggableColumnsModalItem';

const TableColumnsModalComponent = () => {
  const displayColumnsModal = useSelector((state) => state.settings.displayColumnsModal);
  const alertCustomDetailFields = useSelector((state) => state.settings.alertCustomDetailFields);
  const incidentTableColumns = useSelector((state) => state.incidentTable.incidentTableColumns);
  const {
    incidentTableState,
  } = useSelector((state) => state.incidentTable);

  const dispatch = useDispatch();
  const toggleColumnsModal = () => dispatch(toggleColumnsModalConnected());
  const setAlertCustomDetailColumns = (newAlertCustomDetailFields) => {
    dispatch(setAlertCustomDetailColumnsConnected(newAlertCustomDetailFields));
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
    // eslint-disable-next-line max-len
    const v = [...defaultColumns(), ...customAlertColumns(alertCustomDetailFields)].sort((a, b) => columnValue(a).localeCompare(columnValue(b)));
    return v;
  };

  const allAvailableColumns = useMemo(getAllAvailableColumns, [alertCustomDetailFields]);

  // const getSelectedColumns = () => columnsForSavedColumns(incidentTableColumns).map((column) => {
  //   // Recreate original value used from react-select in order to populate dual list
  //   const value = columnValue(column);
  //   return {
  //     id: column.id,
  //     Header: column.Header,
  //     columnType: column.columnType,
  //     accessor: column.accessor,
  //     accessorPath: column.accessorPath,
  //     label: column.i18n ? column.i18n : column.Header,
  //     value,
  //   };
  // });
  const getSelectedColumns = () => incidentTableColumns.map((column) => (
    {
      ...column,
      value: columnValue(column),
      label: column.i18n ? column.i18n : column.Header,
    }
  ));
  const [selectedColumns, setSelectedColumns] = useState(getSelectedColumns());

  const getUnselectedColumns = () => {
    const unselected = allAvailableColumns.filter(
      (c) => !selectedColumns.find((s) => s.value === columnValue(c)),
    );
    return unselected;
  };
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
      // label: value,
      columnType: 'alert',
    };
    const newAlertCustomDetailFields = [...alertCustomDetailFields, newColumn];
    setAlertCustomDetailColumns(newAlertCustomDetailFields);
  };

  const addCustomComputedColumn = (value) => {
    const [Header, accessorPath, aggregator, expression] = value.split(':');
    const newColumn = {
      Header,
      accessorPath,
      aggregator,
      value,
      // expressionType,
      expression,
      // label: value,
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

  const columnTypeInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const accessorPathInputRef = useRef(null);
  const regexInputRef = useRef(null);
  const addButtonRef = useRef(null);

  const [columnType, setColumnType] = useState(null);

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
      const column = selectedColumns.find((c) => columnValue(c) === value);
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
                <Heading size="sm">{t('Selected')}</Heading>
              </CardHeader>
              <CardBody>
                <Box id="selected-columns-card-body" ref={drop}>
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
                <Heading size="sm">{t('Available')}</Heading>
              </CardHeader>
              <CardBody>
                <Box id="available-columns-card-body">
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
                <Heading size="sm">{t('Custom')}</Heading>
              </CardHeader>
              <CardBody>
                <Box id="custom-columns-card-body">
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
                  <Select
                    id="column-type-select"
                    ref={columnTypeInputRef}
                    w="10%"
                    onChange={() => {
                      // console.error(columnTypeInputRef.current.value);
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
                      const value = `${headerInputRef.current.value}:`
                        + `${accessorPathInputRef.current.value}`;
                      if (columnType === 'alert') {
                        addCustomAlertColumn(value);
                      } else {
                        console.error('computed submitted');
                        addCustomComputedColumn(value);
                      }
                    }}
                    m={1}
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
              const selectedColumnIds = selectedColumns.map((c) => c.id);
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
