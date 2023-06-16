/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  useDrag,
  useDrop,
} from 'react-dnd';

import {
  Tag,
} from '@chakra-ui/react';

import {
  AddIcon,
  CloseIcon,
} from '@chakra-ui/icons';

const columnValue = (column) => {
  let value;
  if (column.columnType === 'alert') {
    // Alert column based on aggregator
    value = column.Header
      + (column.accessorPath ? `:${column.accessorPath}` : '')
      + (column.aggregator ? `:${column.aggregator}` : '');
  } else {
    // Incident column
    value = column.Header;
  }
  return value;
};

const columnLabel = (column) => {
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
  const originalIndex = findColumnInSelectedColumns(columnValue(column)).index;
  const [, drag] = useDrag(
    () => ({
      type: 'DraggableColumnsModalItem',
      item: { id: columnValue(column), originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const {
          id: droppedId,
          originalIndex: droppedOriginalIndex,
        } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveColumnInSelectedColumns(droppedId, droppedOriginalIndex);
        }
      },
    }),
    [columnValue(column), originalIndex, moveColumnInSelectedColumns],
  );
  const [, drop] = useDrop(
    () => ({
      accept: 'DraggableColumnsModalItem',
      hover({
        id: draggedId,
      }) {
        if (draggedId !== columnValue(column)) {
          const {
            index: overIndex,
          } = findColumnInSelectedColumns(columnValue(column));
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
        <AddIcon
          id={`column-${column.id}-add-icon`}
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
          id={`column-${column.id}-remove-icon`}
          {...iconProps}
          aria-label={ariaLabel}
        />
      );
      break;
  }
  const tagProps = {
    id: `column-${column.id}-tag`,
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
