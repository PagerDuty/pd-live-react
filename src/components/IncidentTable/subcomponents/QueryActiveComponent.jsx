import {
  Container, Row, Spinner,
} from 'react-bootstrap';
import {
  useTranslation,
} from 'react-i18next';

const QueryActiveComponent = () => {
  const {
    t,
  } = useTranslation();
  return (
    <Container className="query-active-ctr" fluid>
      <br />
      <Row className="justify-content-md-center">
        <Spinner className="" animation="border" role="status" variant="success" />
        <h5 className="querying-incidents">
          <b>{t('Querying PagerDuty API')}</b>
        </h5>
      </Row>
    </Container>
  );
};

export default QueryActiveComponent;
