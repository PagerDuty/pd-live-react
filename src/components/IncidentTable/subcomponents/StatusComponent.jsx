/* eslint-disable consistent-return */
import React from 'react';
import {
  Badge, OverlayTrigger, Tooltip,
} from 'react-bootstrap';

import {
  useTranslation,
} from 'react-i18next';

import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faShieldAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import {
  TRIGGERED, ACKNOWLEDGED, RESOLVED,
} from 'src/util/incidents';

const InternalStatusComponent = (tooltip, variant, icon) => (
  <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
    <Badge className="status-badge" bg={variant} text="light">
      <FontAwesomeIcon icon={icon} />
    </Badge>
  </OverlayTrigger>
);

const StatusComponent = ({
  status,
}) => {
  const {
    t,
  } = useTranslation();
  if (status === TRIGGERED) {
    return InternalStatusComponent(t('Triggered'), 'danger', faExclamationTriangle);
  }
  if (status === ACKNOWLEDGED) {
    return InternalStatusComponent(t('Acknowledged'), 'warning', faShieldAlt);
  }
  if (status === RESOLVED) {
    return InternalStatusComponent(t('Resolved'), 'success', faCheckCircle);
  }
};

export default StatusComponent;
