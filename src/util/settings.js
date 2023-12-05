/* eslint-disable max-len */
import {
  useTranslation,
} from 'react-i18next';

/* eslint-disable import/prefer-default-export */
export const defaultSinceDateTenors = [
  'Today',
  '1 Day',
  '3 Days',
  '1 Week',
  '2 Weeks',
  '1 Month',
  '3 Months',
  '6 Months',
];

// FIXME: This is a bit of a workaround to avoid changing the existing defaultSinceDateTenors
// This is not directly used, it's only here to trick i18next-parser into registering the translations
// so they are available when SettingsModalComponent is rendered as `{t(tenor)}` is not a literal string
// as i18next-parser cannot parse variables,
export const defaultSinceDateTenorsLabels = () => {
  const {
    t,
  } = useTranslation();
  return {
    Today: t('Today'),
    '1 Day': t('1 Day'),
    '3 Days': t('3 Days'),
    '1 Week': t('1 Week'),
    '2 Weeks': t('2 Weeks'),
    '1 Month': t('1 Month'),
    '3 Months': t('3 Months'),
    '6 Months': t('6 Months'),
  };
};
