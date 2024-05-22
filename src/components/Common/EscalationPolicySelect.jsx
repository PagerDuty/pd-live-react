import React, {
  useState, useEffect, useCallback,
} from 'react';

import {
  useDebouncedCallback,
} from 'use-debounce';

import {
  useToast,
} from '@chakra-ui/react';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import RealUserMonitoring from 'src/config/monitoring';
import {
  AxiosError,
} from 'axios';

import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

const EscalationPolicySelect = ({
  id = 'escalation-policy-select',
  size = 'sm',
  value,
  onChange,
  isMulti = false,
}) => {
  const {
    t,
  } = useTranslation();

  const toast = useToast();

  const [selectOptions, setSelectOptions] = useState([]);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [more, setMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [storedSelectEps, setStoredSelectEps] = useState([]);

  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const details = {};
    if (apiError) {
      if (apiError instanceof AxiosError) {
        details.url = apiError.config.url;
        details.method = apiError.config.method;
        details.status = apiError.response?.status;
        details.data = apiError.response?.data;
      }
      RealUserMonitoring.trackError(apiError, details);
      toast({
        title: t('Error'),
        description: apiError.message,
        status: 'error',
      });
    }
  }, [apiError]);

  // get the names for the selected epIds
  useEffect(() => {
    const epIds = isMulti ? value : [value];
    const promises = epIds.map(async (epId) => {
      const r = await throttledPdAxiosRequest('GET', `escalation_policies/${epId}`);
      return { label: r.data.escalation_policy.name, value: r.data.escalation_policy.id };
    });
    Promise.all(promises).then((r) => {
      setStoredSelectEps(r);
    });
  }, [value]);

  const requestOptionsPage = useCallback(async (inputValue, offset) => {
    try {
      const r = await throttledPdAxiosRequest(
        'GET',
        'escalation_policies',
        { query: inputValue, offset },
        null,
        { throwErrors: true },
      );
      setMore(r.data.more);
      const r2 = r.data.escalation_policies.map((ep) => ({ label: ep.name, value: ep.id }));
      return r2;
    } catch (e) {
      setApiError(e);
      return [];
    }
  }, []);

  const loadOptions = useCallback(
    async (inputValue) => {
      setIsLoading(true);
      const r = await requestOptionsPage(inputValue, 0);
      setSelectOptions(r);
      setIsLoading(false);
    },
    [currentInputValue, requestOptionsPage],
  );

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
          onChange(selected.map((ep) => ep.value));
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
      value={isMulti ? storedSelectEps : storedSelectEps[0]}
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

export default EscalationPolicySelect;
