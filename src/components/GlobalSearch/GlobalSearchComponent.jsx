import React from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';

import {
  CloseIcon, SearchIcon,
} from '@chakra-ui/icons';

import {
  useTranslation,
} from 'react-i18next';

import {
  updateSearchQuery as updateSearchQueryConnected,
} from 'src/redux/query_settings/actions';

const GlobalSearchComponent = () => {
  const searchQuery = useSelector((state) => state.querySettings.searchQuery);
  const dispatch = useDispatch();
  const updateSearchQuery = (newSearchQuery) => dispatch(updateSearchQueryConnected(newSearchQuery));

  const {
    t,
  } = useTranslation();

  return (
    <>
      <InputGroup size="sm">
        <Input
          id="global-search-input"
          placeholder={t('Search')}
          onChange={(e) => updateSearchQuery(e.target.value)}
          value={searchQuery}
          mr={2}
        />
        <InputLeftElement>
          <SearchIcon />
        </InputLeftElement>
        <InputRightElement>
          <IconButton
            display={searchQuery ? 'block' : 'none'}
            mr={3}
            aria-label="Clear search"
            icon={<CloseIcon />}
            size="xs"
            onClick={() => {
              updateSearchQuery('');
            }}
          />
        </InputRightElement>
      </InputGroup>
    </>
  );
};

export default GlobalSearchComponent;
