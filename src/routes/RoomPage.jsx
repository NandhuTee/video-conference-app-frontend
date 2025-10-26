// src/routes/RoomPage.jsx
import React from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function RoomPage({ roomId, user, handleSignOut }) {
  return (
    <DashboardLayout
      roomId={roomId}
      user={user}
      handleSignOut={handleSignOut}
    />
  );
}
