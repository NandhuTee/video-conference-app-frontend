import React, { useState } from "react";
import VideoConference from "./VideoConference";
import ChatPanel from "./ChatPanel";
import TaskBoard from "./TaskBoard";
import Whiteboard from "./Whiteboard";
import { motion } from "framer-motion";

export default function DashboardLayout({ roomId, user, handleSignOut }) {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Dashboard Top Bar */}
      <div className="flex justify-between items-center bg-blue-900 p-3 rounded-lg shadow-md">
        <div className="flex gap-3">
          <button
            onClick={() => setActivePanel("taskboard")}
            className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600"
          >
            🗂️ Tasks
          </button>
          <button
            onClick={() => setActivePanel("whiteboard")}
            className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600"
          >
            🎨 Whiteboard
          </button>
          <button
            onClick={() => setActivePanel("chat")}
            className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600"
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActivePanel("users")}
            className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600"
          >
            👥 Users
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Main Layout - Split View */}
      <div className="flex flex-1 gap-4 p-4">
        {/* Left side — video conference */}
        <div className="w-1/2 bg-gray-800 rounded-lg p-3">
          <VideoConference roomId={roomId} username={user} />
        </div>

        {/* Right side — dynamic panel */}
        <div className="w-1/2 bg-gray-800 rounded-lg">
          {activePanel === "whiteboard" && (
            <div className="h-full">
              <div className="flex justify-between items-center p-4 bg-gray-700 rounded-t-lg">
                <h3 className="text-xl font-semibold">🎨 Whiteboard</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                >
                  ✖ Close
                </button>
              </div>
              <div className="p-4 h-[calc(100%-4rem)]">
                <Whiteboard />
              </div>
            </div>
          )}

          {activePanel === "chat" && (
            <div className="h-full">
              <div className="flex justify-between items-center p-4 bg-gray-700 rounded-t-lg">
                <h3 className="text-xl font-semibold">💬 Chat</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                >
                  ✖ Close
                </button>
              </div>
              <div className="p-4 h-[calc(100%-4rem)]">
                <ChatPanel roomId={roomId} username={user} />
              </div>
            </div>
          )}

          {activePanel === "taskboard" && (
            <div className="h-full">
              <div className="flex justify-between items-center p-4 bg-gray-700 rounded-t-lg">
                <h3 className="text-xl font-semibold">🗂️ Task Board</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                >
                  ✖ Close
                </button>
              </div>
              <div className="p-4 h-[calc(100%-4rem)]">
                <TaskBoard />
              </div>
            </div>
          )}
        </div>
      </div>

      {activePanel === "chat" && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed right-0 top-0 h-full w-80 bg-gray-800 shadow-lg z-40"
        >
          <div className="p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-xl font-semibold">� Chat</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="bg-red-600 px-2 py-1 rounded hover:bg-red-500"
              >
                ✖ Close
              </button>
            </div>
            <ChatPanel roomId={roomId} username={user} />
          </div>
        </motion.div>
      )}

      {activePanel === "taskboard" && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-2/3">
            <div className="flex justify-between mb-3">
              <h3 className="text-xl font-semibold">🗂️ Task Board</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="bg-red-600 px-2 py-1 rounded hover:bg-red-500"
              >
                ✖ Close
              </button>
            </div>
            <TaskBoard onClose={() => setActivePanel(null)} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
