// components/VideoConference.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function VideoConference({ roomId, username }) {
  const localVideoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Access camera
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        localVideoRef.current.srcObject = mediaStream;
      })
      .catch((err) => console.error("Camera access error:", err));

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-lg w-full h-full"
    >
      <h3 className="font-semibold mb-3 text-lg">🎥 Video Conference</h3>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg border border-gray-600 w-full max-h-[400px] bg-black"
      />
      <p className="mt-2 text-gray-300 text-sm">
        Connected as <span className="font-semibold">{username}</span>
      </p>
    </motion.div>
  );
}
