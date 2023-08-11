import {
  connect,
} from 'react-redux';

import {
  Tooltip,
} from '@chakra-ui/react';

import i18next from 'i18n';

import Beacon from './subcomponents/Beacon';

const StatusBeaconComponent = ({
  connectionStatus, connectionStatusMessage, queueStats,
}) => {
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
        <Beacon status={connectionStatus} speed="normal" size="1.2em" />
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
