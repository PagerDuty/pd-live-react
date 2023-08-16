import '@testing-library/jest-dom';

import gb from 'date-fns/locale/en-GB';
import moment from 'moment/min/moment-with-locales';

import {
  registerLocale,
} from 'react-datepicker';

import 'i18n.js';

import {
  componentWrapper, waitForComponentToPaint,
} from 'mocks/store.test';

// Required to validate how store is actually affected.
import {
  store,
} from 'src/redux/store';

import {
  VALIDATE_INCIDENT_QUERY_REQUESTED,
} from 'src/redux/query_settings/actions';

import QuerySettingsComponent from './QuerySettingsComponent';

// FIXME: Query settings tests need reworked
xdescribe('QuerySettingsComponent', () => {
  const defaultSinceDateTenor = '1 Day';
  const currentUserLocale = 'en-GB';
  registerLocale(currentUserLocale, gb);
  moment.locale(currentUserLocale);

  const sinceDateInput = (wrapper) => wrapper.find('#query-date-input').hostNodes();

  it('should render component', () => {
    // NB: Jest doesn't properly identify if react-bootstrap el is not visible, see workaround below
    const wrapper = componentWrapper(store, QuerySettingsComponent);
    expect(wrapper.find('#query-settings-accordion').at(0).getDOMNode().className).toEqual(
      'collapse show',
    );
  });

  it('should render correct since date based on defaultSinceDateTenor', () => {
    const [sinceDateNum, sinceDateTenor] = defaultSinceDateTenor.split(' ');
    const expectedDate = moment().subtract(Number(sinceDateNum), sinceDateTenor).format('L');
    const wrapper = componentWrapper(store, QuerySettingsComponent);
    expect(sinceDateInput(wrapper).hostNodes().prop('value')).toEqual(expectedDate);
  });

  it('should update state.querySettings.sinceDate on since date change', () => {
    const expectedDate = moment().subtract(1, 'Month');
    const wrapper = componentWrapper(store, QuerySettingsComponent);

    // Handle component rendering due to useEffect
    waitForComponentToPaint(wrapper);
    sinceDateInput(wrapper)
      .props()
      .onChange({ target: { value: expectedDate.format('L') } });
    sinceDateInput(wrapper).simulate('change');
    waitForComponentToPaint(wrapper);

    const {
      querySettings,
    } = store.getState();

    expect(sinceDateInput(wrapper).prop('value')).toEqual(expectedDate.format('L'));
    expect(moment(querySettings.sinceDate).format('L')).toEqual(expectedDate.format('L'));
    expect(querySettings.status).toEqual(VALIDATE_INCIDENT_QUERY_REQUESTED);
  });
});
