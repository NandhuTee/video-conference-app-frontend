import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";

export default function ChatPanel({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Listen for new messages
  useEffect(() => {
    if (!roomId) return;

    socket.on("messages:initial", (msgs) => setMessages(msgs));
    socket.on("message:new", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("messages:initial");
      socket.off("message:new");
    };
  }, [roomId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send-message", { roomId, sender: username, text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, i) => (
          <div key={i} className={`my-1 ${msg.sender === username ? "text-right" : "text-left"}`}>
            <span className="font-semibold">{msg.sender}: </span>{msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex mt-2 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded text-white"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 px-3 rounded hover:bg-blue-500">Send</button>
      </div>
    </div>
  );
}
