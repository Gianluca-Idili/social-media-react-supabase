import { useEffect } from "react";
import { supabase } from "../../supabase-client";
import { EyeIcon } from "../../svgs/Svgs";

interface Profile {
  username: string;
}

interface Task {
  description: string;
  is_completed: boolean;
}

interface PublicListCardProps {
  list: {
    id: string;
    title: string;
    type: string;
    reward?: string | null;
    punishment?: string | null;
    completed_at: string | null;
    is_completed: boolean;
    view_count: number;
    user_id: string;
    profiles: Profile | Profile[]; // Ora più preciso
    tasks: Task[];
  };
  userId?: string;
}

export const PublicListCard = ({ list, userId }: PublicListCardProps) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        if (!userId) return;

        // 1. Controlla se è una nuova visualizzazione
        const { count, error: countError } = await supabase
          .from("views")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id)
          .eq("user_id", userId);

        if (countError) {
          throw new Error(`Count error: ${countError.message}`);
        }

        // 2. Se non trovato, registra la visualizzazione
        if (count === 0) {
          const { error: insertError } = await supabase.from("views").insert([
            {
              list_id: list.id,
              user_id: userId,
            },
          ]);

          if (insertError) {
            throw new Error(`Insert error: ${insertError.message}`);
          }

          // 3. Aggiorna il contatore
          const { error: updateError } = await supabase
            .from("lists")
            .update({ view_count: (list.view_count || 0) + 1 })
            .eq("id", list.id);

          if (updateError) {
            throw new Error(`Update error: ${updateError.message}`);
          }
        }
      } catch (error) {
        console.error("Error tracking view:", error);
        // Qui potresti aggiungere un toast o altro sistema di notifica errori
      }
    };

    trackView();
  }, [list.id, userId, list.view_count]);

  // Gestione valori null/undefined
  const reward = list.reward ?? undefined;
  const punishment = list.punishment ?? undefined;

  // 1. Gestione sicura del profilo
  // Normalizza i profili (converte oggetto in array se necessario)
  const profilesArray = Array.isArray(list.profiles)
    ? list.profiles
    : [list.profiles || { username: "Utente Anonimo" }];

  const profile = profilesArray[0];
  const tasks = list.tasks || [];
  const completedTasks = tasks.filter((task) => task.is_completed).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
      {/* Header con avatar e username */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-700/50 to-purple-500/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-200 truncate hover:text-clip">
            {profile.username}
          </p>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-1 truncate">
            {list.title}
          </h3>
          <p className="text-sm text-purple-400 capitalize inline-flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            {list.type}
          </p>
        </div>

        {/* Progress bar migliorata */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Progresso</span>
            <span className="font-mono">{completionPercentage}%</span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-700">
              <div
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sezione Reward/Punishment */}
        <div className="grid grid-cols-2 gap-3">
          {list.is_completed && reward && (
            <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-3 rounded-lg border border-purple-500/20">
              <p className="text-xs text-gray-400 mb-1">Ricompensa</p>
              <p className="text-purple-300 font-medium flex items-center">
                <span className="mr-2">🎁</span>
                <span className="truncate">{reward}</span>
              </p>
            </div>
          )}

          {!list.is_completed && punishment && (
            <div className="bg-gradient-to-r from-pink-500/10 to-transparent p-3 rounded-lg border border-pink-500/20">
              <p className="text-xs text-gray-400 mb-1">Punizione</p>
              <p className="text-pink-300 font-medium flex items-center">
                <span className="mr-2">💢</span>
                <span className="truncate">{punishment}</span>
              </p>
            </div>
          )}
        </div>

        {/* Tasks preview con animazione */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Tasks completati
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {tasks.slice(0, 4).map((task, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <span
                  className={`flex-shrink-0 inline-block w-4 h-4 rounded-full transition-all ${
                    task.is_completed
                      ? "bg-green-500 group-hover:bg-green-400"
                      : "bg-gray-600 group-hover:bg-gray-500"
                  }`}
                />
                <p
                  className={`text-sm transition-colors ${
                    task.is_completed
                      ? "text-gray-400 line-through"
                      : "text-gray-300 group-hover:text-gray-200"
                  }`}
                >
                  {task.description}
                </p>
              </div>
            ))}
          </div>
          {tasks.length > 4 && (
            <p className="text-xs text-gray-500 mt-1">
              +{tasks.length - 4} altri task...
            </p>
          )}
        </div>
      </div>

      {/* Footer con pulsante animato */}
      <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <EyeIcon className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium tabular-nums">
            {list.view_count ?? 0}
          </span>
        </div>
        <span className="text-xs text-gray-500">{tasks.length} task</span>
      </div>
    </div>
  );
};
