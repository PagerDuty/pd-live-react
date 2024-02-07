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

  const [selectOptions, setSelectOptions] = useState([]);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [more, setMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [storedSelectEps, setStoredSelectEps] = useState([]);

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
    const r = await throttledPdAxiosRequest(
      'GET',
      'escalation_policies',
      { query: inputValue, offset },
    );
    setMore(r.data.more);
    const r2 = r.data.escalation_policies.map((ep) => ({ label: ep.name, value: ep.id }));
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
