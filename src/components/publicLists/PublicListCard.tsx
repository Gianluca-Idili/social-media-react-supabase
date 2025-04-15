import { useEffect } from "react";
import { EyeIcon } from "../../svgs/Svgs";
import { supabase } from "../../supabase-client";
import { LikeButton } from "../posts/LikeButton";

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
    profiles: Profile | Profile[];
    tasks: Task[];
  };
  userId?: string;
}

export const PublicListCard = ({ list, userId }: PublicListCardProps) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        if (!userId) return;

        const { count, error: countError } = await supabase
          .from("views")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id)
          .eq("user_id", userId);

        if (countError) {
          throw new Error(`Count error: ${countError.message}`);
        }

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
      }
    };

    trackView();
  }, [list.id, userId, list.view_count]);

  const reward = list.reward ?? undefined;
  const punishment = list.punishment ?? undefined;

  const profilesArray = Array.isArray(list.profiles)
    ? list.profiles
    : [list.profiles || { username: "Utente Anonimo" }];

  const profile = profilesArray[0];
  const tasks = list.tasks || [];
  const completedTasks = tasks.filter((task) => task.is_completed).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
      <div className="flex flex-col h-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/50 to-purple-500/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-200 truncate">{profile.username}</p>
              <p className="text-xs text-purple-400 capitalize flex items-center mt-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                {list.type}
              </p>
            </div>
          </div>
          
          {/* Mobile-only view count */}
          <div className="sm:hidden flex items-center gap-1.5 text-gray-400">
            <EyeIcon className="w-4 h-4" />
            <span className="font-medium">{list.view_count ?? 0}</span>
          </div>
        </div>
  
        {/* Contenuto principale */}
        <div className="flex-grow p-4 space-y-4">
          <h3 className="text-xl font-bold text-gray-100 mb-1 truncate">{list.title}</h3>
  
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded-md">
                {completionPercentage}%
              </span>
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
  
          {/* Reward/Punishment */}
          {(list.is_completed && reward) || (!list.is_completed && punishment) ? (
            <div className="space-y-2">
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
          ) : null}
  
          {/* Tasks preview */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Tasks ({tasks.length})
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
                      className={`text-sm transition-colors truncate ${
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
          )}
        </div>
  
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <EyeIcon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{list.view_count ?? 0}</span>
            </div>
            <span className="text-gray-500">{tasks.length} task</span>
          </div>
          
          <LikeButton listId={list.id} />
        </div>
      </div>
    );
  };