/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  useDrag, useDrop,
} from 'react-dnd';

import {
  Tag,
} from '@chakra-ui/react';

import {
  AddIcon, CloseIcon,
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

const DraggableColumnsModalItem = ({
  column,
  onClick,
  itemType,
  moveColumnInSelectedColumns,
  findColumnInSelectedColumns,
}) => {
  const originalIndex = findColumnInSelectedColumns(column.value).index;
  const [, drag] = useDrag(
    () => ({
      type: 'DraggableColumnsModalItem',
      item: { id: column.value, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const {
          id: droppedId, originalIndex: droppedOriginalIndex,
        } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveColumnInSelectedColumns(droppedId, droppedOriginalIndex);
        }
      },
    }),
    [column.value, originalIndex, moveColumnInSelectedColumns],
  );
  const [, drop] = useDrop(
    () => ({
      accept: 'DraggableColumnsModalItem',
      hover({
        id: draggedId,
      }) {
        if (draggedId !== column.value) {
          const {
            index: overIndex,
          } = findColumnInSelectedColumns(column.value);
          moveColumnInSelectedColumns(draggedId, overIndex);
        }
      },
    }),
    [findColumnInSelectedColumns, moveColumnInSelectedColumns],
  );

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
      // eslint-disable-next-line max-len
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
    variant: itemType === 'available' ? 'subtle' : 'solid',
    colorScheme: itemType === 'available' ? 'gray' : 'blue',
    cursor: 'move',
  };
  return (
    <Tag ref={(node) => drag(drop(node))} {...tagProps}>
      {columnLabel(column)}
      {iconComponent}
    </Tag>
  );
};

export default DraggableColumnsModalItem;
