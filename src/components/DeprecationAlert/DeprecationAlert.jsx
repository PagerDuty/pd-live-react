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

import i18next from 'src/i18n';

const DeprecationAlertComponent = () => {
  const {
    isOpen: isVisible, onClose,
  } = useDisclosure({ defaultIsOpen: true });
  const {
    t,
  } = useTranslation();

  const today = new Date();
  const eolWarningDate = new Date('2024-12-01');
  const eolDate = new Date('2025-01-31');
  let alertTitle = 'PD Live is deprecated';
  let i18nKey = 'Deprecation';
  let eolStatus = 'info';

  if (today > eolDate) {
    alertTitle = 'PD Live EOL: Effective';
    i18nKey = 'EOL';
    eolStatus = 'error';
  } else if (today > eolWarningDate) {
    alertTitle = 'PD Live EOL: Approaching';
    i18nKey = 'EOLWarning';
    eolStatus = 'warning';
  }

  return isVisible ? (
    <Alert status={eolStatus}>
      <AlertIcon />
      <Box w="100%">
        <AlertTitle>{t(alertTitle)}</AlertTitle>
        <AlertDescription>
          <Trans i18nKey={i18nKey}>
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

// List of eol names for i18next-parser
export const eolTranslations = [
  i18next.t('PD Live is deprecated'),
  i18next.t('Deprecation'),
  i18next.t('PD Live EOL: Approaching'),
  i18next.t('EOLWarning'),
  i18next.t('PD Live EOL: Effective'),
  i18next.t('EOL'),
];

export default DeprecationAlertComponent;
