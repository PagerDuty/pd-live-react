import React from 'react';

import {
  Box,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
} from '@chakra-ui/react';

import {
  IoFunnel, IoFunnelOutline,
} from 'react-icons/io5';

import {
  CloseIcon,
} from '@chakra-ui/icons';

import {
  useTranslation,
} from 'react-i18next';

const ColumnFilterComponent = ({
  column: {
    filterValue, setFilter,
  },
}) => {
  const {
    t,
  } = useTranslation();
  return (
    <Popover trigger="hover" size="content">
      <PopoverTrigger>
        <Box m="auto" p="auto" top={1} position="relative" cursor="default" display="inline">
          {filterValue ? <IoFunnel /> : <IoFunnelOutline />}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="content">
        <PopoverArrow />
        <Box p={1}>
          <InputGroup size="sm">
            <Input
              value={filterValue || ''}
              onChange={(e) => {
                setFilter(e.target.value || undefined);
              }}
              placeholder={t('Filter')}
            />
            <InputRightElement>
              <Tooltip label={t('Clear Filter')}>
                <IconButton
                  display={filterValue ? 'block' : 'none'}
                  aria-label={t('Clear Filter')}
                  icon={<CloseIcon />}
                  size="xs"
                  onClick={() => {
                    setFilter(undefined);
                  }}
                />
              </Tooltip>
            </InputRightElement>
          </InputGroup>
        </Box>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnFilterComponent;
