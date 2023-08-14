import React, {
  useMemo,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button,
} from '@chakra-ui/react';

import {
  BsSignMergeRightFill,
} from 'react-icons/bs';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayMergeModal as toggleDisplayMergeModalConnected,
} from 'src/redux/incident_actions/actions';

const MergeButton = () => {
  const {
    t,
  } = useTranslation();
  const selectedCount = useSelector((state) => state.incidentTable.selectedCount);
  const dispatch = useDispatch();
  const toggleDisplayMergeModal = () => dispatch(toggleDisplayMergeModalConnected());
  const enabled = useMemo(() => selectedCount > 0, [selectedCount]);

  return (
    <Button
      id="incident-action-merge-button"
      size="sm"
      leftIcon={<BsSignMergeRightFill />}
      mr={2}
      mb={2}
      onClick={toggleDisplayMergeModal}
      isDisabled={!enabled}
    >
      {t('Merge')}
    </Button>
  );
};

export default MergeButton;
