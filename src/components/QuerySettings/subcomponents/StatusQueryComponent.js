/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */

import React, {
  useEffect,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Flex,
  useCheckboxGroup,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  RESOLVED,
} from 'util/incidents';

import {
  updateQuerySettingsIncidentStatus as updateQuerySettingsIncidentStatusConnected,
} from 'redux/query_settings/actions';

import QuerySettingsCheckbox from './QuerySettingsCheckbox';

const StatusQueryComponent = () => {
  const {
    incidentStatus,
  } = useSelector((state) => state.querySettings);
  const dispatch = useDispatch();
  const updateQuerySettingsIncidentStatus = (newIncidentStatus) => {
    dispatch(updateQuerySettingsIncidentStatusConnected(newIncidentStatus));
  };

  const {
    t,
  } = useTranslation();

  const {
    getCheckboxProps,
    value,
  } = useCheckboxGroup({
    defaultValue: incidentStatus,
  });

  useEffect(() => {
    updateQuerySettingsIncidentStatus(value);
  }, [value]);

  return (
    <Flex>
      <QuerySettingsCheckbox
        id="query-status-triggered-button"
        {...getCheckboxProps({
          value: TRIGGERED,
        })}
      >
        {t('Triggered')}
      </QuerySettingsCheckbox>
      <QuerySettingsCheckbox
        id="query-status-acknowledged-button"
        {...getCheckboxProps({
          value: ACKNOWLEDGED,
        })}
      >
        {t('Acknowledged')}
      </QuerySettingsCheckbox>
      <QuerySettingsCheckbox
        id="query-status-resolved-button"
        {...getCheckboxProps({
          value: RESOLVED,
        })}
      >
        {t('Resolved')}
      </QuerySettingsCheckbox>
    </Flex>
  );
};

export default StatusQueryComponent;
