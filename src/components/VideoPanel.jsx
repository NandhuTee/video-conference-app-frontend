// src/components/VideoPanel.jsx
import React, { useEffect, useRef, useState } from "react";

export default function VideoPanel() {
  const videoRef = useRef(null); // Ref to attach video element
  const [stream, setStream] = useState(null); // Local camera/audio stream
  const [isCameraOn, setIsCameraOn] = useState(false); // Camera state
  const [isMuted, setIsMuted] = useState(false); // Mic state
  const [isSharingScreen, setIsSharingScreen] = useState(false); // Screen share state
  const [screenStream, setScreenStream] = useState(null); // Screen share stream

  // Start camera
  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }, // Full HD for better visibility
        audio: true,
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setIsMuted(prev => !prev);
  };

  // Share screen
  const startScreenShare = async () => {
    try {
      const sStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // usually screen share audio is separate
      });
      setScreenStream(sStream);
      if (videoRef.current) videoRef.current.srcObject = sStream;
      setIsSharingScreen(true);

      // Stop sharing when user ends it from browser UI
      sStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  // Stop screen share
  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      if (videoRef.current) videoRef.current.srcObject = stream || null;
    }
    setIsSharingScreen(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-lg text-white w-full h-full flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold mb-2">🎥 Video Conference</h3>

      {/* Video container */}
      <div className="relative bg-black rounded-lg overflow-hidden w-full h-96 flex justify-center items-center">
        <video
          ref={videoRef}
          autoPlay
          muted={!isSharingScreen} // unmute mic when not screen sharing
          playsInline
          className="rounded-lg w-full h-full object-cover"
        />
        {!isCameraOn && !isSharingScreen && (
          <div className="absolute inset-0 flex justify-center items-center text-gray-400">
            Camera Off
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-3 flex-wrap">
        <button
          onClick={isCameraOn ? stopCamera : startCamera}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>

        <button
          onClick={toggleMute}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          disabled={!isCameraOn || isSharingScreen}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={isSharingScreen ? stopScreenShare : startScreenShare}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          {isSharingScreen ? "Stop Sharing" : "Share Screen"}
        </button>
      </div>
    </div>
  );
}
