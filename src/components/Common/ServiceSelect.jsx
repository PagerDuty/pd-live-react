import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  useDebouncedCallback,
} from 'use-debounce';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

const ServiceSelect = ({
  id = 'service-select',
  size = 'sm',
  value,
  onChange,
  isMulti = false,
}) => {
  const {
    t,
  } = useTranslation();

  const [selectOptions, setSelectOptions] = useState([]);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [more, setMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [storedSelectServices, setStoredSelectServices] = useState([]);

  // get the user names for the selected serviceIds
  useEffect(() => {
    const serviceIds = isMulti ? value : [value];
    const promises = serviceIds.map(async (serviceId) => {
      const r = await throttledPdAxiosRequest('GET', `services/${serviceId}`);
      return { label: r.data.service.name, value: r.data.service.id };
    });
    Promise.all(promises).then((r) => {
      setStoredSelectServices(r);
    });
  }, [value]);

  const requestOptionsPage = useCallback(async (inputValue, offset) => {
    const r = await throttledPdAxiosRequest(
      'GET',
      'services',
      { query: inputValue, offset },
    );
    setMore(r.data.more);
    const r2 = r.data.services.map((service) => ({ label: service.name, value: service.id }));
    return r2;
  }, []);

  const loadOptions = useCallback(async (inputValue) => {
    setIsLoading(true);
    const r = await requestOptionsPage(inputValue, 0);
    setSelectOptions(r);
    setIsLoading(false);
  }, [currentInputValue, requestOptionsPage]);

  const debouncedLoadOptions = useDebouncedCallback(loadOptions, 200);

  const loadMoreOptions = useCallback(async () => {
    if (!more) {
      return;
    }
    setIsLoading(true);
    const r = await requestOptionsPage(currentInputValue, selectOptions.length);
    setSelectOptions((prev) => [...prev, ...r]);
    setIsLoading(false);
  }, [currentInputValue, requestOptionsPage, more, selectOptions]);

  return (
    <Select
      id={id}
      size={size}
      isMulti={isMulti}
      isSearchable
      isLoading={isLoading}
      onChange={(selected) => {
        if (isMulti) {
          onChange(selected.map((service) => service.value));
        } else {
          onChange(selected.value);
        }
      }}
      onInputChange={(inputValue) => {
        setCurrentInputValue(inputValue);
        debouncedLoadOptions(inputValue);
      }}
      onMenuScrollToBottom={loadMoreOptions}
      onFocus={() => loadOptions(currentInputValue)}
      options={selectOptions}
      value={isMulti ? storedSelectServices : storedSelectServices[0]}
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

export default ServiceSelect;
