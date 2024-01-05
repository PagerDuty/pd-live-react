import React, {
  useState,
} from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
} from '@chakra-ui/react';

const isInt = (value) => {
  const x = parseInt(value, 10);
  return !Number.isNaN(x) && x.toString() === value;
};

const ExtraButton = ({
  label, url, width, height,
}) => {
  // State to control the open state of the popover
  const [isOpen, setIsOpen] = useState(false);

  // Function to open the popover
  const openPopover = () => setIsOpen(true);

  // Function to close the popover
  const closePopover = () => setIsOpen(false);

  return (
    <Popover isOpen={isOpen} onClose={closePopover} closeOnBlur={false}>
      <PopoverTrigger>
        <Button
          onClick={openPopover}
          id={`incident-action-extra-button-${url}`}
          size="sm"
          mr={2}
          mb={2}
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        zIndex="999"
        w={isInt(width) ? `${width}vw` : '80vw'}
        h={isInt(height) ? `${height}vh` : '80vh'}
      >
        <PopoverHeader>
          <b>{label}</b>
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody height="calc(100% - 60px)">
          <Box flex="1" overflow="hidden" height="100%">
            <iframe
              src={url}
              title={label}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ExtraButton;
