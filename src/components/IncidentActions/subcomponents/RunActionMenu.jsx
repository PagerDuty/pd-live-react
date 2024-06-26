import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
} from '@chakra-ui/react';

import {
  FaPlay,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  CUSTOM_INCIDENT_ACTION, EXTERNAL_SYSTEM,
} from 'src/util/extensions';

import {
  runCustomIncidentAction as runCustomIncidentActionConnected,
  syncWithExternalSystem as syncWithExternalSystemConnected,
} from 'src/redux/incident_actions/actions';

import {
  runResponsePlayAsync as runResponsePlayAsyncConnected,
} from 'src/redux/response_plays/actions';

const RunActionMenu = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const responsePlays = useSelector((state) => state.responsePlays.responsePlays);
  const serviceExtensionMap = useSelector((state) => state.extensions.serviceExtensionMap);
  const dispatch = useDispatch();
  const runResponsePlayAsync = (incidents, responsePlay) => {
    dispatch(runResponsePlayAsyncConnected(incidents, responsePlay));
  };
  const runCustomIncidentAction = (incidents, webhook) => {
    dispatch(runCustomIncidentActionConnected(incidents, webhook));
  };
  const syncWithExternalSystem = (incidents, webhook) => {
    dispatch(syncWithExternalSystemConnected(incidents, webhook));
  };

  const enabled = useMemo(() => selectedRows.length === 1, [selectedRows]);
  const selectedIncident = useMemo(
    () => (selectedRows.length === 1 ? selectedRows[0] : null),
    [selectedRows],
  );
  const serviceExtensions = useMemo(
    () => (selectedIncident ? serviceExtensionMap[selectedIncident.service.id] : []),
    [selectedIncident],
  );
  const customIncidentActions = useMemo(
    () => (serviceExtensions
      ? serviceExtensions.filter(
        (serviceExtension) => serviceExtension.extension_type === CUSTOM_INCIDENT_ACTION,
      )
      : []),
    [serviceExtensions],
  );

  const selectListResponsePlays = responsePlays.length > 0
    ? responsePlays.map((responsePlay) => ({
      label: responsePlay.summary,
      value: responsePlay.id,
      summary: responsePlay.summary,
      id: responsePlay.id,
    }))
    : [];

  const externalSystems = useMemo(() => {
    if (!selectedIncident) {
      return [];
    }
    const externalSystemsTemp = serviceExtensions
      ? serviceExtensions.filter(
        (serviceExtension) => serviceExtension.extension_type === EXTERNAL_SYSTEM,
      )
      : [];

    const tempExternalSystems = externalSystemsTemp.map((serviceExtension) => {
      const tempServiceExtension = { ...serviceExtension };
      const result = selectedIncident.external_references
        ? selectedIncident.external_references.find(
          ({
            webhook,
          }) => webhook.id === serviceExtension.id,
        )
        : null;
      if (result) {
        tempServiceExtension.synced = true;
        tempServiceExtension.extension_label = `Synced with
            ${result.webhook.summary} (${result.external_id})`;
      } else {
        tempServiceExtension.synced = false;
      }
      return tempServiceExtension;
    });
    return tempExternalSystems;
  }, [selectedIncident, serviceExtensions]);

  return (
    <Menu>
      <MenuButton
        className="incident-action-run-action-button"
        size="sm"
        as={Button}
        leftIcon={<FaPlay />}
        mr={2}
        mb={2}
        isDisabled={!enabled}
      >
        {t('Run Action')}
      </MenuButton>
      <MenuList size="content" preventOverflow>
        {selectListResponsePlays.length > 0 && (
          <MenuGroup fontSize="md" ml={2} title={t('Response Plays')}>
            {selectListResponsePlays.map((responsePlay) => (
              <MenuItem
                className="dropdown-item"
                key={responsePlay.id}
                onClick={() => {
                  runResponsePlayAsync(selectedRows, responsePlay);
                }}
              >
                {responsePlay.summary}
              </MenuItem>
            ))}
          </MenuGroup>
        )}
        {selectListResponsePlays.length > 0
          && (customIncidentActions.length > 0 || externalSystems.length > 0) && <MenuDivider />}
        {customIncidentActions.length > 0 && (
          <MenuGroup fontSize="md" ml={2} title={t('Actions')}>
            {customIncidentActions.map((customIncidentAction) => (
              <MenuItem
                className="dropdown-item"
                key={customIncidentAction.id}
                onClick={() => {
                  runCustomIncidentAction(selectedRows, customIncidentAction);
                }}
              >
                {customIncidentAction.name}
              </MenuItem>
            ))}
          </MenuGroup>
        )}
        {customIncidentActions.length > 0 && externalSystems.length > 0 && <MenuDivider />}
        {externalSystems.length > 0 && (
          <MenuGroup fontSize="md" ml={2} title={t('External Systems')}>
            {externalSystems.map((externalSystem) => (
              <MenuItem
                className="dropdown-item"
                key={externalSystem.id}
                disabled={externalSystem.synced}
                onClick={() => {
                  syncWithExternalSystem(selectedRows, externalSystem);
                }}
              >
                {externalSystem.extension_label}
              </MenuItem>
            ))}
          </MenuGroup>
        )}
      </MenuList>
    </Menu>
  );
};

export default RunActionMenu;
