import {
  queryHelpers, buildQueries,
} from '@testing-library/react';

const queryAllByIncidentHeader = (...args) => queryHelpers.queryAllByAttribute('data-incident-header', ...args);

const [getByIncidentHeader, getAllByIncidentHeader] = buildQueries(queryAllByIncidentHeader);

export { getByIncidentHeader, getAllByIncidentHeader };
