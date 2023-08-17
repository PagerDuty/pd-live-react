import React, {
  useRef,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  useToast,
  useColorMode,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleLoadSavePresetsModal as toggleLoadSavePresetsModalConnected,
  setDefaultSinceDateTenor as setDefaultSinceDateTenorConnected,
  setMaxRateLimit as setMaxRateLimitConnected,
  setSearchAllCustomDetails as setSearchAllCustomDetailsConnected,
  setFuzzySearch as setFuzzySearchConnected,
  setRespondersInEpFilter as setRespondersInEpFilterConnected,
  setAlertCustomDetailColumns as setAlertCustomDetailColumnsConnected,
  setDarkMode as setDarkModeConnected,
  setRelativeDates as setRelativeDatesConnected,
} from 'src/redux/settings/actions';

import {
  toggleDisplayQuerySettings as toggleDisplayQuerySettingsConnected,
  updateQuerySettingsIncidentStatus as updateQuerySettingsIncidentStatusConnected,
  updateQuerySettingsIncidentUrgency as updateQuerySettingsIncidentUrgencyConnected,
  updateQuerySettingsIncidentPriority as updateQuerySettingsIncidentPriorityConnected,
  updateQuerySettingsTeams as updateQuerySettingsTeamsConnected,
  updateQuerySettingsEscalationPolicies as updateQuerySettingsEscalationPoliciesConnected,
  updateQuerySettingsServices as updateQuerySettingsServicesConnected,
  updateQuerySettingsUsers as updateQuerySettingsUsersConnected,
} from 'src/redux/query_settings/actions';

import {
  updateIncidentTableColumns as updateIncidentTableColumnsConnected,
} from 'src/redux/incident_table/actions';

import {
  updateUserLocale as updateUserLocaleConnected,
} from 'src/redux/users/actions';

const SettingsModalComponent = () => {
  const {
    t,
  } = useTranslation();

  const {
    displayLoadSavePresetsModal,
    defaultSinceDateTenor,
    maxRateLimit,
    searchAllCustomDetails,
    fuzzySearch,
    respondersInEpFilter,
    alertCustomDetailFields,
    darkMode,
    relativeDates,
  } = useSelector((state) => state.settings);

  const {
    displayQuerySettings,
    sinceDate,
    incidentStatus,
    incidentUrgency,
    incidentPriority,
    teamIds,
    escalationPolicyIds,
    serviceIds,
    userIds,
  } = useSelector((state) => state.querySettings);

  const {
    subdomain, currentUserLocale,
  } = useSelector((state) => state.users);

  const {
    incidentTableColumns,
  } = useSelector((state) => state.incidentTable);

  const dispatch = useDispatch();
  const toggleLoadSavePresetsModal = () => dispatch(toggleLoadSavePresetsModalConnected());

  const updateUserLocale = (locale) => dispatch(updateUserLocaleConnected(locale));
  const setDefaultSinceDateTenor = (tenor) => dispatch(setDefaultSinceDateTenorConnected(tenor));
  const setMaxRateLimit = (limit) => dispatch(setMaxRateLimitConnected(limit));
  const setSearchAllCustomDetails = (search) => dispatch(setSearchAllCustomDetailsConnected(search));
  const setFuzzySearch = (search) => dispatch(setFuzzySearchConnected(search));
  const setRespondersInEpFilter = (show) => dispatch(setRespondersInEpFilterConnected(show));
  const setAlertCustomDetailColumns = (columns) => dispatch(setAlertCustomDetailColumnsConnected(columns));
  const setDarkMode = (mode) => dispatch(setDarkModeConnected(mode));
  const setRelativeDates = (relative) => dispatch(setRelativeDatesConnected(relative));
  const toggleDisplayQuerySettings = () => dispatch(toggleDisplayQuerySettingsConnected());
  const updateQuerySettingsIncidentStatus = (status) => dispatch(updateQuerySettingsIncidentStatusConnected(status));
  const updateQuerySettingsIncidentUrgency = (u) => dispatch(updateQuerySettingsIncidentUrgencyConnected(u));
  const updateQuerySettingsIncidentPriority = (p) => dispatch(updateQuerySettingsIncidentPriorityConnected(p));
  const updateQuerySettingsTeams = (teams) => dispatch(updateQuerySettingsTeamsConnected(teams));
  const updateQuerySettingsEscalationPolicies = (eps) => dispatch(updateQuerySettingsEscalationPoliciesConnected(eps));
  const updateQuerySettingsServices = (services) => dispatch(updateQuerySettingsServicesConnected(services));
  const updateQuerySettingsUsers = (users) => dispatch(updateQuerySettingsUsersConnected(users));
  const updateIncidentTableColumns = (columns) => dispatch(updateIncidentTableColumnsConnected(columns));

  const toast = useToast();
  const {
    setColorMode,
  } = useColorMode();

  const savePresets = () => {
    const settings = {
      defaultSinceDateTenor,
      maxRateLimit,
      searchAllCustomDetails,
      fuzzySearch: !!fuzzySearch,
      respondersInEpFilter,
      alertCustomDetailFields,
      darkMode,
      relativeDates,
    };
    const querySettings = {
      displayQuerySettings,
      sinceDate,
      incidentStatus,
      incidentUrgency,
      incidentPriority,
      teamIds,
      escalationPolicyIds,
      serviceIds,
      userIds,
    };
    const presets = {
      subdomain,
      currentUserLocale,
      settings,
      querySettings,
      incidentTableColumns,
    };

    // Download JSON file
    const blob = new Blob([JSON.stringify(presets, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'presets.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadPresets = (presets) => {
    updateUserLocale(presets.currentUserLocale);

    setDefaultSinceDateTenor(presets.settings.defaultSinceDateTenor);
    setMaxRateLimit(presets.settings.maxRateLimit);
    setSearchAllCustomDetails(presets.settings.searchAllCustomDetails);
    setFuzzySearch(!!presets.settings.fuzzySearch);
    setRespondersInEpFilter(presets.settings.respondersInEpFilter);
    setAlertCustomDetailColumns(presets.settings.alertCustomDetailFields);
    setDarkMode(presets.settings.darkMode);
    setColorMode(presets.settings.darkMode ? 'dark' : 'light');
    setRelativeDates(presets.settings.relativeDates);

    if (presets.querySettings.displayQuerySettings !== displayQuerySettings) {
      toggleDisplayQuerySettings();
    }
    updateQuerySettingsIncidentStatus(presets.querySettings.incidentStatus);
    updateQuerySettingsIncidentUrgency(presets.querySettings.incidentUrgency);
    updateQuerySettingsIncidentPriority(presets.querySettings.incidentPriority);
    updateQuerySettingsTeams(presets.querySettings.teamIds);
    updateQuerySettingsEscalationPolicies(presets.querySettings.escalationPolicyIds);
    updateQuerySettingsServices(presets.querySettings.serviceIds);
    updateQuerySettingsUsers(presets.querySettings.userIds);

    updateIncidentTableColumns(presets.incidentTableColumns);
  };

  const inputFile = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt) => {
      try {
        const presets = JSON.parse(evt.target.result);
        if (
          ![
            'subdomain',
            'currentUserLocale',
            'settings',
            'querySettings',
            'incidentTableColumns',
          ].every((key) => presets[key] !== undefined)
        ) {
          toast({
            title: t('Error'),
            description: t('Invalid presets file'),
            status: 'error',
          });
          return;
        }

        if (presets.subdomain !== subdomain) {
          toast({
            title: t('Error'),
            description: t('Presets file is for a different subdomain'),
            status: 'error',
          });
          return;
        }

        toggleLoadSavePresetsModal();
        loadPresets(presets);
        toast({
          title: t('Presets loaded'),
          description: t('Live Incidents Console will reload to apply the new presets'),
          status: 'success',
        });
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } catch (err) {
        toast({
          title: t('Error'),
          description: t('Invalid presets file'),
          status: 'error',
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: t('Error'),
        description: t('Invalid presets file'),
        status: 'error',
      });
    };
  };

  return (
    <Modal isOpen={displayLoadSavePresetsModal} onClose={toggleLoadSavePresetsModal} size="xl">
      <input
        id="load-presets-file"
        style={{ display: 'none' }}
        accept=".json,application/json"
        ref={inputFile}
        onChange={handleFileUpload}
        type="file"
      />
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Load/Save Presets')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4} textAlign="center">
            <FormControl>
              <Button
                size="lg"
                id="save-presets-button"
                colorScheme="blue"
                mr={3}
                onClick={savePresets}
              >
                {t('Save Presets to File')}
              </Button>
            </FormControl>
            <FormControl>
              <Button
                size="lg"
                id="load-presets-button"
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  inputFile.current.click();
                }}
              >
                {t('Load Presets from File')}
              </Button>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            id="close-button"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              toggleLoadSavePresetsModal();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModalComponent;
