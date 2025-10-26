import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username.trim()) return alert("Please enter a username");
    localStorage.setItem("user", username);
    navigate("/dashboard"); // ✅ move to main dashboard
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎥 Video Conference App</h1>
     <input
  className="p-2 rounded mb-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter your name"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

      <button
        className="bg-blue-600 px-4 py-2 rounded"
        onClick={handleJoin}
      >
        Join Dashboard
      </button>
    </div>
  );
}
