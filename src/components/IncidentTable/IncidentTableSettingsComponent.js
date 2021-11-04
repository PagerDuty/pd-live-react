import { useState } from 'react';
import { connect } from 'react-redux';

import {
  Modal,
  Button,
  Tabs,
  Tab,
} from 'react-bootstrap';

import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';

import './IncidentTableSettingsComponent.scss';

import {
  toggleIncidentTableSettings,
  saveIncidentTableSettings,
} from 'redux/incident_table/actions';

import {
  availableIncidentTableColumns,
  getIncidentTableColumns,
} from 'util/incident-table-columns';

const columnMapper = (column) => ({
  label: column.Header,
  value: column.Header,
});

const IncidentTableSettingsComponent = ({
  incidentTableSettings,
  toggleIncidentTableSettings,
  saveIncidentTableSettings,
}) => {
  const { incidentTableColumnsNames, displayIncidentTableSettings } = incidentTableSettings;

  // Create internal state for options
  const transformedIncidentTableColumns = getIncidentTableColumns(incidentTableColumnsNames);
  const [selectedColumns, setSelectedColumns] = useState(
    transformedIncidentTableColumns.map(columnMapper),
  );
  const availableColumns = availableIncidentTableColumns.map(columnMapper);

  return (
    <div className="incident-table-settings-ctr">
      <Modal
        backdrop="static"
        size="lg"
        show={displayIncidentTableSettings}
        onHide={toggleIncidentTableSettings}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h3">Incident Table Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="columns">
            <Tab eventKey="columns" title="Columns">
              <br />
              <DualListBox
                canFilter
                preserveSelectOrder
                showOrderButtons
                showHeaderLabels
                showNoOptionsText
                simpleValue={false}
                options={availableColumns}
                selected={selectedColumns}
                onChange={(cols) => setSelectedColumns(cols)}
              />
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => saveIncidentTableSettings(selectedColumns)}>
            Save Changes
          </Button>
          <Button variant="light" onClick={toggleIncidentTableSettings}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  incidentTableSettings: state.incidentTableSettings,
});

const mapDispatchToProps = (dispatch) => ({
  toggleIncidentTableSettings: () => dispatch(toggleIncidentTableSettings()),
  saveIncidentTableSettings: (updatedIncidentTableColumns) => dispatch(
    saveIncidentTableSettings(updatedIncidentTableColumns),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(IncidentTableSettingsComponent);
