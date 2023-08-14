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
} from 'redux/users/actions';

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
