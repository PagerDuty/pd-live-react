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
  updateQuerySettingsTeams as updateQuerySettingsTeamsConnected,
} from 'redux/query_settings/actions';

const TeamsQueryComponent = () => {
  const {
    t,
  } = useTranslation();

  const teamList = useSelector((state) => state.teams.teams);
  const teamIds = useSelector((state) => state.querySettings.teamIds);
  const dispatch = useDispatch();
  const updateQuerySettingsTeams = (newTeamIds) => {
    dispatch(updateQuerySettingsTeamsConnected(newTeamIds));
  };

  const enabled = useMemo(() => teamList.length > 0, [teamList]);

  const selectListTeams = useMemo(() => teamList.map((team) => ({
    label: team.name,
    value: team.id,
  })), [teamList]);

  const storedSelectTeams = useMemo(
    () => {
      const r = (
        (selectListTeams && teamIds) ? getObjectsFromList(selectListTeams, teamIds, 'value') : []
      );
      return r;
    },
    [selectListTeams, teamIds],
  );

  return (
    <Select
      size="sm"
      isMulti
      isSearchable
      onChange={(selectedTeams) => {
        const teamIdsInt = selectedTeams.map((user) => user.value);
        updateQuerySettingsTeams(teamIdsInt);
      }}
      options={selectListTeams}
      value={storedSelectTeams}
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

export default TeamsQueryComponent;
