// src/components/Whiteboard.jsx
import React, { useRef, useState, useEffect } from "react";
import socket from "../socket"; // Your shared socket instance

export default function Whiteboard({ roomId, username }) {
  // -----------------------
  // Refs for canvas & context
  // -----------------------
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // -----------------------
  // State variables
  // -----------------------
  const [isDrawing, setIsDrawing] = useState(false); // Tracks if mouse is pressed
  const [color, setColor] = useState("#ffffff"); // Brush color
  const [brushSize, setBrushSize] = useState(3); // Brush width
  const [strokes, setStrokes] = useState([]); // Array of strokes; each stroke is array of points
  const [redoStack, setRedoStack] = useState([]); // Store undone strokes for redo

  // -----------------------
  // Initialize canvas
  // -----------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth; // Match canvas size to container
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round"; // Smooth line endings
    ctx.lineJoin = "round"; // Smooth line joins
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx;
  }, []);

  // -----------------------
  // Update brush color & size dynamically
  // -----------------------
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  // -----------------------
  // Socket listeners for multi-user synchronization
  // -----------------------
  useEffect(() => {
    if (!roomId) return;

    // Receive strokes from other users
    socket.on("whiteboard:draw", (stroke) => {
      // stroke is an array of points
      setStrokes((prev) => {
        const updated = [...prev, stroke];
        redrawAll(updated);
        return updated;
      });
    });

    // Receive undo from other users
    socket.on("whiteboard:undo", (updatedStrokes) => {
      setStrokes(updatedStrokes);
      redrawAll(updatedStrokes);
    });

    // Receive redo from other users
    socket.on("whiteboard:redo", (updatedStrokes) => {
      setStrokes(updatedStrokes);
      redrawAll(updatedStrokes);
    });

    // Receive clear action from other users
    socket.on("whiteboard:clear", () => {
      setStrokes([]);
      setRedoStack([]);
      clearCanvasLocal();
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("whiteboard:draw");
      socket.off("whiteboard:undo");
      socket.off("whiteboard:redo");
      socket.off("whiteboard:clear");
    };
  }, [roomId]);

  // -----------------------
  // Start drawing
  // -----------------------
  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);

    // Start a new stroke
    setStrokes((prev) => [
      ...prev,
      [{ x: offsetX, y: offsetY, color, brushSize }],
    ]);
  };

  // -----------------------
  // Draw on canvas
  // -----------------------
  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();

    // Add points to current stroke
    setStrokes((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].push({ x: offsetX, y: offsetY, color, brushSize });
      return updated;
    });
  };

  // -----------------------
  // Stop drawing
  // -----------------------
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    ctxRef.current.closePath();

    // Emit the stroke to other users
    const newStroke = strokes[strokes.length - 1];
    if (newStroke) {
      socket.emit("whiteboard:draw", newStroke); // emit only the array of points
    }

    setRedoStack([]); // Clear redo stack on new stroke
  };

  // -----------------------
  // Redraw all strokes
  // -----------------------
  const redrawAll = (allStrokes) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    allStrokes.forEach((stroke) => {
      ctx.beginPath();
      stroke.forEach((point, idx) => {
        ctx.strokeStyle = point.color;
        ctx.lineWidth = point.brushSize;
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.closePath();
    });
  };

  // -----------------------
  // Undo
  // -----------------------
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = [...strokes];
    const undone = newStrokes.pop(); // remove last stroke
    setRedoStack((prev) => [...prev, undone]);
    setStrokes(newStrokes);
    redrawAll(newStrokes);

    // Emit undo to others
    socket.emit("whiteboard:undo", newStrokes);
  };

  // -----------------------
  // Redo
  // -----------------------
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const redoItem = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const updatedStrokes = [...strokes, redoItem];
    setStrokes(updatedStrokes);
    setRedoStack(newRedo);
    redrawAll(updatedStrokes);

    // Emit redo to others
    socket.emit("whiteboard:redo", updatedStrokes);
  };

  // -----------------------
  // Clear canvas
  // -----------------------
  const clearCanvasLocal = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
    clearCanvasLocal();
    socket.emit("whiteboard:clear", { roomId }); // Notify others
  };

  // -----------------------
  // JSX Render
  // -----------------------
  return (
    <div className="w-full h-full bg-gray-900 rounded-xl shadow-lg flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 bg-gray-800 text-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <label>Brush:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <button
            onClick={handleUndo}
            className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700"
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleRedo}
            className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
            title="Redo"
          >
            ↪ Redo
          </button>
          <button
            onClick={handleClear}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            title="Clear All"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 bg-black cursor-crosshair rounded-b-xl"
      />
    </div>
  );
}
