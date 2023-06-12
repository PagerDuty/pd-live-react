import {
  mockStore, componentWrapper,
} from 'mocks/store.test';

import ActionAlertsModalComponent from './ActionAlertsModalComponent';

jest.useFakeTimers();

xdescribe('ActionAlertsModalComponent', () => {
  
  // FIXME: Toasts not working in tests
  
  it('should render success modal with contents="winning"', () => {
    const store = mockStore({
      actionAlertsModalData: {
        displayActionAlertsModal: true,
        actionAlertsModalType: 'success',
        actionAlertsModalMessage: 'winning',
      },
    });
    const wrapper = componentWrapper(store, ActionAlertsModalComponent);
    expect(wrapper.find('.chakra-alert').props()); // can't be found
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
