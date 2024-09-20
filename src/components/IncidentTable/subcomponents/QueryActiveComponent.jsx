import React from 'react';
import {
  Container, Spinner,
} from '@chakra-ui/react';
import {
  useTranslation,
} from 'react-i18next';

const QueryActiveComponent = () => {
  const {
    t,
  } = useTranslation();
  return (
    <Container className="query-active-ctr" centerContent>
      <br />
      <Spinner />
      <h5 className="querying-incidents">
        <b>{t('Querying PagerDuty API')}</b>
      </h5>
    </Container>
  );
};

export default QueryActiveComponent;
