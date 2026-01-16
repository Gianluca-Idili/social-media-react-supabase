import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { GearIcon } from "../../svgs/Svgs";
import { PersonalStats } from "./PersonalStats";
import { RealFakeBar } from "./RealFakeBar";
import { CompletionBar } from "./CompletionBar";

interface ProfileProps {
  username: string;
  email: string;
  points: number;
  createdAt: string;
  avatarUrl?: string;
  onEdit: () => void;
}

export const ProfileItem = ({
  username,
  email,
  points,
  createdAt,
  avatarUrl,
  onEdit,
}: ProfileProps) => {
  const [currentPoints, setCurrentPoints] = useState(points);
  const { user } = useAuth();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  // Se l'utente non è loggato, non mostrare la sezione stats
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-lg border border-gray-800">
        <div className="text-center py-10">
          <p className="text-lg text-gray-300">Effettua il login per vedere il tuo profilo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Profilo Card Header - Fluid & Modern */}
      <div className="bg-gray-900/40 rounded-3xl border border-gray-800 p-8 backdrop-blur-xl relative overflow-hidden group">
        {/* Sfondo Decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-600/10 transition-colors duration-700"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-1 shadow-2xl shadow-purple-500/20">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white text-5xl font-black overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span>{username ? username.charAt(0).toUpperCase() : "?"}</span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-900 shadow-lg"></div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black text-white hover:text-purple-400 transition-colors tracking-tight">
                {username || "Anonimo"}
              </h1>
              <button
                onClick={onEdit}
                className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500 hover:bg-gray-700 transition-all duration-300 shadow-lg group/edit mx-auto md:mx-0"
                title="Modifica Profilo"
              >
                <GearIcon className="w-5 h-5 group-hover/edit:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Email:</span>
                <span className="text-gray-200 font-medium">{email || "N/D"}</span>
              </div>
              <div className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Member since:</span>
                <span className="text-gray-200 font-medium">{formatDate(createdAt)}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center md:justify-start gap-6">
              <div className="text-center md:text-left">
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {currentPoints}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Punti Totali</p>
              </div>
              <div className="w-[1px] h-10 bg-gray-800"></div>
              <div className="text-center md:text-left">
                <p className="text-3xl font-black text-white">
                  Lv. {Math.floor(currentPoints / 100) + 1}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Livello</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Section - Stats & Bars */}
      <div className="grid grid-cols-1 gap-8">
        {/* Sezione statistiche (Radar, etc) */}
        <div className="bg-gray-900/30 rounded-3xl border border-gray-800 p-8 shadow-xl">
          <PersonalStats
            userId={user.id} 
            currentUserId={user.id}
            points={currentPoints} 
            onPointsChange={setCurrentPoints} 
          />
        </div>
        
        {/* Bars Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/30 rounded-3xl border border-gray-800 p-8 shadow-xl">
            <h3 className="text-lg font-bold text-gray-300 mb-6 flex items-center gap-2">
              <span className="text-pink-500">🔥</span> Real vs Fake Score
            </h3>
            <RealFakeBar userId={user.id} />
          </div>
          
          <div className="bg-gray-900/30 rounded-3xl border border-gray-800 p-8 shadow-xl">
            <h3 className="text-lg font-bold text-gray-300 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📊</span> Tasso Completamento
            </h3>
            <CompletionBar userId={user.id} />
          </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="pt-6 text-center">
        <Link 
          to="/settings"
          className="inline-flex items-center px-6 py-3 bg-gray-800/80 hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 rounded-full border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
        >
          <span className="mr-3 text-xl group-hover:scale-125 transition-transform duration-300">⚙️</span>
          <span className="font-bold tracking-wide">IMPOSTAZIONI AVANZATE</span>
        </Link>
      </div>
    </div>
  );
};