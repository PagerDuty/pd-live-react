/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  Tag,
} from '@chakra-ui/react';

import {
  AddIcon,
  CloseIcon,
} from '@chakra-ui/icons';

const columnLabel = (column) => {
  if (column.label) {
    return column.label;
  }
  return column.i18n ? column.i18n : column.Header;
};

const ColumnsModalItem = ({
  column,
  onClick,
  itemType,
}) => {
  const iconProps = {
    onClick,
    cursor: 'pointer',
    boxSize: 2.5,
    ml: 1,
  };

  let ariaLabel = '';
  let iconComponent = null;
  switch (itemType) {
    case 'available':
      ariaLabel = 'Add column';
      iconComponent = <AddIcon {...iconProps} aria-label={ariaLabel} />;
      break;
    case 'selected':
    case 'custom':
    default:
      ariaLabel = 'Remove column';
      iconComponent = <CloseIcon {...iconProps} aria-label={ariaLabel} />;
      break;
  }
  const tagProps = {
    m: 1,
    variant: itemType === 'available' ? 'subtle' : 'solid',
    colorScheme: itemType === 'available' ? 'gray' : 'blue',
  };
  return (
    <Tag {...tagProps}>
      {columnLabel(column)}
      {iconComponent}
    </Tag>
  );
};

export default ColumnsModalItem;
