import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { motion } from "framer-motion";
import { LikeButton } from "../components/publicLists/LikeButton";
import { EyeIcon, ChevronLeftIcon } from "../svgs/Svgs";

interface PublicListDetail {
  id: string;
  title: string;
  type: string;
  reward?: string | null;
  punishment?: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  view_count: number;
  user_id: string;
  profiles: { id: string; username: string; avatar_url?: string };
  tasks: {
    description: string;
    is_completed: boolean;
  }[];
}

const fetchListDetail = async (id: string): Promise<PublicListDetail> => {
  const { data, error } = await supabase
    .from("lists")
    .select(`
      id,
      title,
      type,
      reward,
      punishment,
      completed_at,
      created_at,
      is_completed,
      view_count,
      user_id,
      profiles:user_id(id, username, avatar_url),
      tasks:tasks(description, is_completed)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  
  // Handle profiles array/object consistency
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

  return {
    ...data,
    profiles: profile || { id: data.user_id, username: "Anonimo" },
    tasks: data.tasks || []
  };
};

export const ListDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: list, isLoading, error } = useQuery({
    queryKey: ["listDetail", id],
    queryFn: () => fetchListDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Lista non trovata</h2>
        <Link to="/lists" className="text-purple-400 hover:underline flex items-center gap-2">
          <ChevronLeftIcon className="w-5 h-5" /> Torna alle liste
        </Link>
      </div>
    );
  }

  const completedTasks = list.tasks.filter(t => t.is_completed).length;
  const completionPercentage = list.tasks.length > 0 
    ? Math.round((completedTasks / list.tasks.length) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Back Button */}
      <Link 
        to="/lists" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Torna alle Liste</span>
      </Link>

      {/* Main Content Card */}
      <div className="bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Header Decorator */}
        <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>

        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            {/* Creator Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                {list.profiles.avatar_url ? (
                  <img src={list.profiles.avatar_url} alt={list.profiles.username} className="w-full h-full object-cover" />
                ) : (
                  <span>{list.profiles.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <Link to={`/detail/profile/${list.user_id}`} className="hover:text-purple-400 transition-colors">
                  <h3 className="text-xl font-bold text-gray-100">{list.profiles.username}</h3>
                </Link>
                <p className="text-sm text-gray-400">Creato il {new Date(list.created_at).toLocaleDateString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-xs text-purple-400 uppercase tracking-widest">{list.type}</span>
                </div>
              </div>
            </div>

            {/* View Count & Stats */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-gray-400">
                  <EyeIcon className="w-5 h-5" />
                  <span className="font-bold text-gray-200">{list.view_count}</span>
                </div>
                <span className="text-xs text-gray-500">Visualizzazioni</span>
              </div>
              <div className="h-10 w-[1px] bg-gray-800"></div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-gray-200">{list.tasks.length}</span>
                <span className="text-xs text-gray-500">Task totali</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            {list.title}
          </h1>

          {/* Progress Section */}
          <div className="mb-12 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Stato Avanzamento</p>
                <h4 className="text-2xl font-bold text-purple-400">{completionPercentage}% Completato</h4>
              </div>
              <span className="text-sm text-gray-500 font-mono">
                {completedTasks}/{list.tasks.length} task fatti
              </span>
            </div>
            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              />
            </div>
          </div>

          {/* Reward & Punishment */}
          {(list.reward || list.punishment) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {list.reward && (
                <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">🎁</span>
                  </div>
                  <p className="text-xs text-purple-400 uppercase tracking-widest mb-2">Se vince: Ricompensa</p>
                  <p className="text-xl font-bold text-purple-100">{list.reward}</p>
                </div>
              )}
              {list.punishment && (
                <div className="p-6 rounded-2xl bg-pink-500/5 border border-pink-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">💢</span>
                  </div>
                  <p className="text-xs text-pink-400 uppercase tracking-widest mb-2">Se perde: Punizione</p>
                  <p className="text-xl font-bold text-pink-100">{list.punishment}</p>
                </div>
              )}
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-6 mb-12">
            <h3 className="text-xl font-bold text-gray-200 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm">📋</span>
              Lista dei Task
            </h3>
            <div className="grid gap-4">
              {list.tasks.map((task, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    task.is_completed 
                      ? "bg-gray-800/30 border-green-500/20 opacity-60" 
                      : "bg-gray-800 border-gray-700 shadow-lg"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                    task.is_completed ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}>
                    {task.is_completed && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <p className={`text-lg transition-all ${
                    task.is_completed ? "text-gray-500 line-through" : "text-gray-200"
                  }`}>
                    {task.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Voting Footer */}
          <div className="border-t border-gray-800 pt-10 flex flex-col items-center gap-6">
            <div className="text-center">
              <h4 className="text-lg font-bold text-white mb-2">Questa prova è reale o un fake?</h4>
              <p className="text-sm text-gray-400">Vota per far salire {list.profiles.username} in classifica!</p>
            </div>
            <LikeButton listId={list.id} />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Hai dubbi su questa lista? Segnala alla moderazione.</p>
        <p className="mt-1">© 2026 Task.level - Social Proofing Platform</p>
      </div>
    </motion.div>
  );
};
