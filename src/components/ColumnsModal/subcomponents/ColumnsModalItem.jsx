/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  Tag,
  Text,
} from '@chakra-ui/react';

import {
  AddIcon, CloseIcon,
} from '@chakra-ui/icons';

import {
  useTranslation,
} from 'react-i18next';

const columnLabel = (column) => {
  if (!column) {
    return '';
  }
  if (column.label) {
    return column.label;
  }
  return column.i18n ? column.i18n : column.Header;
};

const ColumnsModalItem = ({
  column, onClick, itemType, columnType = 'alert',
}) => {
  const {
    t,
  } = useTranslation();

  const iconProps = {
    onClick,
    cursor: 'pointer',
    boxSize: 2.5,
    ml: 1,
  };

  if (!column) {
    // old default example column would give null here
    return null;
  }

  let ariaLabel = '';
  let iconComponent = null;
  switch (itemType) {
    case 'available':
      ariaLabel = 'Add column';
      iconComponent = (
        <AddIcon id={`column-${column.value}-add-icon`} {...iconProps} aria-label={ariaLabel} />
      );
      break;
    case 'selected':
    case 'custom':
    default:
      ariaLabel = 'Remove column';
      iconComponent = (
        <CloseIcon id={`column-${column.value}-remove-icon`} {...iconProps} aria-label={ariaLabel} />
      );
      break;
  }
  const tagProps = {
    id: `column-${column.value}-tag`,
    m: 1,
    p: 1,
    variant: itemType === 'available' ? 'subtle' : 'solid',
    colorScheme: itemType === 'available' ? 'gray' : 'blue',
  };

  let tagText = columnLabel(column);
  if (itemType === 'custom') {
    if (columnType === 'alert') {
      tagProps.colorScheme = 'red';
      tagProps.px = 2;
      tagText = (
        <Text as="span">
          <b>{t('Header')}</b>
          :&nbsp;
          {column.Header}
          <br />
          <b>{t('JSON Path')}</b>
          :&nbsp;
          {column.accessorPath}
          <br />
        </Text>
      );
    } else {
      tagProps.colorScheme = 'purple';
      tagProps.px = 2;
      tagText = (
        <Text as="span">
          <b>{t('Header')}</b>
          :&nbsp;
          {column.Header}
          <br />
          <b>{t('JSON Path')}</b>
          :&nbsp;
          {column.accessorPath}
          <br />
          <b>{t('Regex')}</b>
          :&nbsp;
          {column.expression}
        </Text>
      );
    }
  }
  return (
    <Tag {...tagProps}>
      {tagText}
      {iconComponent}
    </Tag>
  );
};

export default ColumnsModalItem;
