import React, {
  useMemo,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import {
  getObjectsFromList,
} from 'util/helpers';

import {
  updateQuerySettingsServices as updateQuerySettingsServicesConnected,
} from 'redux/query_settings/actions';

const ServicesQueryComponent = () => {
  const {
    t,
  } = useTranslation();

  const serviceListUnsorted = useSelector((state) => state.services.services);
  const serviceList = useMemo(
    () => {
      if (serviceListUnsorted instanceof Array) {
        return [...serviceListUnsorted].sort((a, b) => a.name.localeCompare(b.name));
      }
      // eslint-disable-next-line no-console
      console.error('serviceListUnsorted is not an array', serviceListUnsorted);
      return [];
    },
    [serviceListUnsorted],
  );
  const serviceIds = useSelector((state) => state.querySettings.serviceIds);
  const dispatch = useDispatch();
  const updateQuerySettingsServices = (newServiceIds) => {
    dispatch(updateQuerySettingsServicesConnected(newServiceIds));
  };

  const enabled = useMemo(() => serviceList.length > 0, [serviceList]);

  const selectListServices = useMemo(() => serviceList.map((service) => ({
    label: service.name,
    value: service.id,
  })), [serviceList]);

  const storedSelectServices = useMemo(
    () => {
      const r = (
        (selectListServices && serviceIds)
          ? getObjectsFromList(selectListServices, serviceIds, 'value')
          : []
      );
      return r;
    },
    [selectListServices, serviceIds],
  );

  return (
    <Select
      size="sm"
      isMulti
      isSearchable
      onChange={(selectedServices) => {
        const serviceIdsInt = selectedServices.map((service) => service.value);
        updateQuerySettingsServices(serviceIdsInt);
      }}
      options={selectListServices}
      value={storedSelectServices}
      isLoading={!enabled}
      isDisabled={!enabled}
      placeholder={`${t('Select dotdotdot')}`}
      chakraStyles={{
        // Ensure that dropdowns appear over table header
        menu: (provided) => ({
          ...provided,
          zIndex: 2,
          width: 'auto',
        }),
      }}
    />
  );
};

export default ServicesQueryComponent;
