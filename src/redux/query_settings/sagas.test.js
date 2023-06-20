import {
  select,
} from 'redux-saga/effects';
import {
  expectSaga,
} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  MAX_INCIDENTS_LIMIT_LOWER,
} from 'config/constants';

import {
  pd,
} from 'util/pd-api-wrapper';
import {
  generateRandomInteger,
} from 'util/helpers';

import {
  generateMockIncidents,
} from 'mocks/incidents.test';

import {
  generateMockUsers,
} from 'mocks/users.test';

import {
  generateMockTeams,
} from 'mocks/teams.test';

import {
  generateMockEscalationPolicies,
} from 'mocks/escalation_policies.test';

import {
  generateMockServices,
} from 'mocks/services.test';

import {
  UPDATE_CONNECTION_STATUS_REQUESTED,
} from 'redux/connection/actions';
import connection from 'redux/connection/reducers';

import selectSettings from 'redux/settings/selectors';

import {
  TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED,
  TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_COMPLETED,
  UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED,
  UPDATE_TOTAL_INCIDENTS_FROM_QUERY_COMPLETED,
  CONFIRM_INCIDENT_QUERY_REQUESTED,
  CONFIRM_INCIDENT_QUERY_COMPLETED,
  CONFIRM_INCIDENT_QUERY_ERROR,
  UPDATE_QUERY_SETTINGS_USERS_REQUESTED,
  UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED,
  UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED,
  UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED,
  VALIDATE_INCIDENT_QUERY_REQUESTED,
} from './actions';
import querySettings from './reducers';
import selectQuerySettings from './selectors';
import {
  validateIncidentQueryImpl,
  toggleDisplayConfirmQueryModal,
  updateTotalIncidentsFromQuery,
  confirmIncidentQuery,
  updateQuerySettingsUsers,
  updateQuerySettingsTeams,
  updateQuerySettingsEscalationPolicies,
  updateQuerySettingsServices,
} from './sagas';

// FIXME: Query settings implementation changed in
xdescribe('Sagas: Query Settings', () => {
  const mockIncidents = generateMockIncidents(1);
  const mockSelector = {
    sinceDate: new Date(),
    incidentStatus: ['triggered'],
    incidentUrgency: ['high'],
    teamIds: [],
    escalationPolicyIds: [],
    serviceIds: [],
    userIds: [],
  };
  const expectedMockResponse = {
    data: {
      incidents: mockIncidents,
      limit: 1,
    },
  };
  const mockSettings = {
    maxIncidentsLimit: MAX_INCIDENTS_LIMIT_LOWER,
    autoAcceptIncidentsQuery: true,
    serverSideFiltering: true,
  };

  it('validateIncidentQueryImpl: Within MAX_INCIDENTS_LIMIT_LOWER', () => {
    expectedMockResponse.data.total = generateRandomInteger(1, MAX_INCIDENTS_LIMIT_LOWER);
    expectedMockResponse.status = 200;
    return expectSaga(validateIncidentQueryImpl)
      .withReducer(querySettings)
      .provide([
        [select(selectQuerySettings), mockSelector],
        [select(selectSettings), mockSettings],
        [
          // Matchers is used to mock API calls - ignores params used
          matchers.call.fn(pd.get),
          expectedMockResponse,
        ],
      ])
      .silentRun()
      .then((result) => {
        // NB due to weird race condition, we can't accurately match on ISO Date string
        expect(result.storeState.status).toEqual(CONFIRM_INCIDENT_QUERY_REQUESTED);
      });
  });

  it('validateIncidentQueryImpl: Over MAX_INCIDENTS_LIMIT_LOWER', () => {
    expectedMockResponse.data.total = generateRandomInteger(
      MAX_INCIDENTS_LIMIT_LOWER + 1,
      MAX_INCIDENTS_LIMIT_LOWER * 2,
    );
    expectedMockResponse.status = 200;
    return expectSaga(validateIncidentQueryImpl)
      .withReducer(querySettings)
      .provide([
        [select(selectQuerySettings), mockSelector],
        [select(selectSettings), mockSettings],
        [matchers.call.fn(pd.get), expectedMockResponse],
      ])
      .silentRun()
      .then((result) => {
        // FIXME: This was previously `expect(result.storeState.status).toEqual(TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED);`
        // but changed in https://github.com/giranm/pd-live-react/pull/449 due to introduction of a better implementation with API rate limits
        expect(result.storeState.status).toEqual(CONFIRM_INCIDENT_QUERY_REQUESTED);
      });
  });

  it('validateIncidentQueryImpl: Over MAX_INCIDENTS_LIMIT_LOWER with auto-accept query', () => {
    expectedMockResponse.data.total = generateRandomInteger(
      MAX_INCIDENTS_LIMIT_LOWER + 1,
      MAX_INCIDENTS_LIMIT_LOWER * 2,
    );
    expectedMockResponse.status = 200;
    mockSettings.autoAcceptIncidentsQuery = true;
    return expectSaga(validateIncidentQueryImpl)
      .withReducer(querySettings)
      .provide([
        [select(selectQuerySettings), mockSelector],
        [select(selectSettings), mockSettings],
        [matchers.call.fn(pd.get), expectedMockResponse],
      ])
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(CONFIRM_INCIDENT_QUERY_REQUESTED);
      });
  });

  it('validateIncidentQueryImpl: API Error', () => {
    expectedMockResponse.status = 429;
    return expectSaga(validateIncidentQueryImpl)
      .withReducer(connection)
      .provide([
        [select(selectQuerySettings), mockSelector],
        [select(selectSettings), mockSettings],
        [matchers.call.fn(pd.get), expectedMockResponse],
      ])
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(UPDATE_CONNECTION_STATUS_REQUESTED);
      });
  });

  it('toggleDisplayConfirmQueryModal: displayConfirmQueryModal === false', () => {
    mockSelector.displayConfirmQueryModal = false;
    const expectedResult = true;
    return expectSaga(toggleDisplayConfirmQueryModal)
      .withReducer(querySettings)
      .provide([
        [select(selectQuerySettings), mockSelector],
        [select(selectSettings), mockSettings],
      ])
      .dispatch({ type: TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED })
      .silentRun()
      .then((result) => {
        expect(result.storeState.displayConfirmQueryModal).toEqual(expectedResult);
        expect(result.storeState.status).toEqual(TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_COMPLETED);
      });
  });

  it('toggleDisplayConfirmQueryModal: displayConfirmQueryModal === true', () => {
    mockSelector.displayConfirmQueryModal = true;
    const expectedResult = false;
    return expectSaga(toggleDisplayConfirmQueryModal)
      .withReducer(querySettings)
      .provide([
        [select(selectQuerySettings), mockSelector],
        [select(selectSettings), mockSettings],
      ])
      .dispatch({ type: TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_REQUESTED })
      .silentRun()
      .then((result) => {
        expect(result.storeState.displayConfirmQueryModal).toEqual(expectedResult);
        expect(result.storeState.status).toEqual(TOGGLE_DISPLAY_CONFIRM_QUERY_MODAL_COMPLETED);
      });
  });

  it('updateTotalIncidentsFromQuery', () => {
    const totalIncidentsFromQuery = generateRandomInteger(0, MAX_INCIDENTS_LIMIT_LOWER);
    return expectSaga(updateTotalIncidentsFromQuery)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: UPDATE_TOTAL_INCIDENTS_FROM_QUERY_REQUESTED, totalIncidentsFromQuery })
      .silentRun()
      .then((result) => {
        expect(result.storeState.totalIncidentsFromQuery).toEqual(totalIncidentsFromQuery);
        expect(result.storeState.status).toEqual(UPDATE_TOTAL_INCIDENTS_FROM_QUERY_COMPLETED);
      });
  });

  it('confirmIncidentQuery: confirm === true', () => {
    const confirm = true;
    return expectSaga(confirmIncidentQuery)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: CONFIRM_INCIDENT_QUERY_REQUESTED, confirm })
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(CONFIRM_INCIDENT_QUERY_COMPLETED);
      });
  });

  it('confirmIncidentQuery: confirm === false', () => {
    const confirm = false;
    return expectSaga(confirmIncidentQuery)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: CONFIRM_INCIDENT_QUERY_REQUESTED, confirm })
      .silentRun()
      .then((result) => {
        expect(result.storeState.status).toEqual(CONFIRM_INCIDENT_QUERY_ERROR);
      });
  });

  it('updateQuerySettingsUsers', () => {
    const users = generateMockUsers(2);
    const userIds = users.map((user) => user.id);
    return expectSaga(updateQuerySettingsUsers)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: UPDATE_QUERY_SETTINGS_USERS_REQUESTED, userIds })
      .silentRun()
      .then((result) => {
        expect(result.storeState.userIds).toEqual(userIds);
        expect(result.storeState.status).toEqual(VALIDATE_INCIDENT_QUERY_REQUESTED);
      });
  });

  it('updateQuerySettingsTeams', () => {
    const teams = generateMockTeams(2);
    const teamIds = teams.map((team) => team.id);
    return expectSaga(updateQuerySettingsTeams)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED, teamIds })
      .silentRun()
      .then((result) => {
        expect(result.storeState.teamIds).toEqual(teamIds);
        expect(result.storeState.status).toEqual(VALIDATE_INCIDENT_QUERY_REQUESTED);
      });
  });

  it('updateQuerySettingsEscalationPolicies', () => {
    const escalationPolicies = generateMockEscalationPolicies(2);
    const escalationPolicyIds = escalationPolicies.map((escalationPolicy) => escalationPolicy.id);
    return expectSaga(updateQuerySettingsEscalationPolicies)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED, escalationPolicyIds })
      .silentRun()
      .then((result) => {
        expect(result.storeState.escalationPolicyIds).toEqual(escalationPolicyIds);
        expect(result.storeState.status).toEqual(VALIDATE_INCIDENT_QUERY_REQUESTED);
      });
  });

  it('updateQuerySettingsServices', () => {
    const services = generateMockServices(2);
    const serviceIds = services.map((service) => service.id);
    return expectSaga(updateQuerySettingsServices)
      .withReducer(querySettings)
      .provide([[select(selectSettings), mockSettings]])
      .dispatch({ type: UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED, serviceIds })
      .silentRun()
      .then((result) => {
        expect(result.storeState.serviceIds).toEqual(serviceIds);
        expect(result.storeState.status).toEqual(VALIDATE_INCIDENT_QUERY_REQUESTED);
      });
  });
});
