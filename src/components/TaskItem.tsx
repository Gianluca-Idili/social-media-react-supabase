import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { GiftIcon, SkullIcon, TrashIcon } from "../svgs/Svgs";


// ===================== COMPONENTE PRINCIPALE =====================
type Task = {
  id: number;
  label: string;
  value: string;
};

type RewardPunishment = {
  type: 'reward' | 'punishment';
  text: string;
};

export const TaskItem = () => {
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, label: 'Task 1', value: '' }]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [rewards, setRewards] = useState<RewardPunishment[]>([
    { type: 'reward', text: '' },
    { type: 'punishment', text: '' }
  ]);

  // Aggiungi nuova task
  const addTask = () => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    setTasks([...tasks, { id: newId, label: `Task ${newId}`, value: '' }]);
  };

  // Rimuovi l'ultima task
  const removeLastTask = () => {
    if (tasks.length > 1) {
      setTasks(tasks.slice(0, -1));
    }
  };

  // Modifica testo task
  const handleTaskChange = (id: number, value: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, value } : task
    ));
  };

  // Modifica premi/punizioni
  const handleRewardChange = (index: number, text: string) => {
    const newRewards = [...rewards];
    newRewards[index].text = text;
    setRewards(newRewards);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-xl">
      {/* Selezione tipo lista */}
      <div className="mb-6">
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
        >
          <option value="">Seleziona tipo lista</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Lista Task */}
      <div className="space-y-4 mb-6">
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
              <label className="block text-sm font-medium text-pink-300">
                {task.label}
              </label>
              <input
                type="text"
                value={task.value}
                onChange={(e) => handleTaskChange(task.id, e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder={`Scrivi ${task.label.toLowerCase()}`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Premi e Punizioni */}
      <div className="space-y-4 mb-6">
        {rewards.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border ${item.type === 'reward' 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-red-900/20 border-red-700'}`}
          >
            <div className="flex items-center mb-2">
              {item.type === 'reward' ? (
                <GiftIcon className="w-5 h-5 mr-2 text-green-400" />
              ) : (
                <SkullIcon className="w-5 h-5 mr-2 text-red-400" />
              )}
              <span className="font-medium text-white">
                {item.type === 'reward' ? 'Premio' : 'Punizione'}
              </span>
            </div>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleRewardChange(index, e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-1 text-white"
              placeholder={item.type === 'reward' ? 'Es: Pizza stasera!' : 'Es: Niente social!'}
            />
          </motion.div>
        ))}
      </div>

      {/* Pulsanti Azione */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={addTask}
          className="flex items-center justify-center w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-200"
        >
          <span className="mr-2">+</span> Aggiungi Task
        </button>

        <div className="flex space-x-3">
          <button
            onClick={removeLastTask}
            disabled={tasks.length <= 1}
            className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-800 border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Rimuovi Ultima
          </button>

          <button className="flex-1 py-2 px-4 bg-pink-700 hover:bg-pink-600 text-white rounded-lg transition-all">
            Salva Lista
          </button>
        </div>
      </div>
    </div>
  );
};