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
  useTranslation,
} from 'react-i18next';

import {
  HIGH, LOW,
} from 'util/incidents';

import {
  updateQuerySettingsIncidentUrgency as updateQuerySettingsIncidentUrgencyConnected,
} from 'redux/query_settings/actions';

import QuerySettingsCheckbox from './QuerySettingsCheckbox';

const UrgencyQueryComponent = () => {
  const {
    incidentUrgency,
  } = useSelector((state) => state.querySettings);
  const dispatch = useDispatch();
  const updateQuerySettingsIncidentUrgency = (newIncidentUrgency) => {
    dispatch(updateQuerySettingsIncidentUrgencyConnected(newIncidentUrgency));
  };

  const {
    t,
  } = useTranslation();

  const {
    getCheckboxProps, value,
  } = useCheckboxGroup({
    defaultValue: incidentUrgency,
  });

  useEffect(() => {
    updateQuerySettingsIncidentUrgency(value);
  }, [value]);

  return (
    <Flex>
      <QuerySettingsCheckbox
        id="query-urgency-high-button"
        {...getCheckboxProps({
          value: HIGH,
        })}
        first
      >
        {t('High')}
      </QuerySettingsCheckbox>
      <QuerySettingsCheckbox
        id="query-urgency-low-button"
        {...getCheckboxProps({
          value: LOW,
        })}
        last
      >
        {t('Low')}
      </QuerySettingsCheckbox>
    </Flex>
  );
};

export default UrgencyQueryComponent;
