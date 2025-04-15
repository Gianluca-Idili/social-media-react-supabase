import { motion } from "framer-motion";
import { Task } from "../../types/listTypes";

type TaskInputProps = {
  task: Task;
  onChange: (id: string, value: string) => void;
};

export const TaskInput = ({ task, onChange }: TaskInputProps) => (
  <motion.div
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
      onChange={(e) => onChange(task.id, e.target.value)}
      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
      placeholder={`Scrivi ${task.label.toLowerCase()}`}
    />
  </motion.div>
);