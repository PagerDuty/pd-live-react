import React, {
  useCallback, useState,
} from 'react';

import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  useDebouncedCallback,
} from 'use-debounce';

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';

import {
  Select,
} from 'chakra-react-select';

import {
  useTranslation,
} from 'react-i18next';

import {
  toggleDisplayReassignModal as toggleDisplayReassignModalConnected,
  reassign as reassignConnected,
} from 'src/redux/incident_actions/actions';

import {
  throttledPdAxiosRequest,
} from 'src/util/pd-api-wrapper';

import {
  addUserToUsersMap as addUserToUsersMapConnected,
} from 'src/redux/users/actions';

const ReassignModalComponent = () => {
  const {
    t,
  } = useTranslation();

  const {
    displayReassignModal,
  } = useSelector((state) => state.incidentActions);
  const {
    selectedRows,
  } = useSelector((state) => state.incidentTable);
  const usersMap = useSelector((state) => state.users.usersMap);
  const dispatch = useDispatch();
  const addUserToUsersMap = (user) => {
    dispatch(addUserToUsersMapConnected(user));
  };
  const reassign = (incidents, assignment) => {
    dispatch(reassignConnected(incidents, assignment));
  };
  const toggleDisplayReassignModal = () => {
    dispatch(toggleDisplayReassignModalConnected());
  };

  const [selectOptions, setSelectOptions] = useState({ escalation_policies: [], users: [] });
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [more, setMore] = useState({ escalation_policies: false, users: false });
  const [isLoading, setIsLoading] = useState({ escalation_policies: false, users: false });
  const [tabIndex, setTabIndex] = useState(0);
  const tabItems = ['escalation_policies', 'users'];

  const [assignment, setAssignment] = useState(null);

  const requestOptionsPage = useCallback(async (inputValue, offset, epsOrUsers) => {
    const epOrUser = epsOrUsers === 'escalation_policies' ? 'escalation_policy' : 'user';
    const r = await throttledPdAxiosRequest('GET', epsOrUsers, { query: inputValue, offset });
    // setMore(r.data.more);
    setMore((prev) => ({ ...prev, [epsOrUsers]: r.data.more }));
    const r2 = r.data[epsOrUsers].map((obj) => {
      // take the opportunity to add the object to the map
      if (epOrUser === 'user') {
        if (!usersMap[obj.id]) {
          addUserToUsersMap(obj);
        }
      }
      return { label: obj.name, name: obj.name, value: obj.id, type: epOrUser };
    });
    return r2;
  }, []);

  const loadOptions = useCallback(
    async (epsOrUsers, inputValue) => {
      setIsLoading((prev) => ({ ...prev, [epsOrUsers]: true }));
      const r = await requestOptionsPage(inputValue, 0, epsOrUsers);
      setSelectOptions((prev) => ({ ...prev, [epsOrUsers]: r }));
      setIsLoading((prev) => ({ ...prev, [epsOrUsers]: false }));
    },
    [currentInputValue, requestOptionsPage],
  );

  const debouncedLoadOptions = useDebouncedCallback(loadOptions, 200);

  const loadMoreOptions = useCallback(
    async (epsOrUsers) => {
      if (!more[epsOrUsers]) {
        return;
      }
      setIsLoading((prev) => ({ ...prev, [epsOrUsers]: true }));
      const r = await requestOptionsPage(
        currentInputValue,
        selectOptions[epsOrUsers].length,
        epsOrUsers,
      );
      setSelectOptions((prev) => ({ ...prev, [epsOrUsers]: [...prev[epsOrUsers], ...r] }));
      setIsLoading((prev) => ({ ...prev, [epsOrUsers]: false }));
    },
    [currentInputValue, requestOptionsPage, more, selectOptions],
  );

  return (
    <Modal
      isOpen={displayReassignModal}
      onClose={() => {
        setTabIndex(0);
        setAssignment(null);
        toggleDisplayReassignModal();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('Reassign To')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs
            variant="soft-rounded"
            index={tabIndex}
            onChange={(index) => {
              setAssignment(null);
              setTabIndex(index);
              loadOptions(tabItems[index]);
            }}
          >
            <TabList>
              <Tab data-tab-id="reassign-ep-tab">{t('Escalation Policies')}</Tab>
              <Tab data-tab-id="reassign-user-tab">{t('Users')}</Tab>
            </TabList>
          </Tabs>
          <p />
          <Select
            id="reassign-select"
            // isMulti
            isSearchable
            isClearable
            isLoading={isLoading[tabItems[tabIndex]]}
            onChange={(selectedAssignment) => {
              setAssignment(selectedAssignment);
            }}
            onInputChange={(inputValue) => {
              setCurrentInputValue(inputValue);
              debouncedLoadOptions(tabItems[tabIndex], inputValue);
            }}
            onMenuScrollToBottom={() => loadMoreOptions(tabItems[tabIndex])}
            onFocus={() => loadOptions(tabItems[tabIndex], currentInputValue)}
            options={selectOptions[tabItems[tabIndex]]}
            value={assignment}
            placeholder={`${t('Select dotdotdot')}`}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            id="reassign-button"
            colorScheme="blue"
            isDisabled={assignment === null}
            onClick={() => {
              setAssignment(null);
              reassign(selectedRows, assignment);
            }}
          >
            {t('Reassign')}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setTabIndex(0);
              setAssignment(null);
              toggleDisplayReassignModal();
            }}
          >
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReassignModalComponent;
