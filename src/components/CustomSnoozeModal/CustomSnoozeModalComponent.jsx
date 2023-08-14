import {
  useState,
} from 'react';
import {
  connect,
} from 'react-redux';
import moment from 'moment';

import {
  Modal, Form, Button, Row, Col,
} from 'react-bootstrap';

import DatePicker from 'react-datepicker';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayCustomSnoozeModal as toggleDisplayCustomSnoozeModalConnected,
  snooze as snoozeConnected,
} from 'redux/incident_actions/actions';

import {
  TRIGGERED, ACKNOWLEDGED, filterIncidentsByField,
} from 'util/incidents';

const CustomSnoozeModalComponent = ({
  toggleDisplayCustomSnoozeModal,
  snooze,
  incidentActions,
  incidentTable,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    displayCustomSnoozeModal,
  } = incidentActions;

  // Internal state for snooze in hours
  const defaultSnoozeTimeHours = 1;
  const initialSnoozeTime = moment().add({ hour: defaultSnoozeTimeHours });
  const [snoozeTime, setSnoozeTime] = useState(initialSnoozeTime.toDate());
  const snoozeDuration = moment(snoozeTime).diff(moment());
  const snoozeDurationFormatted = moment(snoozeDuration).format(`H[ ${t('hours')}]`);

  // Internal state for snooze after tomorrow
  const tomorrow = moment().add({ days: 1 }).set({ hour: 8, minute: 0 });
  const [tomorrowSnoozeDate, setTomorrowSnoozeDate] = useState(tomorrow.toDate());
  const tomorrowDuration = moment(tomorrowSnoozeDate).diff(moment());
  const tomorrowDurationFormatted = moment(tomorrowDuration).format(
    `H[ ${t('hours')}] m[ ${t('minutes')}]`,
  );

  // Only unresolved incidents can be snoozed
  const {
    selectedRows,
  } = incidentTable;
  const unresolvedIncidents = filterIncidentsByField(selectedRows, 'status', [
    TRIGGERED,
    ACKNOWLEDGED,
  ]);
  const modalTitle = unresolvedIncidents.length === 1
    ? t('Snooze Incident #X', { unresolvedIncidents })
    : t('Snooze X incidents', { unresolvedIncidents });

  // Internal state to find active radio button
  const [activeButtonId, setActiveButton] = useState('snooze-hours');
  const duration = activeButtonId === 'snooze-hours'
    ? parseInt(snoozeDuration / 1000, 10)
    : parseInt(tomorrowDuration / 1000, 10);
  const modalAction = `${modalTitle} for ${
    activeButtonId === 'snooze-hours' ? snoozeDurationFormatted : tomorrowDurationFormatted
  }`;

  return (
    <div className="custom-snooze-modal-ctr">
      <Modal show={displayCustomSnoozeModal} onHide={toggleDisplayCustomSnoozeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row xs={3}>
              <Col>
                <Form.Check
                  type="radio"
                  label={t('Snooze for the following hours')}
                  name="snooze-group"
                  id="snooze-hours"
                  onChange={(e) => setActiveButton(e.target.id)}
                  defaultChecked
                />
              </Col>
              <Col>
                <Form.Control
                  id="snooze-hours-input"
                  type="number"
                  min={1}
                  max={24}
                  defaultValue={defaultSnoozeTimeHours}
                  onChange={(e) => setSnoozeTime(moment().add(e.target.value, 'hours'))}
                />
              </Col>
            </Row>
            <br />
            <Row xs={3}>
              <Col>
                <Form.Check
                  type="radio"
                  label={t('Snooze until tomorrow at')}
                  name="snooze-group"
                  id="snooze-tomorrow"
                  onChange={(e) => setActiveButton(e.target.id)}
                />
              </Col>
              <Col>
                <DatePicker
                  id="snooze-tomorrow-datepicker"
                  selected={tomorrowSnoozeDate}
                  onChange={(date) => setTomorrowSnoozeDate(date)}
                  minTime={moment().set({ hours: 0, minutes: 0 }).toDate()}
                  maxTime={moment().set({ hours: 12, minutes: 0 }).toDate()}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={60}
                  timeCaption="Time"
                  dateFormat="HH:mm aa"
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="snooze-custom-button"
            variant="primary"
            onClick={() => {
              snooze(selectedRows, duration);
              toggleDisplayCustomSnoozeModal();
            }}
          >
            {modalAction}
          </Button>
          <Button variant="light" onClick={toggleDisplayCustomSnoozeModal}>
            {t('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  incidentActions: state.incidentActions,
  incidentTable: state.incidentTable,
});

const mapDispatchToProps = (dispatch) => ({
  toggleDisplayCustomSnoozeModal: () => dispatch(toggleDisplayCustomSnoozeModalConnected()),
  snooze: (incidents, duration) => dispatch(snoozeConnected(incidents, duration)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomSnoozeModalComponent);
