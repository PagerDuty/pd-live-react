import React, {
  useCallback,
  useState,
  useRef,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useDebouncedCallback,
} from 'use-debounce';

import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from '@chakra-ui/react';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayAddResponderModal as toggleDisplayAddResponderModalConnected,
  addResponder as addResponderConnected,
} from 'src/redux/incident_actions/actions';

import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

import {
  addUserToUsersMap as addUserToUsersMapConnected,
} from 'src/redux/users/actions';

const AddResponderModalComponent = () => {
  const messageMaxChars = 110;

  const {
    t,
  } = useTranslation();

  const {
    displayAddResponderModal,
  } = useSelector((state) => state.incidentActions);
  const {
    selectedRows,
  } = useSelector((state) => state.incidentTable);
  const {
    id: currentUserId,
  } = useSelector((state) => state.users.currentUser);

  const usersMap = useSelector((state) => state.users.usersMap);
  const dispatch = useDispatch();
  const addUserToUsersMap = (user) => {
    dispatch(addUserToUsersMapConnected(user));
  };
  const addResponder = (incidents, requesterId, responderRequestTargets, message) => {
    dispatch(addResponderConnected(incidents, requesterId, responderRequestTargets, message));
  };
  const toggleDisplayAddResponderModal = () => {
    dispatch(toggleDisplayAddResponderModalConnected());
  };

  const [selectOptions, setSelectOptions] = useState({ escalation_policies: [], users: [] });
  const [currentInputValue, setCurrentInputValue] = useState({ escalation_policies: '', users: '' });
  const [more, setMore] = useState({ escalation_policies: false, users: false });
  const [isLoading, setIsLoading] = useState({ escalation_policies: false, users: false });
  const [selectedItems, setSelectedItems] = useState({ escalation_policies: [], users: [] });
  const [message, setMessage] = useState('');

  const epSelectRef = useRef(null);
  const userSelectRef = useRef(null);

  const requestOptionsPage = useCallback(async (inputValue, offset, epsOrUsers) => {
    const epOrUser = epsOrUsers === 'escalation_policies' ? 'escalation_policy' : 'user';
    const r = await throttledPdAxiosRequest(
      'GET',
      epsOrUsers,
      { query: inputValue, offset },
    );
    setMore((prev) => ({ ...prev, [epsOrUsers]: r.data.more }));
    const r2 = r.data[epsOrUsers].map((obj) => {
      // take the opportunity to add the object to the map
      if (epOrUser === 'user') {
        if (!usersMap[obj.id]) {
          addUserToUsersMap(obj);
        }
      }
      return ({ label: obj.name, name: obj.name, value: obj.id, type: epOrUser });
    });
    return r2;
  }, []);

  const loadOptions = useCallback(async (epsOrUsers, inputValue) => {
    setIsLoading((prev) => ({ ...prev, [epsOrUsers]: true }));
    const r = await requestOptionsPage(inputValue, 0, epsOrUsers);
    setSelectOptions((prev) => ({ ...prev, [epsOrUsers]: r }));
    setIsLoading((prev) => ({ ...prev, [epsOrUsers]: false }));
  }, [currentInputValue, requestOptionsPage]);

  const debouncedLoadOptions = useDebouncedCallback(loadOptions, 200);

  const loadMoreOptions = useCallback(async (epsOrUsers) => {
    if (!more[epsOrUsers]) {
      return;
    }
    setIsLoading((prev) => ({ ...prev, [epsOrUsers]: true }));
    const r = await requestOptionsPage(currentInputValue[epsOrUsers], selectOptions[epsOrUsers].length, epsOrUsers);
    setSelectOptions((prev) => ({ ...prev, [epsOrUsers]: [...prev[epsOrUsers], ...r] }));
    setIsLoading((prev) => ({ ...prev, [epsOrUsers]: false }));
  }, [currentInputValue, requestOptionsPage, more, selectOptions]);

  return (
    <Modal
      isOpen={displayAddResponderModal}
      onClose={() => {
        setSelectedItems({ escalation_policies: [], users: [] });
        setMessage('');
        toggleDisplayAddResponderModal();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Add Responders')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel htmlFor="add-responders-select-users">{t('Users')}</FormLabel>
            <Select
              id="add-responders-select-users"
              ref={userSelectRef}
              isMulti
              isSearchable
              isClearable
              isLoading={isLoading.users}
              onChange={(selectedUsers) => {
                setSelectedItems((prev) => ({ ...prev, users: selectedUsers }));
              }}
              onInputChange={(inputValue) => {
                setCurrentInputValue((prev) => ({ ...prev, users: inputValue }));
                debouncedLoadOptions('users', inputValue);
              }}
              onMenuScrollToBottom={() => loadMoreOptions('users')}
              onFocus={() => loadOptions('users', currentInputValue.users)}
              options={selectOptions.users}
              placeholder={`${t('Select dotdotdot')}`}
            />
          </FormControl>
          <FormControl>
            <FormLabel mt={4} htmlFor="add-responders-select-eps">{t('Escalation Policies')}</FormLabel>
            <Select
              id="add-responders-select-eps"
              ref={epSelectRef}
              isMulti
              isSearchable
              isClearable
              isLoading={isLoading.escalation_policies}
              onChange={(selectedEps) => {
                setSelectedItems((prev) => ({ ...prev, escalation_policies: selectedEps }));
              }}
              onInputChange={(inputValue) => {
                setCurrentInputValue((prev) => ({ ...prev, escalation_policies: inputValue }));
                debouncedLoadOptions('escalation_policies', inputValue);
              }}
              onMenuScrollToBottom={() => loadMoreOptions('escalation_policies')}
              onFocus={() => loadOptions('escalation_policies', currentInputValue.escalation_policies)}
              options={selectOptions.escalation_policies}
              placeholder={`${t('Select dotdotdot')}`}
            />
          </FormControl>
          <FormControl>
            <FormLabel mt={4} htmlFor="add-responders-textarea">{t('Message')}</FormLabel>
            <Textarea
              id="add-responders-textarea"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              placeholder={t('Provide brief message for additional responders')}
              maxLength={messageMaxChars}
            />
            <div className="add-responder-message-remaining-chars">
              {`${messageMaxChars - message.length} `}
              {t('characters remaining')}
            </div>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            id="add-responders-button"
            colorScheme="blue"
            isDisabled={selectedItems.users.length + selectedItems.escalation_policies.length === 0}
            onClick={() => {
              const responderRequestTargets = [...selectedItems.escalation_policies, ...selectedItems.users];
              setSelectedItems({ escalation_policies: [], users: [] });
              setMessage('');
              addResponder(selectedRows, currentUserId, responderRequestTargets, message);
            }}
          >
            {t('Add Responders')}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setSelectedItems({ escalation_policies: [], users: [] });
              setMessage('');
              toggleDisplayAddResponderModal();
            }}
          >
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddResponderModalComponent;
