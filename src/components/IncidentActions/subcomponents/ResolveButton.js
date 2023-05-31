import React, {
  useMemo,
  useCallback,
} from 'react';

import {
  useSelector,
  useDispatch,
} from 'react-redux';

import {
  Button,
  useToast,
} from '@chakra-ui/react';

import {
  FaCheckCircle,
} from 'react-icons/fa';

import {
  useTranslation,
} from 'react-i18next';

import {
  RESOLVED,
} from 'util/incidents';

import {
  throttledPdAxiosRequest,
} from 'util/pd-api-wrapper';

import {
  doAction as doActionConnected,
} from 'redux/incident_actions/actions';

const ResolveButton = () => {
  const {
    t,
  } = useTranslation();

  const selectedRows = useSelector((state) => state.incidentTable.selectedRows);
  const dispatch = useDispatch();
  const doAction = () => dispatch(doActionConnected());

  const toast = useToast();

  const resolve = useCallback(async (incidents) => {
    const data = incidents.map((incident) => ({
      id: incident.id,
      type: 'incident_reference',
      status: 'resolved',
    }));
    try {
      const r = await throttledPdAxiosRequest('PUT', '/incidents', {}, { incidents: data });
      if (r.error) {
        const title = r.text ? `${r.error}: ${r.text}` : r.error;
        toast({
          title,
          status: 'error',
        });
      } else {
        const incidentListStr = new Intl.ListFormat().format(
          incidents.map((i) => `${i.incident_number}`),
        );
        const title = `Resolved incident${incidents.length > 1 ? 's' : ''} ${incidentListStr}`;
        toast({
          title,
          status: 'success',
        });
        doAction();
      }
    } catch (e) {
      const title = 'Resolve failed';
      let description = e.response?.data?.error?.message || 'Unknown error';
      if (e.response?.data?.error?.errors) {
        description += ` - ${e.response.data.error.errors.join(', ')}`;
      }
      toast({
        title,
        description,
        status: 'error',
      });
    }
  });

  const enabled = useMemo(() => (
    // some rows are selected
    selectedRows.length > 0
    // and none of the selected rows are resolved
    && selectedRows.filter((i) => i.status === RESOLVED).length === 0
  ), [selectedRows]);

  return (
    <Button
      size="sm"
      leftIcon={<FaCheckCircle />}
      mr={2}
      mb={2}
      onClick={() => resolve(selectedRows)}
      isDisabled={!enabled}
    >
      {t('Resolve')}
    </Button>
  );
};

export default ResolveButton;
