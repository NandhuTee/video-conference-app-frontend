import React from 'react';

const UsersList = ({ users }) => {
  return (
    <div className="users-list">
      <h3>Participants - 👥 Users in Room</h3>
      <ul>
        {users && users.length > 0 ? (
          users.map((user, idx) => (
            <li key={user.id || idx}>{user.name || user.username || 'Unknown User'}</li>
          ))
        ) : (
          <li>No users in this room.</li>
        )}
      </ul>
    </div>
  );
};

export default UsersList;
