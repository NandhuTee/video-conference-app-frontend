import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

import ChatPanel from "../components/ChatPanel";
import TaskBoard from "../components/TaskBoard";
import Whiteboard from "../components/Whiteboard";
import VideoPanel from "../components/VideoPanel";
import UsersList from "../components/UsersList";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [roomId, setRoomId] = useState("");
  const [activePanel, setActivePanel] = useState(null);
  const [users, setUsers] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");

  // Redirect if no user
  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  // Listen for users list update
  useEffect(() => {
    socket.on("users:update", (usersList) => setUsers(usersList));
    return () => socket.off("users:update");
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleCreateRoom = () => {
    const newRoom = prompt("Enter new room name:");
    if (!newRoom) return;
    setRoomId(newRoom);
    setInfoMessage(`Hi ${user}, you created room "${newRoom}"`);
    socket.emit("join-room", { roomId: newRoom, username: user });
  };

  const handleJoinRoom = () => {
    const existingRoom = prompt("Enter room name to join:");
    if (!existingRoom) return;
    setRoomId(existingRoom);
    setInfoMessage(`Hi ${user}, you joined room "${existingRoom}"`);
    socket.emit("join-room", { roomId: existingRoom, username: user });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-900 p-4 rounded-b-lg shadow-md">
        <h1 className="text-2xl font-bold">🎬 Video Conference App</h1>
        <div>Hi, <span className="font-semibold">{user}</span> 👋</div>
      </header>

      {/* Info message */}
      {infoMessage && (
        <div className="bg-green-700 text-white p-3 m-4 rounded-lg text-center">
          {infoMessage}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center bg-blue-800 p-3 rounded-lg mt-4 mx-4">
        <div className="flex gap-2">
          <button onClick={() => setActivePanel("taskboard")} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600">🗂️ Tasks</button>
          <button onClick={() => setActivePanel("whiteboard")} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600">🎨 Whiteboard</button>
          <button onClick={() => setActivePanel("chat")} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600">💬 Chat</button>
          <button onClick={() => setActivePanel("users")} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600">👥 Users</button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCreateRoom} className="bg-green-600 px-3 py-1 rounded hover:bg-green-500">➕ Create Room</button>
          <button onClick={handleJoinRoom} className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-500">🔗 Join Room</button>
          <button onClick={handleSignOut} className="bg-red-600 px-3 py-1 rounded hover:bg-red-500">🚪 Sign Out</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 gap-4 m-4">
        {/* Video Panel */}
        <div className="flex-1 bg-gray-800 rounded-lg p-3 flex flex-col">
          <h2 className="text-xl mb-3">🎥 Video Conference</h2>
          <VideoPanel socket={socket} roomId={roomId} user={user} />
        </div>

        {/* Dynamic Panel */}
        <div className="flex-[0.8] bg-gray-800 rounded-lg p-3 flex flex-col">
          {activePanel === "chat" && <ChatPanel roomId={roomId} username={user} />}
          {activePanel === "taskboard" && <TaskBoard roomId={roomId} username={user} />}
          {activePanel === "whiteboard" && <Whiteboard roomId={roomId} />}
          {activePanel === "users" && <UsersList users={users} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 p-4 rounded-t-lg text-center mt-auto">
        © 2025 Video Conference App. All rights reserved.
      </footer>
    </div>
  );
}
