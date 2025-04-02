import React from 'react';

const StatusBar = ({ isConnected, userCount }) => {
  return (
    <div className="status-bar">
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div className="user-count">
        Users: {userCount}
      </div>
    </div>
  );
};

export default StatusBar;