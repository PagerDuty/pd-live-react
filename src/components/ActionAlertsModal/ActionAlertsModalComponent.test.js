import {
  componentWrapper,
} from 'src/custom-testing-lib';

import {
  mockStore,
} from 'mocks/store.test';

import ActionAlertsModalComponent from './ActionAlertsModalComponent';

jest.useFakeTimers();

xdescribe('ActionAlertsModalComponent', () => {
  // FIXME: Toasts not working in tests -- it doesn't render to the DOM directly
  // but uses a hook to render to the DOM, so maybe should test in cypress instead
  it('should render success modal with contents="winning"', () => {
    const store = mockStore({
      actionAlertsModalData: {
        displayActionAlertsModal: true,
        actionAlertsModalType: 'success',
        actionAlertsModalMessage: 'winning',
      },
    });
    const wrapper = componentWrapper(store, ActionAlertsModalComponent);
    expect(wrapper.find('.chakra-alert__title').props()); // can't be found
  });

  // it('should render error modal with contents="failing"', () => {
  //   const store = mockStore({
  //     actionAlertsModalData: {
  //       displayActionAlertsModal: true,
  //       actionAlertsModalType: 'danger',
  //       actionAlertsModalMessage: 'failing',
  //     },
  //   });
  //   const wrapper = componentWrapper(store, ActionAlertsModalComponent);
  //   expect(wrapper.find('div.action-alerts-modal').hasClass('alert-danger')).toBeTruthy();
  //   expect(wrapper.contains('failing')).toBeTruthy();
  // });
});
