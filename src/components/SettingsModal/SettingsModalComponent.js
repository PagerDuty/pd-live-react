import React, {
  useState,
} from 'react';

import {
  useSelector,
  useDispatch,
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
  MAX_INCIDENTS_LIMIT_LOWER,
  MAX_INCIDENTS_LIMIT_UPPER,
  MAX_RATE_LIMIT_LOWER,
  MAX_RATE_LIMIT_UPPER,
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
  setMaxIncidentsLimit as setMaxIncidentsLimitConnected,
  setMaxRateLimit as setMaxRateLimitConnected,
  // setDarkMode as setDarkModeConnected,
  setServerSideFiltering as setServerSideFilteringConnected,
  setSearchAllCustomDetails as setSearchAllCustomDetailsConnected,
} from 'redux/settings/actions';

const SettingsModalComponent = () => {
  const {
    t,
  } = useTranslation();

  const toast = useToast();
  // const {
  //   colorMode,
  //   toggleColorMode,
  // } = useColorMode();

  const {
    displaySettingsModal,
    defaultSinceDateTenor,
    maxIncidentsLimit,
    maxRateLimit,
    // darkMode,
    serverSideFiltering,
    searchAllCustomDetails,
  } = useSelector((state) => state.settings);
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);

  const dispatch = useDispatch();
  const toggleSettingsModal = () => dispatch(toggleSettingsModalConnected());
  const updateUserLocale = (locale) => dispatch(updateUserLocaleConnected(locale));
  const setDefaultSinceDateTenor = (newDefaultSinceDateTenor) => {
    dispatch(setDefaultSinceDateTenorConnected(newDefaultSinceDateTenor));
  };
  const setMaxIncidentsLimit = (newMaxIncidentsLimit) => {
    dispatch(setMaxIncidentsLimitConnected(newMaxIncidentsLimit));
  };
  const setMaxRateLimit = (newMaxRateLimit) => {
    dispatch(setMaxRateLimitConnected(newMaxRateLimit));
  };
  const setServerSideFiltering = (newServerSideFiltering) => {
    dispatch(setServerSideFilteringConnected(newServerSideFiltering));
  };
  const setSearchAllCustomDetails = (newSearchAllCustomDetails) => {
    dispatch(setSearchAllCustomDetailsConnected(newSearchAllCustomDetails));
  };

  const localeOptions = Object.keys(locales).map((locale) => ({
    label: locales[locale],
    value: locale,
  }));
  const [selectedLocale, setSelectedLocale] = useState(currentUserLocale);
  const [tempSinceDateTenor, setTempSinceDateTenor] = useState(defaultSinceDateTenor);

  const [tempMaxIncidentsLimit, setTempMaxIncidentsLimit] = useState(maxIncidentsLimit);
  const [tempMaxRateLimit, setTempMaxRateLimit] = useState(maxRateLimit);

  const [tempServerSideFiltering, setTempServerSideFiltering] = useState(serverSideFiltering);
  const [
    tempSearchAllCustomDetails, setTempSearchAllCustomDetails,
  ] = useState(searchAllCustomDetails);

  const saveSettings = () => {
    if (selectedLocale !== currentUserLocale) {
      updateUserLocale(selectedLocale);
    }
    if (tempSinceDateTenor !== defaultSinceDateTenor) {
      setDefaultSinceDateTenor(tempSinceDateTenor);
    }
    if (tempMaxIncidentsLimit !== maxIncidentsLimit) {
      setMaxIncidentsLimit(tempMaxIncidentsLimit);
    }
    if (tempMaxRateLimit !== maxRateLimit) {
      setMaxRateLimit(tempMaxRateLimit);
    }
    if (tempServerSideFiltering !== serverSideFiltering) {
      setServerSideFiltering(tempServerSideFiltering);
    }
    if (tempSearchAllCustomDetails !== searchAllCustomDetails) {
      setSearchAllCustomDetails(tempSearchAllCustomDetails);
    }
  };

  return (
    <Modal
      isOpen={displaySettingsModal}
      onClose={toggleSettingsModal}
      size="xl"
    >
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
                  <option key={locale.value} value={locale.value}>{locale.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel
                htmlFor="since-date-tenor-select"
              >
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
                  <option key={tenor} value={tenor}>{t(tenor)}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="max-incidents-limit-slider">
                {t('Max Incidents Limit')}
              </FormLabel>
              <Box
                borderWidth="1px"
                borderRadius="lg"
              >
                <InputGroup>
                  <Slider
                    m="20px"
                    w="80%"
                    id="max-incidents-limit-slider"
                    aria-label="Max Incidents Limit"
                    min={MAX_INCIDENTS_LIMIT_LOWER}
                    max={MAX_INCIDENTS_LIMIT_UPPER}
                    step={100}
                    defaultValue={tempMaxIncidentsLimit}
                    onChange={(value) => {
                      setTempMaxIncidentsLimit(value);
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Spacer />
                  <Text m="auto" w="10%" verticalAlign="middle">{tempMaxIncidentsLimit}</Text>
                </InputGroup>
              </Box>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="max-rate-limit-slider">
                {t('Max API Call Rate')}
              </FormLabel>
              <Box
                borderWidth="1px"
                borderRadius="lg"
              >
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
                  <Text m="auto" w="10%" verticalAlign="middle">{tempMaxRateLimit}</Text>
                </InputGroup>
              </Box>
            </FormControl>
            <FormControl>
              <FormLabel
                htmlFor="server-side-filtering-switch"
              >
                {t('Server Side Filtering')}
              </FormLabel>
              <Switch
                id="server-side-filtering-switch"
                isChecked={tempServerSideFiltering}
                aria-label={t('Server Side Filtering')}
                onChange={(e) => {
                  setTempServerSideFiltering(e.target.checked);
                }}
              >
                {t('Server Side Filtering')}
              </Switch>
            </FormControl>
            <FormControl>
              <FormLabel
                htmlFor="search-all-custom-details-switch"
              >
                {t('Global search')}
              </FormLabel>
              <Switch
                id="search-all-custom-details-switch"
                isChecked={tempSearchAllCustomDetails}
                aria-label={t('Server Side Filtering')}
                onChange={(e) => {
                  setTempSearchAllCustomDetails(e.target.checked);
                }}
              >
                {t('Search all alert custom details in global search')}
              </Switch>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              saveSettings();
              toggleSettingsModal();
              toast({
                title: 'Settings saved',
                status: 'success',
              });
            }}
          >
            OK
          </Button>
          <Button variant="ghost" onClick={toggleSettingsModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModalComponent;
