import React, {
  useState, useEffect, useCallback,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

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

import {
  addUserToUsersMap as addUserToUsersMapConnected,
} from 'src/redux/users/actions';

const UserSelect = ({
  id = 'user-select', size = 'sm', value, onChange, isMulti = false,
}) => {
  const {
    t,
  } = useTranslation();

  const toast = useToast();

  const usersMap = useSelector((state) => state.users.usersMap);
  const dispatch = useDispatch();
  const addUserToUsersMap = (user) => {
    dispatch(addUserToUsersMapConnected(user));
  };

  const [selectOptions, setSelectOptions] = useState([]);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [more, setMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [storedSelectUsers, setStoredSelectUsers] = useState([]);

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

  // get the user names for the selected userIds
  useEffect(() => {
    const userIds = isMulti ? value : [value];
    const promises = userIds.map(async (userId) => {
      if (usersMap[userId]) {
        return { label: usersMap[userId].name, value: userId };
      }
      const r = await throttledPdAxiosRequest('GET', `users/${userId}`);
      addUserToUsersMap(r.data.user);
      return { label: r.data.user.name, value: r.data.user.id };
    });
    Promise.all(promises).then((r) => {
      setStoredSelectUsers(r);
    });
  }, [value]);

  const requestOptionsPage = useCallback(async (inputValue, offset) => {
    try {
      const r = await throttledPdAxiosRequest('GET', 'users', { query: inputValue, offset }, null, {
        throwErrors: true,
      });
      setMore(r.data.more);
      const r2 = r.data.users.map((user) => {
        if (!usersMap[user.id]) {
          addUserToUsersMap(user);
        }
        return { label: user.name, value: user.id };
      });
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
          onChange(selected.map((user) => user.value));
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
      value={isMulti ? storedSelectUsers : storedSelectUsers[0]}
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

export default UserSelect;
