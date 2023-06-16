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
  if (!column) {
    return '';
  }
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

  const columnId = column.id || column.label || column.accessorPath;

  let ariaLabel = '';
  let iconComponent = null;
  switch (itemType) {
    case 'available':
      ariaLabel = 'Add column';
      iconComponent = (
        <AddIcon
          id={`column-${columnId}-add-icon`}
          {...iconProps}
          aria-label={ariaLabel}
        />
      );
      break;
    case 'selected':
    case 'custom':
    default:
      ariaLabel = 'Remove column';
      iconComponent = (
        <CloseIcon
          id={`column-${columnId}-remove-icon`}
          {...iconProps}
          aria-label={ariaLabel}
        />
      );
      break;
  }
  const tagProps = {
    id: `column-${columnId}-tag`,
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
