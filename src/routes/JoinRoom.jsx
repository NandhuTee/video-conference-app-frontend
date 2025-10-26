import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinRoom() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const joinRoom = () => {
    if (!username || !roomId) return alert('Enter both username and room ID');
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white gap-4">
      <h1 className="text-3xl font-bold">Join Room</h1>
      <input
        type="text"
        placeholder="Username"
        className="p-2 rounded text-black"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room ID"
        className="p-2 rounded text-black"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
        Join
      </button>
    </div>
  );
}
