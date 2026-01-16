import { useState, useEffect } from "react";
import { supabase } from "../../supabase-client";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "../../svgs/Svgs";
import { PersonalStatsRadar } from "../profile/PersonalStatsRadar";
import { getAbbreviatedLabel } from "../../utils/listHelpers";

interface ProfileStats {
  completed_lists: number;
  expired_lists: number;
  total_lists: number;
}

interface Stat {
  name: string;
  level: number;
  icon: string;
  color: string;
  type: string;
}

interface ProfileData {
  username: string;
  points: number;
  avatar_url?: string;
  stats: ProfileStats;
  userStats: Stat[]; 
}
 
  const initialStats = [
    { name: "Forza", level: 0, icon: "💪", color: "#F87171", type: "forza" },
    { name: "Resistenza", level: 0, icon: "🛡️", color: "#60A5FA", type: "resistenza" },
    { name: "Velocità", level: 0, icon: "⚡", color: "#FBBF24", type: "velocita" },
    { name: "Percezione", level: 0, icon: "👁️", color: "#34D399", type: "percezione" },
    { name: "Intelligenza", level: 0, icon: "🧠", color: "#A78BFA", type: "intelligenza" },
    { name: "Fortuna", level: 0, icon: "🍀", color: "#F472B6", type: "fortuna" },
  ];

export const PublicDetailProfile = ({ profileId }: { profileId: string }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, points, avatar_url")
          .eq("id", profileId)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("Profilo non trovato");

        
        const { data: statsData } = await supabase
          .rpc("get_user_list_stats", { user_id: profileId })
          .select()
          .single();

        
        const { data: personalStatsData } = await supabase
          .from("stats")
          .select("*")
          .eq("user_id", profileId)
          .single();

      
        const stats: ProfileStats = {
          completed_lists: statsData?.completed_lists ? Number(statsData.completed_lists) : 0,
          expired_lists: statsData?.expired_lists ? Number(statsData.expired_lists) : 0,
          total_lists: statsData?.total_lists ? Number(statsData.total_lists) : 0
        };

        
        const userStats = personalStatsData 
          ? initialStats.map(stat => ({
              ...stat,
              level: personalStatsData[stat.type as keyof typeof personalStatsData] || 0
            }))
          : initialStats;

        setProfile({
          ...profileData,
          stats,
          userStats 
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Errore nel caricamento del profilo");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/" className="text-purple-400 hover:underline">
          Torna alla home
        </Link>
      </div>
    );

  if (!profile)
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Profilo non disponibile</div>
        <Link to="/" className="text-purple-400 hover:underline">
          Torna alla home
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/30 rounded-t-xl p-6 border-b border-purple-500/20">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 ring-4 ring-purple-500/30 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span>{profile.username.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-2">
            {profile.username}
          </h1>

          <div className="flex items-center bg-gray-800/80 px-4 py-1 rounded-full border border-purple-500/30">
            <span className="text-purple-300 mr-2">✦</span>
            <span className="font-mono text-lg text-white">
              {profile.points}
            </span>
            <span className="text-gray-400 ml-1 text-sm">punti</span>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="bg-gray-900/80 rounded-b-xl p-6 border border-t-0 border-gray-700 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Liste completate */}
          <StatCard
            title="Liste completate"
            value={profile.stats.completed_lists}
            icon="✅"
            color="green"
          />

          {/* Liste scadute */}
          <StatCard
            title="Liste scadute"
            value={profile.stats.expired_lists}
            icon="⌛"
            color="yellow"
          />

          {/* Liste totali */}
          <StatCard
            title="Liste totali"
            value={profile.stats.total_lists}
            icon="📋"
            color="purple"
          />
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg mt-8">
  {profile.userStats && (
    <>
      <PersonalStatsRadar
        stats={profile.userStats} 
        isOwner={false}
      />
      
      {/* Legenda migliorata */}
      <div className="mt-4">
        {/* Versione mobile - compatta */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {profile.userStats.map((stat) => (
              <div key={stat.type} className="flex items-center bg-gray-800/50 px-2 py-1 rounded">
                <span className="mr-1">{stat.icon}</span>
                <span className="truncate">{getAbbreviatedLabel(stat.name)}</span>
                <span className="ml-auto font-bold text-purple-400">{stat.level}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Versione desktop - estesa */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-3">
            {profile.userStats.map((stat) => (
              <div 
                key={stat.type} 
                className="flex items-center p-2 rounded-lg border"
                style={{
                  background: `${stat.color}10`,
                  borderColor: `${stat.color}30`
                }}
              >
                <span className="text-xl mr-3">{stat.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: stat.color }}>
                    {stat.name}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: `${stat.color}90` }}>
                      Livello
                    </span>
                    <span className="font-bold" style={{ color: stat.color }}>
                      {stat.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )}
</div>

        <div className="flex justify-center mt-8">
          <Link
            to="/"
            className="px-6 py-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center"
          >
            <ArrowLeftIcon className="w-3 h-3 mr-1" />
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
};


const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) => {
  const colorClasses = {
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-400",
  };

  return (
    <div
      className={`p-5 rounded-xl border ${
        colorClasses[color as keyof typeof colorClasses]
      } transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};