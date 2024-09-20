import React from 'react';
import {
  Badge,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import EmptyIncidents from 'src/assets/images/empty_incidents.svg';

const EmptyIncidentsComponent = ({
  message,
}) => {
  const {
    t,
  } = useTranslation();
  const badgeMessage = message || t('No Incidents Found');
  return (
    <div className="empty-incidents">
      <EmptyIncidents />
      <h1 className="empty-incidents-badge">
        <Badge>{badgeMessage}</Badge>
      </h1>
    </div>
  );
};

export default EmptyIncidentsComponent;
