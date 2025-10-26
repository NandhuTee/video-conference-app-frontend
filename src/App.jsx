// src/App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./routes/LoginPage";
import Dashboard from "./routes/Dashboard";
import RoomPage from "./routes/RoomPage";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/room/:id", element: <RoomPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
