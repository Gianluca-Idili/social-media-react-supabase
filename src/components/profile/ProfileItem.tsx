import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { GearIcon } from "../../svgs/Svgs";
import { Instructions } from "./Instructions";
import { PersonalStats } from "./PersonalStats";
import { RealFakeBar } from "./RealFakeBar";
import { CompletionBar } from "./CompletionBar";

interface ProfileProps {
  username: string;
  email: string;
  points: number;
  createdAt: string;
  onEdit: () => void;
}

export const ProfileItem = ({
  username,
  email,
  points,
  createdAt,
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
    <div className="max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-lg border border-gray-800">
      <div className="flex flex-col lg:flex-row gap-8">
        <Instructions />

        <div className="lg:w-64 flex-shrink-0">
          <div className="space-y-6">
            <div>
              <label className="text-xl text-center font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Username
              </label>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-white">
                {username || "N/D"}
              </div>
            </div>

            <div>
              <label className="text-xl text-center font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Email
              </label>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-white">
                {email || "N/D"}
              </div>
            </div>

            <div>
              <label className="text-xl text-center font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Data di creazione
              </label>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-white">
                {formatDate(createdAt) || "N/D"}
              </div>
            </div>
            <div>
              <label className="text-xl text-center font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Punteggio:
              </label>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-white">
                {currentPoints} {/* Mostra currentPoints invece di points */}
              </div>
            </div>

            <button
              onClick={onEdit}
              className="flex items-center justify-center w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-800 to-pink-700 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
            >
              <GearIcon className="mr-2" />
              <span>Modifica</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Sezione statistiche */}
      <PersonalStats
        userId={user.id} 
        currentUserId={user.id}
        points={currentPoints} 
        onPointsChange={setCurrentPoints} 
      />
      
      {/* Barra Real vs Fake */}
      <RealFakeBar userId={user.id} />
      
      {/* Barra Completamento */}
      <CompletionBar userId={user.id} />
      
      {/* Link alle Impostazioni */}
      <div className="mt-8 text-center">
        <Link 
          to="/settings"
          className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
        >
          <span className="mr-2">⚙️</span>
          Impostazioni
        </Link>
      </div>
    </div>

  );
};