import React, {
  useEffect, useState,
} from 'react';
import {
  connect,
} from 'react-redux';

import {
  Modal,
} from 'react-bootstrap';

import {
  useTranslation,
} from 'react-i18next';

import {
  userAcceptDisclaimer as userAcceptDisclaimerConnected,
} from 'src/redux/users/actions';

// Ref: https://stackoverflow.com/a/61390352/6480733
const Delayed = ({
  children, waitBeforeShow = 500,
}) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};

const UnauthorizedModalComponent = ({
  users, userAcceptDisclaimer,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    userAuthorized,
  } = users;

  return (
    <div className="user-unauthorized-modal-ctr">
      <Delayed waitBeforeShow={500}>
        <Modal
          dialogClassName="modal-60w"
          show={!userAuthorized}
          onHide={() => {
            userAcceptDisclaimer();
            sessionStorage.removeItem('pd_access_token');
            window.location.reload();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>{t('Unauthorized Access')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              {t('User is not permitted to access this instance of PagerDuty Live')}
              {'. '}
              {t('Please contact the associated site owner for access')}
              .
            </p>
          </Modal.Body>
        </Modal>
      </Delayed>
    </div>
  );
};

const mapStateToProps = (state) => ({
  users: state.users,
});

const mapDispatchToProps = (dispatch) => ({
  userAcceptDisclaimer: () => dispatch(userAcceptDisclaimerConnected()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UnauthorizedModalComponent);
