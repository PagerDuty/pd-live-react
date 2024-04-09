import React, {
  useEffect,
  useState,
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
  countdownSeconds = 10,
}) => {
  const {
    t,
  } = useTranslation();

  const dispatch = useDispatch();
  const userUnauthorize = () => dispatch(userUnauthorizeConnected());
  const stopMonitoring = () => dispatch(stopMonitoringConnected());

  const [seconds, setSeconds] = useState(countdownSeconds);

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timerId);
    }
    window.location.reload(true);
    return undefined;
  }, [seconds]);

  return (
    <Modal isOpen isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Catastrophic Error')}</ModalHeader>
        <ModalBody>
          <Text mb={4}>{t('An unexpected error has occurred:')}</Text>
          <Code mb={4}>{errorMessage}</Code>
          <Text>
            {t('The application will restart in X seconds.', { seconds })}
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CatastropheOverlay;
