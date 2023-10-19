import React, {
  useRef,
  useState,
} from 'react';

import {
  useDispatch,
} from 'react-redux';

import {
  Box,
  Flex,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Skeleton,
  PopoverHeader,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';

import {
  AddIcon,
  CheckIcon,
} from '@chakra-ui/icons';

import i18next from 'i18next';

import Linkify from 'linkify-react';

import {
  addNote as addNoteConnected,
} from 'src/redux/incident_actions/actions';

const linkifyOptions = { target: { url: '_blank' }, rel: 'noopener noreferrer' };

const LatestNoteComponent = ({
  incident,
}) => {
  const noteRef = useRef(null);
  const [note, setNote] = useState('');
  const {
    isOpen,
    onToggle,
    onClose,
  } = useDisclosure();
  const dispatch = useDispatch();
  const addNote = (incidents, noteContent) => dispatch(addNoteConnected(incidents, noteContent, true, false));

  return (
    <Box
      position="relative"
      width="full"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box
        className="td-wrapper"
        pr={8}
      >
        <Linkify options={linkifyOptions}>
          {incident.notes?.length > 0 && incident.notes.slice(-1)[0].content}
          {incident.notes?.length === 0 && '--'}
          {incident.notes?.status === 'fetching' && <Skeleton>fetching</Skeleton>}
        </Linkify>
      </Box>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={noteRef}
      >
        <PopoverTrigger>
          <IconButton
            size="xs"
            position="absolute"
            right={0}
            top="50%"
            transform="translateY(-50%)"
            colorScheme="blue"
            icon={<AddIcon />}
            onClick={() => {
              onToggle();
            }}
            aria-label={i18next.t('Add Note')}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {i18next.t('Add Note')}
          </PopoverHeader>
          <PopoverBody>
            <Flex>
              <Textarea
                size="sm"
                resize="none"
                ref={noteRef}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                }}
              />
              <IconButton
                size="sm"
                ml={2}
                onClick={() => {
                  addNote([incident], note);
                  setNote('');
                  onClose();
                }}
                isDisabled={!note}
                colorScheme="blue"
                icon={<CheckIcon />}
              />
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default LatestNoteComponent;
