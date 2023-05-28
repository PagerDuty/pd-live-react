/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  Box,
  Button,
  Flex,
  useColorModeValue,
  useCheckbox,
} from '@chakra-ui/react';

const QuerySettingsCheckbox = ({
  children,
  ...props
}) => {
  const {
    state: {
      isChecked,
    },
    getInputProps,
    getCheckboxProps,
  } = useCheckbox(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  const borderColor = useColorModeValue('gray.500', 'gray.300');
  const highlightColor = useColorModeValue('gray.200', 'gray.600');
  const {
    checkColor = borderColor,
  } = props;
  return (
    <Button
      p={1}
      mr={1}
      size="sm"
      rounded="full"
      as="label"
      variant="outline"
      fontWeight="normal"
      borderColor={borderColor}
      bg={isChecked ? highlightColor : 'transparent'}
      {...checkbox}
    >
      <input {...input} />
      <Flex
        m={0}
        p={0}
        alignItems="center"
        justifyContent="center"
        h={5}
        w={5}
        borderRadius="full"
        borderColor={borderColor}
        opacity={isChecked ? 1 : 0.6}
        borderWidth={2}
      >
        <Flex
          m={0}
          p={0}
          borderRadius="full"
          bg={isChecked ? checkColor : 'transparent'}
          h={3}
          w={3}
        />
      </Flex>
      <Box ml={1}>
        {children}
      </Box>
    </Button>
  );
};

export default QuerySettingsCheckbox;
