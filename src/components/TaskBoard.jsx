// src/components/TaskBoard.jsx
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import socket from "../socket"; // shared socket instance

export default function TaskBoard({ roomId, username }) {
  // ---- State ----
  const [tasks, setTasks] = useState({
    todo: [{ id: "1", text: "Setup project environment" }],
    inprogress: [],
    done: [],
  });

  const [newTask, setNewTask] = useState("");

  // ---- SOCKET: Synchronize tasks ----
  useEffect(() => {
    if (!roomId) return;

    socket.emit("tasks:get", { roomId });

    socket.on("tasks:update", (updatedTasks) => {
      if (updatedTasks) setTasks(updatedTasks);
    });

    return () => {
      socket.off("tasks:update");
    };
  }, [roomId]);

  // ---- Emit updated tasks to server ----
  const broadcastTasks = (updatedTasks) => {
    if (!roomId) return;
    socket.emit("tasks:update", { roomId, tasks: updatedTasks, username });
  };

  // ---- Add a new task ----
  const handleAddTask = () => {
    if (!newTask.trim()) return;

    setTasks((prev) => {
      const exists = prev.todo.some((t) => t.text === newTask.trim());
      if (exists) return prev;

      const newTaskObj = {
        id: Date.now().toString(),
        text: newTask.trim(),
        done: false,
        status: "In Progress",
      };
      const updated = { ...prev, todo: [...prev.todo, newTaskObj] };
      broadcastTasks(updated);
      return updated;
    });
    setNewTask("");
  };

  // ---- Delete a task ----
  const handleDelete = (id, column) => {
    setTasks((prev) => {
      const updated = { ...prev, [column]: prev[column].filter((t) => t.id !== id) };
      broadcastTasks(updated);
      return updated;
    });
  };

  // ---- Toggle done/undone ----
  const toggleDone = (id, column) => {
    setTasks((prev) => {
      const updated = { ...prev };

      // Find the task in its current column
      const taskIndex = updated[column].findIndex((t) => t.id === id);
      if (taskIndex === -1) return prev;

      const task = updated[column][taskIndex];
      const toggled = { ...task, done: !task.done };

      // Remove from current column
      updated[column].splice(taskIndex, 1);

      // Move to "done" or "inprogress" based on state
      if (toggled.done) {
        toggled.status = "Done ✅";
        updated.done = [...updated.done, toggled];
      } else {
        toggled.status = "In Progress ⏳";
        updated.inprogress = [...updated.inprogress, toggled];
      }

      broadcastTasks(updated);
      return updated;
    });
  };

  // ---- Drag and drop handler ----
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (sourceCol === destCol) {
      const items = Array.from(tasks[sourceCol]);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      const updated = { ...tasks, [sourceCol]: items };
      setTasks(updated);
      broadcastTasks(updated);
    } else {
      const sourceItems = Array.from(tasks[sourceCol]);
      const destItems = Array.from(tasks[destCol]);
      const [moved] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, moved);

      const updated = {
        ...tasks,
        [sourceCol]: sourceItems,
        [destCol]: destItems,
      };
      setTasks(updated);
      broadcastTasks(updated);
    }
  };

  return (
    <div className="bg-blue-900 p-4 rounded-xl shadow-lg text-white h-full">
      {/* Header */}
      <h3 className="text-2xl font-bold mb-4">Task Board</h3>

      {/* Add Task */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-grow p-2 rounded bg-blue-800 border border-blue-600 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddTask}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          + Add
        </button>
      </div>

      {/* Drag and Drop Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
          {Object.entries(tasks).map(([colId, colTasks]) => (
            <Droppable droppableId={colId} key={colId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-blue-800 rounded-lg p-3 min-h-[200px]"
                >
                  <h4 className="text-lg font-semibold mb-2 capitalize">
                    {colId === "todo"
                      ? "To Do"
                      : colId === "inprogress"
                      ? "In Progress"
                      : "Done"}
                  </h4>

                  {colTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-blue-700 p-2 mb-2 rounded flex justify-between items-center"
                        >
                          <div className="flex flex-col">
                            <span
                              className={task.done ? "line-through opacity-70" : ""}
                            >
                              {task.text}
                            </span>
                            <span className="text-xs text-gray-300 italic">
                              {task.status || "In Progress ⏳"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => toggleDone(task.id, colId)}
                              className="accent-green-400"
                            />
                            <button
                              onClick={() => handleDelete(task.id, colId)}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
