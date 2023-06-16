import React, {
  useMemo,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  // MenuDivider,
} from '@chakra-ui/react';

import {
  FaBellSlash,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  filterIncidentsByField,
  getSnoozeTimes,
} from 'util/incidents';

import {
  snooze as snoozeConnected,
  toggleDisplayCustomSnoozeModal as toggleDisplayCustomSnoozeModalConnected,
} from 'redux/incident_actions/actions';

const SnoozeMenu = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const enabled = useMemo(() => {
    const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
      TRIGGERED,
      ACKNOWLEDGED,
    ]);
    return (unresolvedIncidents.length > 0);
  }, [selectedRows]);
  const snooze = (incidents, duration) => dispatch(snoozeConnected(incidents, duration));
  const toggleDisplayCustomSnoozeModal = () => dispatch(toggleDisplayCustomSnoozeModalConnected());
  const snoozeTimes = useMemo(() => getSnoozeTimes(), []);

  return (
    <Menu>
      <MenuButton
        className="incident-action-snooze-button"
        size="sm"
        as={Button}
        leftIcon={<FaBellSlash />}
        mr={2}
        mb={2}
        isDisabled={!enabled}
      >
        {t('Snooze')}
      </MenuButton>
      <MenuList>
        {Object.keys(snoozeTimes).map((duration) => (
          <MenuItem
            className="dropdown-item"
            key={duration}
            onClick={() => snooze(selectedRows, duration)}
          >
            {snoozeTimes[duration].i18n}
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem
          className="snooze-duration-custom-modal-button"
          key="custom-snooze"
          onClick={() => toggleDisplayCustomSnoozeModal()}
        >
          {t('Custom')}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default SnoozeMenu;
