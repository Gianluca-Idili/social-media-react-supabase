import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { ListItem } from "./ListItem";
import { GiftIcon, SkullIcon, TrashIcon } from "../../svgs/Svgs";
import { toast } from "react-toastify";

type Task = {
  id: string;
  label: string;
  value: string;
};

type RewardPunishment = {
  type: "reward" | "punishment";
  text: string;
};

type ListType = "daily" | "weekly" | "monthly";
type ListTypeWithEmpty = ListType | "";

const getInitialTasks = (listType: ListTypeWithEmpty): Task[] => {
  switch(listType) {
    case "daily":
      return [
        { id: uuidv4(), label: "Task 1", value: "" },
        { id: uuidv4(), label: "Task 2", value: "" },
        { id: uuidv4(), label: "Task 3", value: "" },
        { id: uuidv4(), label: "Task 4", value: "" }
      ];
    case "weekly":
      return [
        { id: uuidv4(), label: "Task 1", value: "" },
        { id: uuidv4(), label: "Task 2", value: "" },
        { id: uuidv4(), label: "Task 3", value: "" },
        { id: uuidv4(), label: "Task 4", value: "" },
        { id: uuidv4(), label: "Task 5", value: "" },
        { id: uuidv4(), label: "Task 6", value: "" },
        { id: uuidv4(), label: "Task 7", value: "" }
      ];
    case "monthly":
      return [
        { id: uuidv4(), label: "Task 1", value: "" },
        { id: uuidv4(), label: "Task 2", value: "" },
        { id: uuidv4(), label: "Task 3", value: "" },
        { id: uuidv4(), label: "Task 4", value: "" },
        { id: uuidv4(), label: "Task 5", value: "" },
        { id: uuidv4(), label: "Task 6", value: "" },
        { id: uuidv4(), label: "Task 7", value: "" },
        { id: uuidv4(), label: "Task 8", value: "" },
        { id: uuidv4(), label: "Task 9", value: "" },
        { id: uuidv4(), label: "Task 10", value: "" }
      ];
    default:
      return [{ id: uuidv4(), label: "Task 1", value: "" }];
  }
};

export const TaskItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [tasks, setTasks] = useState<Task[]>([
    { id: uuidv4(), label: "Task 1", value: "" },
  ]);
  const [selectedOption, setSelectedOption] = useState<ListTypeWithEmpty>("");
  const [rewards, setRewards] = useState<RewardPunishment[]>([
    { type: "reward", text: "" },
    { type: "punishment", text: "" },
  ]);

  useEffect(() => {
    setTasks(getInitialTasks(selectedOption));
  }, [selectedOption]);
  
  const addTask = () => {
    const newTask = {
      id: uuidv4(),
      label: `Task ${tasks.length + 1}`,
      value: "",
    };
    setTasks([...tasks, newTask]);
  };

  const removeLastTask = () => {
    if (tasks.length > 1) {
      setTasks(tasks.slice(0, -1));
    }
  };

  const handleTaskChange = (id: string, value: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, value } : task)));
  };

  const handleRewardChange = (index: number, text: string) => {
    const newRewards = [...rewards];
    newRewards[index].text = text;
    setRewards(newRewards);
  };

  const handleCreateListItem = async () => {
    if (!user) return alert("Devi essere loggato");
    if (selectedOption === "") return alert("Seleziona un tipo di lista");

    
    const now = new Date();
    const expiresAt = new Date(now);

    
    const ITALY_UTC_OFFSET = 2 * 60 * 60 * 1000; 
    const THREE_HOURS = 3 * 60 * 60 * 1000;

   
  const setItalianMidnight = (date: Date) => {
    date.setUTCHours(22, 0, 0, 0); 
    return date;
  };

    
    switch (selectedOption) {
    case "daily": {
      setItalianMidnight(expiresAt);
      
      
      if ((expiresAt.getTime() - now.getTime() + ITALY_UTC_OFFSET) < THREE_HOURS) {
        expiresAt.setUTCDate(expiresAt.getUTCDate() + 1);
      }
      break;
    }

    case "weekly": {
      setItalianMidnight(expiresAt);
      expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
      
      
      if ((expiresAt.getTime() - now.getTime() + ITALY_UTC_OFFSET) < THREE_HOURS) {
        expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
      }
      break;
    }

    case "monthly": {
      
      const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      const endOfMonth = new Date(nextMonth.getTime() - 1);
      setItalianMidnight(endOfMonth);
      
      
      if ((endOfMonth.getTime() - now.getTime() + ITALY_UTC_OFFSET) < THREE_HOURS) {
        const nextEndOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
        setItalianMidnight(nextEndOfMonth);
        expiresAt.setTime(nextEndOfMonth.getTime());
      } else {
        expiresAt.setTime(endOfMonth.getTime());
      }
      break;
    }
  }

    const res = await ListItem(
      user.id,
      selectedOption,
      tasks,
      rewards,
      expiresAt.toISOString()
    );

    if (res.success) {
      resetForm();
      navigate(`/profile/${user.id}`, {
        state: { showToast: true}
      });
    } else {
      toast.error(`Errore: ${res.message}`);
    }
  };

  const resetForm = () => {
    setSelectedOption("");
    setTasks([{ id: uuidv4(), label: "Task 1", value: "" }]);
    setRewards([
      { type: "reward", text: "" },
      { type: "punishment", text: "" },
    ]);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-xl">
      {/* Selezione tipo lista */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <label className="block text-md font-medium text-pink-300 mb-1">
              Tipo lista:
            </label>
            <select
              value={selectedOption}
              onChange={(e) =>
                setSelectedOption(e.target.value as ListTypeWithEmpty)
              }
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-pink-300"
            >
              <option value="">Seleziona tipo</option>
              <option value="daily">Giornaliera</option>
              <option value="weekly">Settimanale</option>
              <option value="monthly">Mensile</option>
            </select>
          </div>
        </div>
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
              <label className="block text-md font-medium text-pink-300">
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
            className={`p-4 rounded-lg border ${
              item.type === "reward"
                ? "bg-green-900/20 border-green-700"
                : "bg-red-900/20 border-red-700"
            }`}
          >
            <div className="flex items-center mb-2">
              {item.type === "reward" ? (
                <GiftIcon className="w-5 h-5 mr-2 text-green-400" />
              ) : (
                <SkullIcon className="w-5 h-5 mr-2 text-red-400" />
              )}
              <span className="font-medium text-pink-300">
                {item.type === "reward" ? "Premio" : "Punizione"}
              </span>
            </div>
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleRewardChange(index, e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-1 text-white"
              placeholder={
                item.type === "reward"
                  ? "Es: Pizza stasera!"
                  : "Es: Niente social!"
              }
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

          <button
            onClick={handleCreateListItem}
            className="flex-1 py-2 px-4 bg-pink-700 hover:bg-pink-600 text-white rounded-lg transition-all"
          >
            Salva Lista
          </button>
        </div>
      </div>
    </div>
  );
};
