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
  // MenuDivider,
} from '@chakra-ui/react';

import {
  FaArrowUp,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  RESOLVED, HIGH,
} from 'src/util/incidents';

import {
  getObjectsFromListbyKey,
} from 'src/util/helpers';

import {
  escalate as escalateConnected,
} from 'src/redux/incident_actions/actions';

const EscalateMenu = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const escalationPolicies = useSelector((state) => state.escalationPolicies.escalationPolicies);
  const dispatch = useDispatch();
  const escalate = (incidents, escalationLevel) => dispatch(escalateConnected(incidents, escalationLevel));
  const enabled = useMemo(() => {
    if (selectedRows.length !== 1) {
      return false;
    }
    const incident = selectedRows[0];
    return incident.status !== RESOLVED && incident.urgency === HIGH;
  }, [selectedRows]);

  const selectedEscalationRules = useMemo(() => {
    if (selectedRows.length !== 1) {
      return [];
    }
    const selectedEscalationPolicyId = selectedRows[0].escalation_policy.id;
    const selectedEscalationPolicy = getObjectsFromListbyKey(
      escalationPolicies,
      'id',
      selectedEscalationPolicyId,
    )[0];
    return selectedEscalationPolicy
      ? selectedEscalationPolicy.escalation_rules.slice(0).reverse()
      : [];
  }, [selectedRows]);

  return (
    <Menu>
      <MenuButton
        className="incident-action-escalate-button"
        size="sm"
        as={Button}
        leftIcon={<FaArrowUp />}
        mr={2}
        mb={2}
        isDisabled={!enabled}
      >
        {t('Escalate')}
      </MenuButton>
      <MenuList>
        {selectedEscalationRules.map((escalationRule, idx) => {
          const escalationLevel = selectedEscalationRules.length - idx;
          return (
            <MenuItem
              className={`escalation-level-${escalationLevel}-button`}
              key={escalationRule.id}
              onClick={() => escalate(selectedRows, escalationLevel)}
            >
              {`Level ${escalationLevel}: ${escalationRule.targets
                .map((target) => target.summary)
                .join(', ')}`}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};

export default EscalateMenu;
