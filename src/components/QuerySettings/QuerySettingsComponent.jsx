import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Box, Flex, Text,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import {
  updateQuerySettingsServices as updateQuerySettingsServicesConnected,
  updateQuerySettingsEscalationPolicies as updateQuerySettingsEscalationPoliciesConnected,
  updateQuerySettingsUsers as updateQuerySettingsUsersConnected,
  updateQuerySettingsTeams as updateQuerySettingsTeamsConnected,
} from 'src/redux/query_settings/actions';

import ServiceSelect from 'src/components/Common/ServiceSelect';
import EscalationPolicySelect from 'src/components/Common/EscalationPolicySelect';
import UserSelect from 'src/components/Common/UserSelect';
import TeamSelect from 'src/components/Common/TeamSelect';

import DatePickerComponent from './subcomponents/DatePickerComponent';
import StatusQueryComponent from './subcomponents/StatusQueryComponent';
import UrgencyQueryComponent from './subcomponents/UrgencyQueryComponent';
import PriorityQueryComponent from './subcomponents/PriorityQueryComponent';
import ColumnFilterIndicatorComponent from './subcomponents/ColumnFilterIndicatorComponent';

import './QuerySettingsComponent.scss';

const BoxForInput = ({
  label, children,
}) => (
  <Box mr={1} mb={1} p={1} borderWidth="1px" rounded="md">
    <Text fontSize="sm" my={1}>
      {label}
    </Text>
    {children}
  </Box>
);

const QuerySettingsComponent = () => {
  const {
    t,
  } = useTranslation();

  const {
    serviceIds, escalationPolicyIds, userIds, teamIds,
  } = useSelector(
    (state) => state.querySettings,
  );
  const {
    filters,
  } = useSelector((state) => state.incidentTable.incidentTableState);

  const dispatch = useDispatch();
  const updateQuerySettingsServices = (newServiceIds) => {
    dispatch(updateQuerySettingsServicesConnected(newServiceIds));
  };
  const updateQuerySettingsEscalationPolicies = (newEpIds) => {
    dispatch(updateQuerySettingsEscalationPoliciesConnected(newEpIds));
  };
  const updateQuerySettingsUsers = (newUserIds) => {
    dispatch(updateQuerySettingsUsersConnected(newUserIds));
  };
  const updateQuerySettingsTeams = (newTeamIds) => {
    dispatch(updateQuerySettingsTeamsConnected(newTeamIds));
  };

  const filterCount = useMemo(() => {
    if (filters instanceof Array) {
      return filters.length;
    }
    return 0;
  }, [filters]);

  return (
    <Box m={4}>
      <Flex
        // justifyContent="space-between"
        alignItems="stretch"
        flexWrap="wrap"
      >
        <BoxForInput label={`${t('Created At')}:`}>
          <DatePickerComponent />
        </BoxForInput>
        <BoxForInput label={`${t('Status')}:`}>
          <StatusQueryComponent />
        </BoxForInput>
        <BoxForInput label={`${t('Urgency')}:`}>
          <UrgencyQueryComponent />
        </BoxForInput>
        <BoxForInput label={`${t('Priority')}:`}>
          <PriorityQueryComponent />
        </BoxForInput>
        <BoxForInput label={`${t('Team')}:`}>
          <TeamSelect
            id="query-team-select"
            value={teamIds}
            onChange={updateQuerySettingsTeams}
            isMulti
          />
        </BoxForInput>
        <BoxForInput label={`${t('Users')}:`}>
          <UserSelect
            id="query-user-select"
            value={userIds}
            onChange={updateQuerySettingsUsers}
            isMulti
          />
        </BoxForInput>
        <BoxForInput label={`${t('Escalation Policy')}:`}>
          <EscalationPolicySelect
            id="query-escalation-policy-select"
            value={escalationPolicyIds}
            onChange={updateQuerySettingsEscalationPolicies}
            isMulti
          />
        </BoxForInput>
        <BoxForInput label={`${t('Service')}:`}>
          <ServiceSelect
            id="query-service-select"
            value={serviceIds}
            onChange={updateQuerySettingsServices}
            isMulti
          />
        </BoxForInput>
        {filterCount > 0 && (
          <BoxForInput label={`${t('Column Filters')}:`}>
            <ColumnFilterIndicatorComponent />
          </BoxForInput>
        )}
      </Flex>
    </Box>
  );
};

export default QuerySettingsComponent;
