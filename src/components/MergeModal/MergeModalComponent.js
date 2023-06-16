/* eslint-disable no-unused-vars */

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayMergeModal as toggleDisplayMergeModalConnected,
  merge as mergeConnected,
} from 'redux/incident_actions/actions';

import {
  TRIGGERED,
  ACKNOWLEDGED,
  RESOLVED,
  filterIncidentsByField,
} from 'util/incidents';

import './MergeModalComponent.scss';

// const animatedComponents = makeAnimated();

const MergeModalComponent = () => {
  const incidents = useSelector((state) => state.incidents.incidents);
  const {
    displayMergeModal,
  } = useSelector((state) => state.incidentActions);
  const {
    selectedRows,
  } = useSelector((state) => state.incidentTable);
  const dispatch = useDispatch();
  const toggleDisplayMergeModal = () => dispatch(toggleDisplayMergeModalConnected());
  const merge = (targetIncident, mergedIncidents, displayModal, addToTitleText) => dispatch(
    mergeConnected(targetIncident, mergedIncidents, displayModal, addToTitleText),
  );

  const {
    t,
  } = useTranslation();

  const selectedIncidents = useMemo(() => {
    if (selectedRows instanceof Array) {
      return [...selectedRows]
        .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
        .map((incident) => ({
          label: incident.summary,
          value: incident.id,
          id: incident.id,
          title: incident.title,
          incident_number: incident.incident_number,
          status: incident.status,
        }));
    }
    // eslint-disable-next-line no-console
    console.log('selectedRows is not an array', selectedRows);
    return [];
  }, [displayMergeModal, selectedRows]);

  const unselectedIncidents = useMemo(() => {
    const selectedIncidentIds = selectedRows.map((incident) => incident.id);
    const r = incidents
      ? [...incidents]
        .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
        .filter((incident) => !selectedIncidentIds.includes(incident.id))
      : [];
    return r;
  }, [displayMergeModal, incidents, selectedRows]);

  const unselectedOpenIncidents = useMemo(() => (
    filterIncidentsByField(unselectedIncidents, 'status', [TRIGGERED, ACKNOWLEDGED])
      .map((incident) => ({
        label: incident.summary,
        value: incident.id,
        id: incident.id,
        title: incident.title,
        incident_number: incident.incident_number,
        status: incident.status,
      }))
  ), [unselectedIncidents]);

  const unselectedClosedIncidents = useMemo(() => (
    filterIncidentsByField(unselectedIncidents, 'status', [RESOLVED])
      .map((incident) => ({
        label: incident.summary,
        value: incident.id,
        id: incident.id,
        title: incident.title,
        incident_number: incident.incident_number,
        status: incident.status,
      }))
  ), [unselectedIncidents]);

  const selectOptions = useMemo(() => {
    const r = [
      {
        label: t('Open Incidents'),
        options: unselectedOpenIncidents,
      },
      {
        label: t('Closed Incidents'),
        options: unselectedClosedIncidents,
      },
    ];
    if (selectedIncidents.length > 1) {
      r.unshift({
        label: t('Selected Incidents'),
        options: selectedIncidents,
      });
    }
    return r;
  }, [selectedIncidents, unselectedClosedIncidents, unselectedOpenIncidents]);

  const defaultMergeTarget = useMemo(() => (
    selectedIncidents.length > 1 ? selectedIncidents[0] : null
  ), [selectedIncidents]);

  const [mergeTarget, setMergeTarget] = useState(null);

  // you're not allowed to merge open incidents into a resolved incident
  const mergingIsDisallowed = useMemo(() => (
    !!mergeTarget
    && mergeTarget.status === RESOLVED
    && selectedIncidents.length > 1
    && selectedIncidents.some((incident) => incident.status !== RESOLVED)
  ), [mergeTarget, selectedIncidents]);

  useEffect(() => {
    setMergeTarget(defaultMergeTarget);
  }, [displayMergeModal]);

  const [addToTitle, setAddToTitle] = useState(false);
  const [addToTitleText, setAddToTitleText] = useState('');

  useEffect(() => {
    if (mergeTarget) {
      setAddToTitleText(`[merged into incident #${mergeTarget.incident_number}]`);
    } else {
      setAddToTitleText('');
    }
  }, [mergeTarget]);

  const doMerge = () => {
    const incidentsToMerge = selectedIncidents
      .filter((incident) => incident.id !== mergeTarget.id);
    merge(mergeTarget, incidentsToMerge, true, addToTitle ? addToTitleText : null);
  };

  return (
    <Modal
      isOpen={displayMergeModal}
      onClose={toggleDisplayMergeModal}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Merge Incidents')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <Text
              fontSize="sm"
            >
              {t('The alerts of the selected incidents will be merged into a single incident')}
            </Text>
            <FormLabel>{t('Select an incident to merge into')}</FormLabel>
            <Select
              id="merge-select"
              size="md"
              isSearchable
              options={selectOptions}
              value={mergeTarget}
              onChange={(value) => setMergeTarget(value)}
              isInvalid={mergingIsDisallowed}
              placeholder={`${t('Select dotdotdot')}`}
              chakraStyles={{
                // Ensure that dropdowns appear over table header
                menu: (provided) => ({
                  ...provided,
                  zIndex: 2,
                  width: 'auto',
                }),
              }}
            />
            <Text
              fontSize="sm"
              mt={6}
            >
              {t('The remaining selected incidents will be resolved after the merge is complete')}
            </Text>
          </FormControl>
          <FormControl>
            <Checkbox
              size="sm"
              isChecked={addToTitle}
              onChange={(e) => setAddToTitle(e.target.checked)}
            >
              {t('Add text to merged incident titles')}
            </Checkbox>
            {addToTitle && (
              <Input
                placeholder={t('Text to add')}
                value={addToTitleText}
                onChange={(e) => setAddToTitleText(e.target.value)}
              />
            )}
          </FormControl>
          {mergingIsDisallowed && (
            <Box>
              <Text
                color="red.500"
                fontWeight={500}
                fontSize="sm"
              >
                {t('You cannot merge open incidents into a resolved incident')}
              </Text>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Box>
            <Button
              id="merge-button"
              colorScheme="blue"
              mr={3}
              onClick={doMerge}
              isDisabled={!mergeTarget || mergingIsDisallowed}
            >
              {t('Merge')}
            </Button>
            <Button
              variant="ghost"
              onClick={toggleDisplayMergeModal}
            >
              {t('Cancel')}
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MergeModalComponent;
