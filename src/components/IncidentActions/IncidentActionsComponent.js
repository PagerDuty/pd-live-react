import React from 'react';

import {
  Box,
  Flex,
} from '@chakra-ui/react';

import SelectedIncidentsComponent from './subcomponents/SelectedIncidentsComponent';

import AcknowledgeButton from './subcomponents/AcknowledgeButton';
import ResolveButton from './subcomponents/ResolveButton';
import MergeButton from './subcomponents/MergeButton';
import ReassignButton from './subcomponents/ReassignButton';
import AddRespondersButton from './subcomponents/AddRespondersButton';
import AddNoteButton from './subcomponents/AddNoteButton';
import EscalateMenu from './subcomponents/EscalateMenu';
import SnoozeMenu from './subcomponents/SnoozeMenu';
import PriorityMenu from './subcomponents/PriorityMenu';
import RunActionMenu from './subcomponents/RunActionMenu';

import './IncidentActionsComponent.scss';

const IncidentActionsComponent = () => (
  <Flex
    direction="row"
    align="center"
    alignItems="flex-start"
    justify="space-between"
    flexWrap="wrap"
    w="100%"
    m={0}
    overflow="hidden"
  >
    <Box>
      <SelectedIncidentsComponent />
    </Box>
    <Box
      ml={2}
      mr="auto"
    >
      <AcknowledgeButton />
      <EscalateMenu />
      <ReassignButton />
      <AddRespondersButton />
      <SnoozeMenu />
      <MergeButton />
      <ResolveButton />
    </Box>
    <Box>
      <PriorityMenu />
      <AddNoteButton />
      <RunActionMenu />
    </Box>
  </Flex>
);

export default IncidentActionsComponent;
