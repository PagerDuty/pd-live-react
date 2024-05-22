import React, {
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  useDispatch,
} from 'react-redux';

import {
  Button,
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import {
  userUnauthorize as userUnauthorizeConnected,
} from 'src/redux/users/actions';

import {
  stopMonitoring as stopMonitoringConnected,
} from 'src/redux/monitoring/actions';

const CatastropheOverlay = ({
  errorMessage,
  countdownSeconds = 30,
}) => {
  const {
    t,
  } = useTranslation();

  const dispatch = useDispatch();
  const userUnauthorize = () => dispatch(userUnauthorizeConnected());
  const stopMonitoring = () => dispatch(stopMonitoringConnected());

  const [seconds, setSeconds] = useState(countdownSeconds);
  const timerIdRef = useRef(null);

  useEffect(() => {
    if (seconds > 0) {
      timerIdRef.current = setTimeout(() => {
        setSeconds(seconds - 1);
      }, 1000);
    } else {
      window.location.reload(true);
    }
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [seconds]);

  const cancelTimer = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  return (
    <Modal isOpen isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Catastrophic Error')}</ModalHeader>
        <ModalBody>
          <Text mb={4}>{t('An unexpected error has occurred:')}</Text>
          <Code mb={4}>{errorMessage}</Code>
          <Text>
            {
              timerIdRef.current
                ? t('The application will restart in X seconds.', { seconds })
                : t('Restart canceled')
            }
          </Text>
          <Button
            onClick={() => {
              userUnauthorize();
              stopMonitoring();
              sessionStorage.removeItem('pd_access_token');
              window.location.reload(true);
            }}
            colorScheme="red"
            my={4}
            mx="auto"
          >
            {t('Reauthorize')}
          </Button>
          <Button
            onClick={() => {
              cancelTimer();
            }}
            my={4}
            mx="auto"
          >
            {t('Don\'t Restart')}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CatastropheOverlay;
