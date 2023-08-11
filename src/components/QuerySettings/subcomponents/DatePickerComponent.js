import React, {
  useState, useEffect, useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import moment from 'moment';

import DatePicker from 'react-datepicker';

import {
  DEBUG_SINCE_DATE,
  DEBUG_UNTIL_DATE,
} from 'config/constants';

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
  const defaultSinceDateTenor = useSelector((state) => state.settings.defaultSinceDateTenor);
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

  // Generate since date based on configured default and dispatch action for query.
  const today = moment();
  const [sinceDateNum, sinceDateTenor] = defaultSinceDateTenor
    ? defaultSinceDateTenor.split(' ')
    : ['1', 'Day'];
  const sinceDateCalc = DEBUG_SINCE_DATE
    ? new Date(DEBUG_SINCE_DATE)
    : today.subtract(Number(sinceDateNum), sinceDateTenor)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
  const [sinceDate, setSinceDate] = useState(sinceDateCalc);

  // Generate until date
  const untilDateCalc = DEBUG_UNTIL_DATE
    ? new Date(DEBUG_UNTIL_DATE)
    : untilDateFromStore;
  const [untilDate, setUntilDate] = useState(untilDateCalc);

  useEffect(() => {
    updateQuerySettingsSinceDate(sinceDate);
    if (untilDate) {
      updateQuerySettingsUntilDate(untilDate);
    }
  }, [sinceDate, untilDate]);

  // const [sinceDate, setSinceDate] = useState(sinceDateFromStore);
  // const [untilDate, setUntilDate] = useState(untilDateFromStore);

  const sixMonthsBeforeNow = moment().subtract(180, 'days').toDate();

  const validateSinceTime = (date) => {
    const now = new Date();
    if (date > now) {
      return false;
    }
    if (untilDate) {
      if (date >= untilDate) {
        return false;
      }
      // if since is more than 6 months before until, don't allow
      const sixMonthsBeforeUntil = moment(untilDate).subtract(180, 'days').toDate();
      if (date < sixMonthsBeforeUntil) {
        return false;
      }
    }
    // if since is more than 6 months before now, don't allow
    if (date < sixMonthsBeforeNow) {
      return false;
    }
    return true;
  };

  const maxUntilDate = useMemo(() => {
    const maxDuration = moment(sinceDate).add(180, 'days').toDate();
    return maxDuration < new Date() ? maxDuration : new Date();
  }, [sinceDate]);

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
    if (date > maxUntilDate) {
      return false;
    }
    return true;
  };

  const isValid = useMemo(() => {
    if (validateSinceTime(sinceDate) && validateUntilTime(untilDate)) {
      return true;
    }
    return false;
  }, [sinceDate, untilDate]);

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
        {`${moment(sinceDate).format('L')} ${moment(sinceDate).format('LT')}`}
        {}
        {' - '}
        {
          untilDate
            ? `${moment(untilDate).format('L')} ${moment(untilDate).format('LT')}`
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
                  minDate={sixMonthsBeforeNow}
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
                  maxDate={maxUntilDate}
                  filterTime={validateUntilTime}
                  onChange={(date) => setUntilDate(date)}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              id="query-date-submit"
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isDisabled={!isValid}
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
