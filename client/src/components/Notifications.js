import React from 'react';

const Notifications = ({ notifications }) => {
  return (
    <div className="notifications-container">
      {notifications.length === 0 ? (
        <div className="notification">No activity yet</div>
      ) : (
        notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification ${notification.className}`}
          >
            {notification.message}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;