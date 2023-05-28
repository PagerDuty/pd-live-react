import React from 'react';

import {
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

// TODO: add back global search component
// import GlobalSearchComponent from 'components/GlobalSearch/GlobalSearchComponent';
import DatePickerComponent from './subcomponents/DatePickerComponent';
import StatusQueryComponent from './subcomponents/StatusQueryComponent';
import UrgencyQueryComponent from './subcomponents/UrgencyQueryComponent';
import PriorityQueryComponent from './subcomponents/PriorityQueryComponent';
import UsersQueryComponent from './subcomponents/UsersQueryComponent';
import TeamsQueryComponent from './subcomponents/TeamsQueryComponent';
import EscalationPolicyQueryComponent from './subcomponents/EscalationPolicyQueryComponent';
import ServicesQueryComponent from './subcomponents/ServicesQueryComponent';

import './QuerySettingsComponent.scss';

const BoxForInput = ({
  label,
  children,
}) => (
  <Box
    mr={1}
    mb={1}
    p={1}
    borderWidth="1px"
    rounded="md"
  >
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

  return (
    <Box
      m={4}
    >
      <Flex
        // justifyContent="space-between"
        alignItems="stretch"
        flexWrap="wrap"
      >
        <BoxForInput
          label={`${t('Since')}:`}
        >
          <DatePickerComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Status')}:`}
        >
          <StatusQueryComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Urgency')}:`}
        >
          <UrgencyQueryComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Priority')}:`}
        >
          <PriorityQueryComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Team')}:`}
        >
          <TeamsQueryComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Users')}:`}
        >
          <UsersQueryComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Escalation Policy')}:`}
        >
          <EscalationPolicyQueryComponent />
        </BoxForInput>
        <BoxForInput
          label={`${t('Service')}:`}
        >
          <ServicesQueryComponent />
        </BoxForInput>
        {/* <GlobalSearchComponent /> */}
      </Flex>
    </Box>
  );
};

export default QuerySettingsComponent;
