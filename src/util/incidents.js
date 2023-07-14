import i18next from 'i18next';

/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
export const TRIGGERED = 'triggered';
export const ESCALATED = 'escalated';
export const ACKNOWLEDGED = 'acknowledged';
export const RESOLVED = 'resolved';
export const SNOOZED = 'snoozed';

export const HIGH = 'high';
export const LOW = 'low';

export const UPDATE_INCIDENT_REDUCER_STATUS = 'UPDATE_INCIDENT_REDUCER_STATUS';
export const UPDATE_INCIDENT_LAST_FETCH_DATE = 'UPDATE_INCIDENT_LAST_FETCH_DATE';

export const INCIDENT_STATES = [TRIGGERED, ACKNOWLEDGED, RESOLVED];

// Helper function to filter incidents by json path + possible values
// eslint-disable-next-line max-len
export const filterIncidentsByField = (incidents, jsonPath, possibleValues) => incidents.filter((incident) => {
  const targetValue = Object.byString(incident, jsonPath);
  if (possibleValues.includes(targetValue)) return incident;
});

// Helper function to filter incidents by json path with multiple entries + possible values
// NB - this is used to flatten teams, assignments, and acknowledgment lists
export const filterIncidentsByFieldOfList = (
  incidents,
  jsonPathOuter,
  jsonPathInner,
  possibleValues,
) => incidents.filter((incident) => {
  const incidentInnerFieldObjects = Object.byString(incident, jsonPathOuter);
  // eslint-disable-next-line max-len
  const incidentInnerFieldsFlattened = incidentInnerFieldObjects.map((outerObject) => Object.byString(outerObject, jsonPathInner));
  if (possibleValues.some((value) => incidentInnerFieldsFlattened.includes(value))) return incident;
});

// Helper function to generate modal message based on action
export const generateIncidentActionModal = (incidents, action) => {
  // Split incidents based on status
  const unresolvedIncidents = filterIncidentsByField(incidents, 'status', [
    TRIGGERED,
    ACKNOWLEDGED,
  ]);
  const resolvedIncidents = filterIncidentsByField(incidents, 'status', [RESOLVED]);

  // Create message based on action and incident status
  let message;
  let i18nAction = '';
  if (action === ACKNOWLEDGED) {
    i18nAction = i18next.t('acknowledged');
  }
  if (action === RESOLVED) {
    i18nAction = i18next.t('resolved');
  }
  if (action === SNOOZED) {
    i18nAction = i18next.t('snoozed');
  }
  let primaryIncidentList = unresolvedIncidents.slice(0, 100).map((i) => i.incident_number).join(', ');
  if (unresolvedIncidents.length > 100) {
    primaryIncidentList += ` ${i18next.t('and')} ${unresolvedIncidents.length - 100} ${i18next.t('more')}`;
  }
  const primaryMessage = `${i18next.t('Incidents')} ${primaryIncidentList} ${i18next.t('have been')} ${i18nAction}.`;
  const secondaryMessage = `(${resolvedIncidents.length} ${i18next.t('Incidents')} ${i18next.t(
    'were not',
  )} ${action} 
  ${i18next.t('because they have already been suppressed or resolved')})`;

  if (unresolvedIncidents.length > 0 && resolvedIncidents.length === 0) {
    message = primaryMessage;
  } else if (unresolvedIncidents.length > 0 && resolvedIncidents.length > 0) {
    message = `${primaryMessage} ${secondaryMessage}`;
  }

  return {
    actionAlertsModalType: 'success',
    actionAlertsModalMessage: message,
  };
};

export const getSnoozeTimes = () => ({
  '5 mins': { i18n: `5 ${i18next.t('minutes')}`, seconds: 60 * 5 },
  '30 mins': { i18n: `30 ${i18next.t('minutes')}`, seconds: 60 * 30 },
  '1 hr': { i18n: `1 ${i18next.t('hour')}`, seconds: 60 * 60 },
  '4 hrs': { i18n: `4 ${i18next.t('hours')}`, seconds: 60 * 60 * 4 },
  '24 hrs': { i18n: `24 ${i18next.t('hours')}`, seconds: 60 * 60 * 24 },
});
