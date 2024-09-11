import React from 'react';

import {
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
} from '@chakra-ui/react';

import {
  useTranslation, Trans,
} from 'react-i18next';

const DeprecationAlertComponent = () => {
  const {
    isOpen: isVisible, onClose,
  } = useDisclosure({ defaultIsOpen: true });
  const {
    t,
  } = useTranslation();

  return isVisible ? (
    <Alert status="info">
      <AlertIcon />
      <Box w="100%">
        <AlertTitle>{t('PD Live is deprecated')}</AlertTitle>
        <AlertDescription>
          <Trans i18nKey="Deprecation">
            Deprecation Notice
            <a
              href="https://support.pagerduty.com/main/docs/operations-console"
              rel="external nofollow noopener noreferrer"
              className="external-link"
              target="_blank"
            >
              Operations Console
            </a>
          </Trans>
        </AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right={-1}
        top={-1}
        onClick={onClose}
      />
    </Alert>
  ) : (
    ''
  );
};

export default DeprecationAlertComponent;
