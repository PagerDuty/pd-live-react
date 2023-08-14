import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import {
  getObjectsFromList,
} from 'src/util/helpers';

import {
  updateQuerySettingsUsers as updateQuerySettingsUsersConnected,
} from 'src/redux/query_settings/actions';

const UsersQueryComponent = () => {
  const {
    t,
  } = useTranslation();

  const userList = useSelector((state) => state.users.users);
  const userIds = useSelector((state) => state.querySettings.userIds);
  const dispatch = useDispatch();
  const updateQuerySettingsUsers = (newUserIds) => {
    dispatch(updateQuerySettingsUsersConnected(newUserIds));
  };

  const enabled = useMemo(() => userList.length > 0, [userList]);

  const selectListUsers = useMemo(
    () => userList.map((user) => ({
      label: user.name,
      value: user.id,
    })),
    [userList],
  );

  const storedSelectUsers = useMemo(() => {
    const r = selectListUsers && userIds ? getObjectsFromList(selectListUsers, userIds, 'value') : [];
    return r;
  }, [selectListUsers, userIds]);

  return (
    <Select
      id="query-user-select"
      size="sm"
      isMulti
      isSearchable
      onChange={(selectedUsers) => {
        const userIdsInt = selectedUsers.map((user) => user.value);
        updateQuerySettingsUsers(userIdsInt);
      }}
      options={selectListUsers}
      value={storedSelectUsers}
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

export default UsersQueryComponent;
