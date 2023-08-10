import React, {
  useState,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import moment from 'moment';

import DatePicker from 'react-datepicker';

import {
  useTranslation,
} from 'react-i18next';

import {
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

import {
  updateQuerySettingsSinceDate as updateQuerySettingsSinceDateConnected,
  updateQuerySettingsUntilDate as updateQuerySettingsUntilDateConnected,
} from 'redux/query_settings/actions';

import './DatePickerComponent.scss';

const DatePickerComponent = () => {
  const {
    t,
  } = useTranslation();
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);
  const {
    sinceDate: sinceDateFromStore,
    untilDate: untilDateFromStore,
  } = useSelector((state) => state.querySettings);

  const dispatch = useDispatch();
  const updateQuerySettingsSinceDate = (sinceDate) => {
    dispatch(updateQuerySettingsSinceDateConnected(sinceDate));
  };
  const updateQuerySettingsUntilDate = (untilDate) => {
    dispatch(updateQuerySettingsUntilDateConnected(untilDate));
  };

  const [sinceDate, setSinceDate] = useState(sinceDateFromStore);
  const [untilDate, setUntilDate] = useState(untilDateFromStore);

  const validateSinceTime = (date) => {
    const now = new Date();
    if (date > now) {
      return false;
    }
    if (untilDate && date >= untilDate) {
      return false;
    }
    return true;
  };

  const validateUntilTime = (date) => {
    if (!date) {
      return true;
    }
    const now = new Date();
    if (date > now) {
      return false;
    }
    if (date <= sinceDate) {
      return false;
    }
    return true;
  };

  const {
    isOpen, onOpen, onClose,
  } = useDisclosure();

  const handleSubmit = () => {
    if (sinceDate !== sinceDateFromStore) {
      updateQuerySettingsSinceDate(sinceDate);
    }
    if (untilDate !== untilDateFromStore) {
      updateQuerySettingsUntilDate(untilDate);
    }
    onClose();
  };

  return (
    <Flex borderWidth="1px" rounded="md" mb={2} p={0} justifyContent="center" alignItems="stretch">
      <Button size="sm" fontWeight={400} border="none" onClick={onOpen} id="query-date-input">
        {`${moment(sinceDateFromStore).format('L')} ${moment(sinceDateFromStore).format('LT')}`}
        {}
        {' - '}
        {
          untilDateFromStore
            ? `${moment(untilDateFromStore).format('L')} ${moment(untilDateFromStore).format('LT')}`
            : t('Now')
        }
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('Select Date Range')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              <FormControl
                mb={4}
              >
                <FormLabel>
                  {t('Since')}
                </FormLabel>
                <DatePicker
                  id="since-date-input"
                  className="date-picker"
                  dateFormat="Pp"
                  locale={currentUserLocale}
                  timeCaption={t('Time')}
                  todayButton={t('Today')}
                  selectsStart
                  showTimeSelect
                  selected={sinceDate}
                  startDate={sinceDate}
                  maxDate={untilDate || new Date()}
                  filterTime={validateSinceTime}
                  onChange={(date) => setSinceDate(date)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  {t('Until')}
                </FormLabel>
                <DatePicker
                  id="until-date-input"
                  className="date-picker"
                  dateFormat="Pp"
                  locale={currentUserLocale}
                  timeCaption={t('Time')}
                  todayButton={t('Today')}
                  isClearable
                  placeholderText={t('Now')}
                  selectsEnd
                  showTimeSelect
                  selected={untilDate}
                  startDate={sinceDate}
                  endDate={untilDate}
                  minDate={sinceDate}
                  maxDate={new Date()}
                  filterTime={validateUntilTime}
                  onChange={(date) => setUntilDate(date)}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
            >
              OK
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default DatePickerComponent;
