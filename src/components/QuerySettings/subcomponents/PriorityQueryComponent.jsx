/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */

import React, {
  useEffect,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Flex, useCheckboxGroup,
} from '@chakra-ui/react';

import {
  updateQuerySettingsIncidentPriority as updateQuerySettingsIncidentPriorityConnected,
} from 'src/redux/query_settings/actions';

import QuerySettingsCheckbox from './QuerySettingsCheckbox';

const PriorityQueryComponent = () => {
  const {
    priorities,
  } = useSelector((state) => state.priorities);
  const {
    incidentPriority,
  } = useSelector((state) => state.querySettings);
  const dispatch = useDispatch();
  const updateQuerySettingsIncidentPriority = (newIncidentPriority) => {
    dispatch(updateQuerySettingsIncidentPriorityConnected(newIncidentPriority));
  };

  const {
    getCheckboxProps, value,
  } = useCheckboxGroup({
    defaultValue: incidentPriority,
  });

  useEffect(() => {
    updateQuerySettingsIncidentPriority(value);
  }, [value]);

  return (
    <Flex>
      {priorities.map((priority) => (
        <QuerySettingsCheckbox
          id={`query-priority-${priority.summary || '--'}-button`}
          {...getCheckboxProps({
            value: priority.id || '--',
          })}
          checkColor={priority.color ? `#${priority.color}` : 'transparent'}
          key={priority.summary || '--'}
        >
          {priority.summary || '--'}
        </QuerySettingsCheckbox>
      ))}
    </Flex>
  );
};

export default PriorityQueryComponent;
