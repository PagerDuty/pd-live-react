import React from 'react';

import {
  Box, Flex,
} from '@chakra-ui/react';

import {
  EXTRA_BUTTONS,
} from 'src/config/constants';

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
import ExtraButton from './subcomponents/ExtraButton';

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
    <Box ml={2} mr="auto">
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
      {EXTRA_BUTTONS
        && EXTRA_BUTTONS.map(({
          label, url, width, height, tab,
        }) => (
          <>
            {tab ? (
              <ExtraButton key={url} label={label} url={url} tab />
            ) : (
              <ExtraButton key={url} label={label} url={url} width={width} height={height} />
            )}
          </>
        ))}
    </Box>
  </Flex>
);

export default IncidentActionsComponent;
