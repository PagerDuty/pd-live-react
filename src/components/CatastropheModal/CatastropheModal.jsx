import React, {
  useEffect,
  useState,
} from 'react';

import {
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

const CatastropheOverlay = ({
  errorMessage,
  countdownSeconds = 10,
}) => {
  const {
    t,
  } = useTranslation();
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CatastropheOverlay;
