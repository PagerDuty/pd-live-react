import { connect } from 'react-redux';
import {
  Navbar, Nav, NavDropdown, Button,
} from 'react-bootstrap';

import GlobalSearchComponent from 'components/GlobalSearch/GlobalSearchComponent';

import PDOAuth from 'util/pdoauth';

import { toggleSettingsModal } from 'redux/settings/actions';
import { toggleDisplayQuerySettings } from 'redux/query_settings/actions';
import { userAcceptDisclaimer, userUnauthorize } from 'redux/users/actions';

import StatusBeaconComponent from './StatusBeaconComponent';

import './NavigationBarComponent.scss';

const NavigationBarComponent = ({
  displayQuerySettings,
  toggleSettingsModal,
  toggleDisplayQuerySettings,
  userAcceptDisclaimer,
  userUnauthorize,
}) => (
  <div className="navbar-ctr">
    <Navbar bg="light" variant="light">
      <Navbar.Brand className="nav-bar-logo-ctr">
        <div className="nav-bar-logo-black" href="/" alt="PagerDuty home page">
          PagerDuty
        </div>
      </Navbar.Brand>
      <Navbar.Brand className="font-weight-bold">
        Live Incidents Console
      </Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <Nav.Item className="ml-auto">
            <Button
              size="sm"
              className="filters-toggle"
              variant={displayQuerySettings ? 'success' : 'outline-success'}
              onClick={() => toggleDisplayQuerySettings()}
            >
              {`Filters ${displayQuerySettings ? '▼' : '▲'}`}
            </Button>
          </Nav.Item>
          <Nav.Item className="ml-auto">
            <GlobalSearchComponent />
          </Nav.Item>
          <Nav.Item className="ml-auto">
            <StatusBeaconComponent />
          </Nav.Item>
          <Nav.Item className="ml-auto">
            <NavDropdown
              className="settings-panel-dropdown"
              title={
                <div className="settings-panel-icon" />
            }
              alignRight
            >
              <NavDropdown.Item
                className="ml-auto"
                onClick={() => toggleSettingsModal()}
              >
                Settings
              </NavDropdown.Item>
              <NavDropdown.Item
                href="https://www.termsfeed.com/live/68d1a0f2-9e68-47d0-9623-68afe0c31f6d"
              >
                View Disclaimer
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  PDOAuth.logout();
                  userAcceptDisclaimer();
                  userUnauthorize();
                }}
              >
                Log Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  </div>
);
const mapStateToProps = (state) => ({
  displayQuerySettings: state.querySettings.displayQuerySettings,
});

const mapDispatchToProps = (dispatch) => ({
  toggleSettingsModal: () => dispatch(toggleSettingsModal()),
  toggleDisplayQuerySettings: () => dispatch(toggleDisplayQuerySettings()),
  userAcceptDisclaimer: () => dispatch(userAcceptDisclaimer()),
  userUnauthorize: () => dispatch(userUnauthorize()),
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBarComponent);
