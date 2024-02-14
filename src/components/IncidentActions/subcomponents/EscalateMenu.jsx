import React, {
  useMemo, useState, useEffect,
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
  escalate as escalateConnected,
} from 'src/redux/incident_actions/actions';

import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

const EscalateMenu = () => {
  const {
    t,
  } = useTranslation();
  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const escalate = (incidents, escalationLevel) => dispatch(escalateConnected(incidents, escalationLevel));
  const enabled = useMemo(() => {
    if (selectedRows.length !== 1) {
      return false;
    }
    const incident = selectedRows[0];
    return incident.status !== RESOLVED && incident.urgency === HIGH;
  }, [selectedRows]);

  const [selectedEscalationRules, setSelectedEscalationRules] = useState([]);

  useEffect(() => {
    if (selectedRows.length !== 1) {
      setSelectedEscalationRules([]);
      return;
    }
    const selectedEscalationPolicyId = selectedRows[0].escalation_policy.id;
    const fetchEscalationPolicy = async () => {
      const r = await throttledPdAxiosRequest(
        'GET',
        `escalation_policies/${selectedEscalationPolicyId}`,
      );
      setSelectedEscalationRules(r.data.escalation_policy.escalation_rules.slice(0).reverse());
    };
    fetchEscalationPolicy();
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
