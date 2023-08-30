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
  updateQuerySettingsEscalationPolicies as updateQuerySettingsEscalationPoliciesConnected,
} from 'src/redux/query_settings/actions';

const EscalationPolicyQueryComponent = () => {
  const {
    t,
  } = useTranslation();

  const epList = useSelector((state) => state.escalationPolicies.escalationPolicies);
  const epIds = useSelector((state) => state.querySettings.escalationPolicyIds);
  const dispatch = useDispatch();
  const updateQuerySettingsEscalationPolicies = (newEpIds) => {
    dispatch(updateQuerySettingsEscalationPoliciesConnected(newEpIds));
  };

  const enabled = useMemo(() => epList.length > 0, [epList]);

  const selectListEps = useMemo(
    () => (epList
      ? epList.map((team) => ({
        label: team.name,
        value: team.id,
      }))
      : []),
    [epList],
  );

  const storedSelectEps = useMemo(() => {
    const r = selectListEps && epIds ? getObjectsFromList(selectListEps, epIds, 'value') : [];
    return r;
  }, [selectListEps, epIds]);

  return (
    <Select
      id="query-escalation-policy-select"
      size="sm"
      isMulti
      isSearchable
      onChange={(selectedEps) => {
        const epIdsInt = selectedEps.map((user) => user.value);
        updateQuerySettingsEscalationPolicies(epIdsInt);
      }}
      options={selectListEps}
      value={storedSelectEps}
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

export default EscalationPolicyQueryComponent;
