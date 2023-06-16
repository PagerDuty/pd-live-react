import React, {
  useMemo,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  // MenuDivider,
} from '@chakra-ui/react';

import {
  FaExclamation,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  updatePriority as updatePriorityConnected,
} from 'redux/incident_actions/actions';

const PriorityMenu = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const priorities = useSelector((state) => state.priorities.priorities);
  const dispatch = useDispatch();
  const updatePriority = (incidents, priorityId) => {
    dispatch(updatePriorityConnected(incidents, priorityId));
  };

  const enabled = useMemo(() => selectedRows.length > 0, [selectedRows]);

  return (
    <Menu>
      <MenuButton
        className="incident-action-update-priority-button"
        size="sm"
        as={Button}
        leftIcon={<FaExclamation />}
        mr={2}
        mb={2}
        isDisabled={!enabled}
      >
        {t('Update Priority')}
      </MenuButton>
      <MenuList w={10}>
        {priorities.map((priority) => (
          <MenuItem
            className="dropdown-item"
            key={priority.id}
            onClick={() => updatePriority(selectedRows, priority.id)}
          >
            <Flex
              ml={6}
              mr={2}
              p={0}
              borderRadius="full"
              bg={`#${priority.color}`}
              h={5}
              w={5}
            />
            {priority.name}
            {/* </p> */}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PriorityMenu;
