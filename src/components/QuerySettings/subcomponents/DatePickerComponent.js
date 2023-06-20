import React, {
  useState, useEffect,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import moment from 'moment';

import DatePicker from 'react-datepicker';

import {
  DEBUG_SINCE_DATE,
} from 'config/constants';

import {
  updateQuerySettingsSinceDate as updateQuerySettingsSinceDateConnected,
} from 'redux/query_settings/actions';

import './DatePickerComponent.scss';
import {
  Flex,
} from '@chakra-ui/react';

const DatePickerComponent = () => {
  const currentUserLocale = useSelector((state) => state.users.currentUserLocale);
  const defaultSinceDateTenor = useSelector((state) => state.settings.defaultSinceDateTenor);

  const dispatch = useDispatch();
  const updateQuerySettingsSinceDate = (sinceDate) => {
    dispatch(updateQuerySettingsSinceDateConnected(sinceDate));
  };

  // Generate since date based on configured default and dispatch action for query.
  const today = moment();
  const [sinceDateNum, sinceDateTenor] = defaultSinceDateTenor
    ? defaultSinceDateTenor.split(' ')
    : ['1', 'Day'];
  const sinceDateCalc = DEBUG_SINCE_DATE
    ? new Date(DEBUG_SINCE_DATE)
    : today.subtract(Number(sinceDateNum), sinceDateTenor).toDate();
  const [sinceDate, setSinceDate] = useState(sinceDateCalc);

  useEffect(() => {
    const flattedSinceDate = moment(sinceDate)
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toDate();
    updateQuerySettingsSinceDate(flattedSinceDate);
  }, [sinceDate]);

  return (
    <Flex borderWidth="1px" rounded="md" mb={2} p={0} justifyContent="center" alignItems="stretch">
      <DatePicker
        id="query-date-input"
        className="date-picker"
        dateFormat="P"
        locale={currentUserLocale}
        todayButton="Today"
        selected={sinceDate}
        minDate={today.subtract(6, 'Months').toDate()}
        maxDate={new Date()}
        onChange={(date) => {
          setSinceDate(date);
        }}
      />
    </Flex>
  );
};

export default DatePickerComponent;
