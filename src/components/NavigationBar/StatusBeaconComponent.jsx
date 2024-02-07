import React from 'react';
import {
  connect,
} from 'react-redux';

import {
  Tooltip,
  useColorModeValue,
  useToken,
} from '@chakra-ui/react';

import i18next from 'src/i18n';

import Beacon from './subcomponents/Beacon';

const StatusBeaconComponent = ({
  connectionStatus, connectionStatusMessage, queueStats,
}) => {
  const useColorModeToken = (lightColor, darkColor) => (
    useColorModeValue(useToken('colors', lightColor), useToken('colors', darkColor))
  );
  const colorForStatus = {
    positive: useColorModeToken('green.500', 'green.600'),
    neutral: useColorModeToken('yellow.300', 'yellow.500'),
    negative: useColorModeToken('red.500', 'red.600'),
    dormant: useColorModeToken('gray.400', 'gray.600'),
  };

  const waiting = queueStats.RECEIVED + queueStats.QUEUED;
  const running = queueStats.RUNNING + queueStats.EXECUTING;

  const queueStatsStr = `${waiting} ${i18next.t('waiting')}, ${running} ${i18next.t('running')}`;
  return (
    <Tooltip
      aria-label="status-beacon-connection"
      label={(
        <>
          {i18next.t('Status')}
          :
          {connectionStatusMessage}
          <br />
          {queueStatsStr}
        </>
      )}
    >
      <div className="status-beacon-ctr">
        <Beacon color={colorForStatus[connectionStatus]} loading={waiting + running > 0} />
        {/* <Beacon status={connectionStatus} speed="normal" size="1.2em" /> */}
      </div>
    </Tooltip>
  );
};

const mapStateToProps = (state) => ({
  connectionStatus: state.connection.connectionStatus,
  connectionStatusMessage: state.connection.connectionStatusMessage,
  queueStats: state.connection.queueStats,
});

export default connect(mapStateToProps)(StatusBeaconComponent);
