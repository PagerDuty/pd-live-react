import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useTranslation,
} from 'react-i18next';

import {
  Flex, Button, Tag,
} from '@chakra-ui/react';

import {
  clearIncidentTableFilters as clearIncidentTableFiltersConnected,
} from 'src/redux/incident_table/actions';

const ColumnFilterIndicatorComponent = () => {
  const {
    t,
  } = useTranslation();
  const {
    filters,
  } = useSelector((state) => state.incidentTable.incidentTableState);

  const dispatch = useDispatch();
  const clearIncidentTableFilters = () => {
    dispatch(clearIncidentTableFiltersConnected());
  };

  const filterCount = useMemo(() => {
    if (filters instanceof Array) {
      return filters.length;
    }
    return 0;
  }, [filters]);

  return (
    <Flex>
      <Tag colorScheme="blue">{filterCount}</Tag>
      <Button
        id="clear-filters-button"
        size="xs"
        ml={1}
        colorScheme="red"
        aria-label="clear"
        onClick={clearIncidentTableFilters}
      >
        {t('Clear')}
      </Button>
    </Flex>
  );
};

export default ColumnFilterIndicatorComponent;
