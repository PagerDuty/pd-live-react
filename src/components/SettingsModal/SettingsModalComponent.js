import React, {
  useState,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Box,
  Button,
  InputGroup,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spacer,
  Stack,
  Switch,
  Text,
  useToast,
  // useColorMode,
} from '@chakra-ui/react';

import {
  MAX_RATE_LIMIT_LOWER, MAX_RATE_LIMIT_UPPER,
} from 'config/constants';

import {
  defaultSinceDateTenors,
} from 'util/settings';

import {
  useTranslation,
} from 'react-i18next';

import {
  locales,
} from 'i18n.js';

import {
  updateUserLocale as updateUserLocaleConnected,
} from 'redux/users/actions';
import {
  toggleSettingsModal as toggleSettingsModalConnected,
  setDefaultSinceDateTenor as setDefaultSinceDateTenorConnected,
  setMaxRateLimit as setMaxRateLimitConnected,
  setSearchAllCustomDetails as setSearchAllCustomDetailsConnected,
  setRespondersInEpFilter as setRespondersInEpFilterConnected,
  setRelativeDates as setRelativeDatesConnected,
} from 'redux/settings/actions';

const SettingsModalComponent = () => {
  const {
    t,
  } = useTranslation();

  const toast = useToast();

  const {
    displaySettingsModal,
    defaultSinceDateTenor,
    maxRateLimit,
    searchAllCustomDetails,
    respondersInEpFilter,
    relativeDates,
  } = useSelector((state) => state.settings);
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);

  const dispatch = useDispatch();
  const toggleSettingsModal = () => dispatch(toggleSettingsModalConnected());
  const updateUserLocale = (locale) => dispatch(updateUserLocaleConnected(locale));
  const setDefaultSinceDateTenor = (newDefaultSinceDateTenor) => {
    dispatch(setDefaultSinceDateTenorConnected(newDefaultSinceDateTenor));
  };
  const setMaxRateLimit = (newMaxRateLimit) => {
    dispatch(setMaxRateLimitConnected(newMaxRateLimit));
  };
  const setSearchAllCustomDetails = (newSearchAllCustomDetails) => {
    dispatch(setSearchAllCustomDetailsConnected(newSearchAllCustomDetails));
  };
  const setRespondersInEpFilter = (newRespondersInEpFilter) => {
    dispatch(setRespondersInEpFilterConnected(newRespondersInEpFilter));
  };
  const setRelativeDates = (newRelativeDates) => {
    dispatch(setRelativeDatesConnected(newRelativeDates));
  };

  const localeOptions = Object.keys(locales).map((locale) => ({
    label: locales[locale],
    value: locale,
  }));
  const [selectedLocale, setSelectedLocale] = useState(currentUserLocale);
  const [tempSinceDateTenor, setTempSinceDateTenor] = useState(defaultSinceDateTenor);

  const [tempMaxRateLimit, setTempMaxRateLimit] = useState(maxRateLimit);

  const [tempSearchAllCustomDetails, setTempSearchAllCustomDetails] = useState(searchAllCustomDetails);
  const [tempRespondersInEpFilter, setTempRespondersInEpFilter] = useState(respondersInEpFilter);
  const [tempRelativeDates, setTempRelativeDates] = useState(relativeDates);

  const saveSettings = () => {
    if (selectedLocale !== currentUserLocale) {
      updateUserLocale(selectedLocale);
    }
    if (tempSinceDateTenor !== defaultSinceDateTenor) {
      setDefaultSinceDateTenor(tempSinceDateTenor);
    }
    if (tempMaxRateLimit !== maxRateLimit) {
      setMaxRateLimit(tempMaxRateLimit);
    }
    if (tempSearchAllCustomDetails !== searchAllCustomDetails) {
      setSearchAllCustomDetails(tempSearchAllCustomDetails);
    }
    if (tempRespondersInEpFilter !== respondersInEpFilter) {
      setRespondersInEpFilter(tempRespondersInEpFilter);
    }
    if (tempRelativeDates !== relativeDates) {
      setRelativeDates(tempRelativeDates);
    }
  };

  return (
    <Modal isOpen={displaySettingsModal} onClose={toggleSettingsModal} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Settings')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel htmlFor="user-locale-select">{t('Locale')}</FormLabel>
              <Select
                id="user-locale-select"
                value={selectedLocale}
                onChange={(e) => {
                  setSelectedLocale(e.target.value);
                }}
              >
                {localeOptions.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="since-date-tenor-select">
                {t('Default Since Date Lookback')}
              </FormLabel>
              <Select
                id="since-date-tenor-select"
                value={tempSinceDateTenor}
                onChange={(e) => {
                  setTempSinceDateTenor(e.currentTarget.value);
                }}
              >
                {defaultSinceDateTenors.map((tenor) => (
                  <option key={tenor} value={tenor}>
                    {t(tenor)}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="max-rate-limit-slider">{t('Max API Call Rate')}</FormLabel>
              <Box borderWidth="1px" borderRadius="lg">
                <InputGroup>
                  <Slider
                    m="20px"
                    w="80%"
                    id="max-rate-limit-slider"
                    aria-label="Max Rate Limit"
                    min={MAX_RATE_LIMIT_LOWER}
                    max={MAX_RATE_LIMIT_UPPER}
                    step={100}
                    defaultValue={tempMaxRateLimit}
                    onChange={(value) => {
                      setTempMaxRateLimit(value);
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Spacer />
                  <Text m="auto" w="10%" verticalAlign="middle">
                    {tempMaxRateLimit}
                  </Text>
                </InputGroup>
              </Box>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="search-all-custom-details-switch">{t('Global Search')}</FormLabel>
              <Switch
                id="search-all-custom-details-switch"
                isChecked={tempSearchAllCustomDetails}
                aria-label={t('Search all alert custom details in global search')}
                onChange={(e) => {
                  setTempSearchAllCustomDetails(e.target.checked);
                }}
              >
                {t('Search all alert custom details in global search')}
              </Switch>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="responders-in-ep-filter-switch">{t('Filters')}</FormLabel>
              <Switch
                id="responders-in-ep-filter-switch"
                isChecked={tempRespondersInEpFilter}
                aria-label={t('Escalation Policy filter searches responders as well as assignees')}
                onChange={(e) => {
                  setTempRespondersInEpFilter(e.target.checked);
                }}
              >
                {t('Escalation Policy filter searches responders as well as assignees')}
              </Switch>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="relative-dates-switch">{t('Relative Dates')}</FormLabel>
              <Switch
                id="relative-dates-switch"
                isChecked={tempRelativeDates}
                aria-label={t('Date columns are shown relative to the current time')}
                onChange={(e) => {
                  setTempRelativeDates(e.target.checked);
                }}
              >
                {t('Date columns are shown relative to the current time')}
              </Switch>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            id="save-settings-button"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              saveSettings();
              toggleSettingsModal();
              toast({
                title: t('Updated user profile settings'),
                status: 'success',
              });
            }}
          >
            OK
          </Button>
          <Button variant="ghost" onClick={toggleSettingsModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModalComponent;
