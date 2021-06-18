import { useEffect } from 'react';
import { connect } from "react-redux";
import { Container } from 'react-bootstrap';

import moment from "moment";

import NavigationBarComponent from "components/NavigationBar/NavigationBarComponent";
import QuerySettingsComponent from "components/QuerySettings/QuerySettingsComponent";
import IncidentTableComponent from "components/IncidentTable/IncidentTableComponent";
import IncidentActionsComponent from "components/IncidentActions/IncidentActionsComponent";

import { getIncidentsAsync } from "redux/incidents/actions";
import { getLogEntriesAsync, cleanRecentLogEntriesAsync } from "redux/log_entries/actions";
import { getServicesAsync } from "redux/services/actions";
import { getTeamsAsync } from "redux/teams/actions";
import { getPrioritiesAsync } from "redux/priorities/actions";

import 'App.css';

const App = ({
  logEntries,
  getServicesAsync,
  getTeamsAsync,
  getPrioritiesAsync,
  getIncidentsAsync,
  getLogEntriesAsync,
  cleanRecentLogEntriesAsync
}) => {
  let since = new Date("2021-06-15");
  let now = new Date();
  let until = moment(now).subtract(5, "minutes").toDate();

  // Initial load of objects from API
  getServicesAsync();
  getTeamsAsync();
  getPrioritiesAsync();
  getIncidentsAsync(since, now);

  // Setup log entry polling.
  let { lastPolled } = logEntries;
  useEffect(() => {
    const interval = setInterval(() => {
      let lastPolledDate = lastPolled ? new Date(lastPolled) : until;
      getLogEntriesAsync(lastPolledDate);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <NavigationBarComponent />
      <Container fluid>
        <QuerySettingsComponent />
        <IncidentTableComponent />
        <IncidentActionsComponent />
      </Container>
    </div>
  );
}

const mapStateToProps = (state) => ({
  logEntries: state.logEntries
});

const mapDispatchToProps = (dispatch) => ({
  getServicesAsync: (teamIds) => dispatch(getServicesAsync(teamIds)),
  getTeamsAsync: () => dispatch(getTeamsAsync()),
  getPrioritiesAsync: () => dispatch(getPrioritiesAsync()),
  getIncidentsAsync: (since, until) => dispatch(getIncidentsAsync(since, until)),
  getLogEntriesAsync: (since) => dispatch(getLogEntriesAsync(since)),
  cleanRecentLogEntriesAsync: () => dispatch(cleanRecentLogEntriesAsync()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
