import { useEffect, useState } from "react";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../context/AuthContext";
import { CheckIcon, EyeIcon, SparklesIcon, TrophyIcon, UserIcon } from "../../svgs/Svgs";

type LeaderboardUser = {
  id: string;
  username: string;
  points: number;
  completed_lists: number;
  public_lists: number;
  position: number;
};

type ProfileWithLists = {
  id: string;
  username: string;
  points: number;
  lists: {
    is_completed: boolean;
    is_public: boolean;
  }[];
};

export const LeaderboardList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            username,
            points,
            lists (
              is_completed,
              is_public
            )
          `
          )
          .order("points", { ascending: false })
          .limit(50);

        if (supabaseError) throw supabaseError;

        const rankedUsers = (data as ProfileWithLists[]).map((profile, index) => {
          const completedListsCount = profile.lists?.filter((list) => list.is_completed).length || 0;
          const publicListsCount = profile.lists?.filter((list) => list.is_public).length || 0;

          return {
            id: profile.id,
            username: profile.username,
            points: profile.points || 0,
            completed_lists: completedListsCount,
            public_lists: publicListsCount,
            position: index + 1,
          };
        });

        setUsers(rankedUsers);
      } catch (err) {
        setError("Errore nel caricamento della classifica");
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-xl">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center mb-4">
          <TrophyIcon className="h-6 w-6 mr-2 text-yellow-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-pink-300">Classifica Utenti</h2>
        </div>
        
        {/* Mobile indicators */}
        <div className="flex justify-between text-xs sm:hidden text-gray-400">
          <span>Posizione</span>
          <span>Utente</span>
          <span>Punti</span>
        </div>
      </div>

      {/* Mobile List */}
      <div className="sm:hidden space-y-3">
        {users.map((player) => (
          <div
            key={player.id}
            className={`flex justify-between items-center p-3 rounded-lg border ${
              user?.id === player.id
                ? "bg-gradient-to-r from-purple-900/10 to-pink-900/10 border-purple-500"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              player.position === 1
                ? "bg-yellow-500/20 text-yellow-400"
                : player.position === 2
                ? "bg-gray-400/20 text-gray-300"
                : player.position === 3
                ? "bg-amber-700/20 text-amber-400"
                : "bg-gray-700/30 text-gray-400"
            } font-bold`}>
              {player.position}
            </div>

            <div className="flex items-center flex-1 px-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700/50 mr-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
              </div>
              <span className={user?.id === player.id ? "text-purple-300 font-medium truncate max-w-[100px]" : "truncate max-w-[100px]"}>
                {player.username}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-pink-300 font-medium mr-1">{player.points}</span>
              <SparklesIcon className="h-3 w-3 text-yellow-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden sm:block">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-400 space-x-4">
            <div className="flex items-center">
              <SparklesIcon className="h-4 w-4 mr-1 text-yellow-400" />
              <span>Punti</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-1 text-green-400" />
              <span>Completate</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1 text-blue-400" />
              <span>Pubbliche</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pl-2 w-12">#</th>
                <th className="pb-3">Utente</th>
                <th className="pb-3 text-right pr-4">
                  <SparklesIcon className="h-4 w-4 inline mr-1 text-yellow-400" />
                  Punti
                </th>
                <th className="pb-3 text-right pr-4">
                  <CheckIcon className="h-4 w-4 inline mr-1 text-green-400" />
                  Completate
                </th>
                <th className="pb-3 text-right">
                  <EyeIcon className="h-4 w-4 inline mr-1 text-blue-400" />
                  Pubbliche
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((player) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-800/50 ${
                    user?.id === player.id
                      ? "bg-gradient-to-r from-purple-900/10 to-pink-900/10"
                      : "hover:bg-gray-800/30"
                  }`}
                >
                  <td className="py-4 pl-2">
                    <span
                      className={`flex items-center justify-center h-8 w-8 rounded-full ${
                        player.position === 1
                          ? "bg-yellow-500/20 text-yellow-400"
                          : player.position === 2
                          ? "bg-gray-400/20 text-gray-300"
                          : player.position === 3
                          ? "bg-amber-700/20 text-amber-400"
                          : "bg-gray-700/30 text-gray-400"
                      } font-bold`}
                    >
                      {player.position}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-700/50 mr-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <span
                        className={
                          user?.id === player.id ? "text-purple-300 font-medium" : ""
                        }
                      >
                        {player.username}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right pr-4 text-pink-300 font-medium">
                    {player.points}
                  </td>
                  <td className="py-4 text-right pr-4 text-green-300">
                    {player.completed_lists}
                  </td>
                  <td className="py-4 text-right text-blue-300">
                    {player.public_lists}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {user && !users.some((u) => u.id === user.id) && (
        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
          <p className="text-gray-400">
            Completa liste per entrare in classifica!
          </p>
        </div>
      )}
    </div>
  );
};