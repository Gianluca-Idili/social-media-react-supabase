import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";


type Task = {
  id: number;
  label: string;
  value: string;
};

export const TaskItem = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, label: 'Task 1', value: '' }
  ]);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const addTask = () => {
    const newId = tasks.length + 1;
    setTasks([...tasks, { id: newId, label: `Task ${newId}`, value: '' }]);
  };

  const removeLastTask = () => {
    if (tasks.length > 1) {
      setTasks(tasks.slice(0, -1));
    }
  };

  const handleTaskChange = (id: number, value: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, value } : task
    ));
  };

  return (
    <div className="max-w-xlg mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">
      {/* Select Input */}
      <div className="mb-8">
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-500"
        >
          <option value="" className="bg-gray-900">Seleziona un'opzione</option>
          <option value="option1" className="bg-gray-900">Opzione 1</option>
          <option value="option2" className="bg-gray-900">Opzione 2</option>
          <option value="option3" className="bg-gray-900">Opzione 3</option>
        </select>
      </div>

      {/* Task Inputs */}
      <div className="space-y-6 mb-8">
      <AnimatePresence>
    {tasks.map((task) => (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
          {task.label}
        </label>
        <input
          type="text"
          value={task.value}
          onChange={(e) => handleTaskChange(task.id, e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-600"
          placeholder={`Inserisci ${task.label.toLowerCase()}`}
        />
      </motion.div>
    ))}
  </AnimatePresence>
      </div>

      {/* Add Task Button */}
      <button
        onClick={addTask}
        className="flex items-center justify-center w-full mb-6 px-4 py-3 bg-gradient-to-r from-purple-900 to-pink-800 text-white rounded-lg hover:from-purple-800 hover:to-pink-700 transition-all duration-300 shadow-lg"
      >
        <span className="mr-2 text-xl">+</span> 
        <span className="bg-gradient-to-r from-pink-200 to-purple-300 bg-clip-text text-transparent font-medium">
          ADD TASKS
        </span>
      </button>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-md font-medium">
          Crea
        </button>
        <button
          onClick={removeLastTask}
          disabled={tasks.length <= 1}
          className="flex items-center justify-center flex-1 px-4 py-3 bg-gray-900 text-gray-300 border border-pink-900 rounded-lg hover:bg-gray-800 hover:text-pink-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        >
          <TrashIcon />
          <span className="ml-2 font-medium">Cancella l'ultima</span>
        </button>
      </div>
    </div>
  );
};

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-pink-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);