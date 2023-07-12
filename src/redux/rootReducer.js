import {
  combineReducers,
} from 'redux';

import {
  persistReducer,
} from 'redux-persist';
import {
  querySettingsPersistConfig, userPersistConfig,
} from './persistence/config';

import actionAlertsModalData from './action_alerts/reducers';
import incidents from './incidents/reducers';
import logEntries from './log_entries/reducers';
import querySettings from './query_settings/reducers';
import incidentTable from './incident_table/reducers';
import incidentActions from './incident_actions/reducers';
import services from './services/reducers';
import teams from './teams/reducers';
import priorities from './priorities/reducers';
import users from './users/reducers';
import escalationPolicies from './escalation_policies/reducers';
import extensions from './extensions/reducers';
import responsePlays from './response_plays/reducers';
import fields from './fields/reducers';
import persistence from './persistence/reducers';
import settings from './settings/reducers';
import connection from './connection/reducers';

export default combineReducers({
  actionAlertsModalData,
  incidents,
  logEntries,
  querySettings: persistReducer(querySettingsPersistConfig, querySettings),
  incidentTable,
  incidentActions,
  services,
  teams,
  priorities,
  users: persistReducer(userPersistConfig, users),
  escalationPolicies,
  extensions,
  responsePlays,
  fields,
  persistence,
  settings,
  connection,
});
