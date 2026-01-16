import { useEffect, useState } from "react";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../context/AuthContext";
import { 
  CheckIcon, 
  SparklesIcon, 
  TrophyIcon, 
  RealIcon, 
  FakeIcon, 
  XIcon 
} from "../../svgs/Svgs";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

type SortOption = 'points' | 'real' | 'fake' | 'completed' | 'failed';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  points: number;
  real_votes: number;
  fake_votes: number;
  completed_lists: number;
  failed_lists: number;
  total_lists: number;
  position: number;
}

export const LeaderboardList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('points');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data, error: rpcError } = await supabase.rpc('get_leaderboard_v2', {
          sort_by: sortBy,
          limit_val: 50
        });

        if (rpcError) throw rpcError;

        const rankedUsers = (data || []).map((u: any, index: number) => ({
          ...u,
          position: index + 1,
        }));

        setUsers(rankedUsers);
      } catch (err) {
        setError("Errore nel caricamento della classifica");
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'points', label: 'Punti', icon: <SparklesIcon className="w-4 h-4" />, color: 'purple' },
    { id: 'real', label: 'Real', icon: <RealIcon className="w-4 h-4" />, color: 'green' },
    { id: 'fake', label: 'Fake', icon: <FakeIcon className="w-4 h-4" />, color: 'pink' },
    { id: 'completed', label: 'Fatti', icon: <CheckIcon className="w-4 h-4" />, color: 'emerald' },
    { id: 'failed', label: 'Falliti', icon: <XIcon className="w-4 h-4" />, color: 'red' },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Intro & Sorting Selector */}
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
            <TrophyIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Classifica Globale</h2>
            <p className="text-sm text-gray-400">Dimostra chi è il vero King di Task.level</p>
          </div>
        </div>

        {/* Horizontal Scrollable Filters */}
        <div className="w-full flex overflow-x-auto pb-2 scrollbar-none gap-2 px-4 justify-start md:justify-center">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border whitespace-nowrap transition-all duration-300 ${
                sortBy === opt.id
                  ? `bg-gradient-to-r from-purple-600 to-pink-600 border-white/20 text-white shadow-lg shadow-purple-500/20 scale-105`
                  : `bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700`
              }`}
            >
              {opt.icon}
              <span className="text-sm font-bold uppercase tracking-wider">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl text-center">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          <AnimatePresence mode="popLayout">
            {users.map((player) => (
              <motion.div
                layout
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative group ${
                  user?.id === player.id ? "z-10" : ""
                }`}
              >
                <Link
                  to={`/detail/profile/${player.id}`}
                  className={`flex items-center p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                    user?.id === player.id
                      ? "bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/20"
                      : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Position Badge */}
                  <div className={`flex-shrink-0 w-10 text-center font-black italic text-xl ${
                    player.position === 1 ? "text-yellow-400 text-2xl" :
                    player.position === 2 ? "text-gray-300" :
                    player.position === 3 ? "text-amber-600" : "text-gray-600"
                  }`}>
                    {player.position}
                  </div>

                  {/* Avatar */}
                  <div className="relative ml-2">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full p-0.5 bg-gradient-to-br ${
                      player.position === 1 ? "from-yellow-400 to-orange-500" :
                      player.position === 2 ? "from-gray-300 to-gray-500" :
                      player.position === 3 ? "from-amber-600 to-amber-800" :
                      "from-purple-500 to-pink-500"
                    }`}>
                      <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center overflow-hidden">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt={player.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold">{player.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="ml-4 flex-grow min-w-0">
                    <h3 className={`font-bold truncate text-lg ${
                      user?.id === player.id ? "text-purple-300" : "text-white"
                    }`}>
                      {player.username}
                      {user?.id === player.id && <span className="ml-2 text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full align-middle font-black uppercase">Tu</span>}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 overflow-x-auto scrollbar-none pb-0.5">
                      <StatMini label="Punti" value={player.points} icon={<SparklesIcon className="w-3 h-3" />} color="text-purple-400" />
                      <StatMini label="Real" value={player.real_votes} icon={<RealIcon className="w-3 h-3" />} color="text-green-400" />
                      <StatMini label="Fake" value={player.fake_votes} icon={<FakeIcon className="w-3 h-3" />} color="text-pink-400" />
                      <StatMini label="Fatti" value={player.completed_lists} icon={<CheckIcon className="w-3 h-3" />} color="text-emerald-400" />
                    </div>
                  </div>

                  {/* Primary Metric Display (for the active sort) */}
                  <div className="ml-4 text-right hidden sm:block">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{sortBy}</p>
                    <p className={`text-2xl font-black ${
                       sortBy === 'real' ? 'text-green-400' :
                       sortBy === 'fake' ? 'text-pink-400' :
                       sortBy === 'completed' ? 'text-emerald-400' :
                       sortBy === 'failed' ? 'text-red-400' : 'text-purple-400'
                    }`}>
                      {(player as any)[sortBy === 'points' ? 'points' : 
                                      sortBy === 'real' ? 'real_votes' : 
                                      sortBy === 'fake' ? 'fake_votes' : 
                                      sortBy === 'completed' ? 'completed_lists' : 'failed_lists']}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-4 py-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">Aggiornato in tempo reale • Top 50 Utenti</p>
        <div className="flex gap-4">
           {!users.some(u => u.id === user?.id) && user && (
             <div className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-400 animate-pulse">
               Non sei ancora in classifica? Completa una sfida! 🚀
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="flex items-center gap-1 whitespace-nowrap">
    <span className={color}>{icon}</span>
    <span className="text-[11px] text-gray-400 font-medium">{label}:</span>
    <span className="text-[11px] text-gray-200 font-bold">{value}</span>
  </div>
);
