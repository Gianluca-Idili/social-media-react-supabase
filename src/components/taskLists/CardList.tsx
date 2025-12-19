import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import {
  CalendarIcon,
  ClockIcon,
  GiftIcon,
  WarningIcon,
  CheckIcon,
} from "../../svgs/Svgs";
import { CountdownTimer } from "./CountdownTimer";
import { notifyUser } from "../../utils/notifications";

interface Task {
  id: string;
  list_id: string;
  description: string;
  is_completed: boolean;
  created_at?: string;
}

interface ListWithTasks {
  id: string;
  user_id: string;
  title: string;
  type: string;
  is_public: boolean;
  is_completed: boolean;
  reward?: string | null;
  punishment?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  tasks: Task[];
}

interface ListCardProps {
  list: ListWithTasks;
}

export function CardList({ list }: ListCardProps) {
  const queryClient = useQueryClient();

  const handleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_completed: isCompleted })
        .eq("id", taskId);

      if (taskError) throw taskError;

      const updatedTasks = list.tasks.map((t) =>
        t.id === taskId ? { ...t, is_completed: isCompleted } : t
      );
      

      const allCompleted = updatedTasks.every((t) => t.is_completed);
      const updates = {
        is_completed: allCompleted,
        completed_at: allCompleted ? new Date().toISOString() : null,
      };
        
      const { error: listError } = await supabase
        .from("lists")
        .update(updates)
        .eq("id", list.id);

      if (listError) throw listError;

      // Send notification when list is completed
      if (allCompleted && !list.is_completed) {
        await notifyUser.completed(list.user_id, list.title);
      }

      await queryClient.invalidateQueries({
        queryKey: ["userLists", list.user_id],
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800 mb-6">
      {/* Header con titolo e tipo */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            {list.title}
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                list.type === "daily"
                  ? "bg-blue-900 text-blue-300"
                  : list.type === "weekly"
                  ? "bg-purple-900 text-purple-300"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {list.type}
            </span>
            {list.is_public ? (
              <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">
                Pubblico
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-yellow-900 text-green-300 rounded-full">
                Privato
              </span>
            )}
          </div>
        </div>

        {/* Data completamento se esiste */}
        {list.completed_at ? (
          <span className="text-xs px-2 py-1 bg-green-800 text-green-200 rounded-full">
            Completata
          </span>
        ) : (
          <span className="text-xs px-2 py-1 bg-red-800 text-green-200 rounded-full">
            Da Completare
          </span>
        )}
      </div>

      {/* Metadati lista */}
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        {/* Data creazione */}
        <div className="space-y-1">
          <p className="text-gray-500 flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Creazione:</span>
          </p>
          <p>{new Date(list.created_at).toLocaleDateString("it-IT")}</p>
        </div>

        {/* Data scadenza */}
        <div className="space-y-1">
          <p className="text-gray-500 flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>Scadenza:</span>
          </p>
          <p className={list.expires_at ? "text-pink-300" : "text-gray-400"}>
            {list.expires_at ? (
              <CountdownTimer targetDate={list.expires_at} />
            ) : (
              "Nessuna"
            )}
          </p>
        </div>

        {/* Premio e Punizione affiancati */}
        {(list.reward || list.punishment) && (
          <>
            {list.reward && (
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1">
                  <GiftIcon className="w-4 h-4" />
                  <span>Ricompensa:</span>
                </p>
                <p className="text-green-400">{list.reward}</p>
              </div>
            )}

            {list.punishment && (
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1">
                  <WarningIcon className="w-4 h-4" />
                  <span>Conseguenze:</span>
                </p>
                <p className="text-red-400">{list.punishment}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lista Task */}
      <div className="space-y-3">
        {list.tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start p-3 rounded-lg border ${
              task.is_completed
                ? "border-green-900 bg-gray-800"
                : "border-gray-700 bg-gray-800"
            } cursor-pointer transition-colors hover:bg-gray-750`}
            onClick={() => handleTaskComplete(task.id, !task.is_completed)}
          >
            <div
              className={`mt-0.5 mr-3 p-1 rounded-full ${
                task.is_completed
                  ? "bg-green-500 text-white"
                  : "border border-gray-500"
              }`}
            >
              <CheckIcon className="w-3 h-3" />
            </div>
            <div className="flex-1">
              <span
                className={`block ${
                  task.is_completed
                    ? "text-gray-400 line-through"
                    : "text-white"
                }`}
              >
                {task.description}
              </span>
              {task.created_at && (
                <span className="text-xs text-gray-500 mt-1 block">
                  Aggiunto:{" "}
                  {new Date(task.created_at).toLocaleDateString("it-IT")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
