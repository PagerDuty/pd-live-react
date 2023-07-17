import {
  select,
} from 'redux-saga/effects';
import {
  expectSaga,
} from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  pd,
} from 'util/pd-api-wrapper';

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

import connection from 'redux/connection/reducers';

import selectSettings from 'redux/settings/selectors';

import {
  UPDATE_QUERY_SETTINGS_USERS_REQUESTED,
  UPDATE_QUERY_SETTINGS_USERS_COMPLETED,
  UPDATE_QUERY_SETTINGS_TEAMS_REQUESTED,
  UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED,
  UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_REQUESTED,
  UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_COMPLETED,
  UPDATE_QUERY_SETTINGS_SERVICES_REQUESTED,
  UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED,
} from './actions';
import querySettings from './reducers';
import selectQuerySettings from './selectors';
import {
  validateIncidentQueryImpl,
  updateQuerySettingsUsers,
  updateQuerySettingsTeams,
  updateQuerySettingsEscalationPolicies,
  updateQuerySettingsServices,
} from './sagas';

describe('Sagas: Query Settings', () => {
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
    autoAcceptIncidentsQuery: true,
  };

  xit('validateIncidentQueryImpl: API Error', () => {
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
        expect(result.storeState.status).toEqual(''); // FIXME: Should this return a status?
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
        expect(result.storeState.status).toEqual(UPDATE_QUERY_SETTINGS_USERS_COMPLETED);
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
        expect(result.storeState.status).toEqual(UPDATE_QUERY_SETTINGS_TEAMS_COMPLETED);
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
        expect(result.storeState.status).toEqual(
          UPDATE_QUERY_SETTINGS_ESCALATION_POLICIES_COMPLETED,
        );
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
        expect(result.storeState.status).toEqual(UPDATE_QUERY_SETTINGS_SERVICES_COMPLETED);
      });
  });
});
