import React, {
  useEffect,
} from 'react';

import {
  connect, useSelector, useDispatch,
} from 'react-redux';

import {
  useToast,
} from '@chakra-ui/react';

import {
  toggleDisplayActionAlertsModal as toggleDisplayActionAlertsModalConnected,
} from 'redux/action_alerts/actions';

const ActionAlertsModalComponent = () => {
  const {
    displayActionAlertsModal, actionAlertsModalType, actionAlertsModalMessage,
  } = useSelector(
    (state) => state.actionAlertsModalData,
  );
  const dispatch = useDispatch();
  const toggleDisplayActionAlertsModal = () => dispatch(toggleDisplayActionAlertsModalConnected());

  const toast = useToast();

  const status = actionAlertsModalType === 'success' ? 'success' : 'error';

  useEffect(() => {
    let timeout;
    if (displayActionAlertsModal && !toast.isActive(actionAlertsModalMessage)) {
      toast({
        id: actionAlertsModalMessage,
        title: actionAlertsModalMessage,
        status,
      });
      timeout = setTimeout(() => {
        toggleDisplayActionAlertsModal();
      }, 100);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [displayActionAlertsModal, toggleDisplayActionAlertsModal]);

  return <></>;
};

const mapStateToProps = (state) => ({
  actionAlertsModalData: state.actionAlertsModalData,
});

const mapDispatchToProps = (dispatch) => ({
  toggleDisplayActionAlertsModal: () => dispatch(toggleDisplayActionAlertsModalConnected()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionAlertsModalComponent);
