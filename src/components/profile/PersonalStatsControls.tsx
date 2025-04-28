import { Stat } from "../publicLists/types";

interface PersonalStatsControlsProps {
  stats: Stat[];
  points: number;
  isOwner: boolean;
  onUpgrade: (statIndex: number) => void;
  onReset: () => void;
}

export const PersonalStatsControls = ({ 
  stats, 
  points, 
  isOwner, 
  onUpgrade, 
  onReset 
}: PersonalStatsControlsProps) => {
  const getUpgradeCost = (currentLevel: number): number => {
    return (currentLevel + 1) * 2;
  };

  return (
    <div className="w-full">
      {isOwner && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Punti</h4>
            <span className="text-xl font-bold text-purple-400">
              {points}
            </span>
          </div>
        </div>
      )}

      {/* Versione mobile - Lista verticale */}
      <div className="block lg:hidden space-y-3">
        {stats.map((stat, index) => (
          <div key={stat.type} className="bg-gray-800 rounded-lg border border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl flex-shrink-0">{stat.icon}</span>
                <div className="min-w-0">
                  <div className="font-medium text-white text-sm truncate">{stat.name}</div>
                  <div className="text-xs text-gray-400">
                    Lv.{stat.level} • +{getUpgradeCost(stat.level)} pts
                  </div>
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => onUpgrade(index)}
                  disabled={points < getUpgradeCost(stat.level)}
                  className={`ml-2 px-3 py-2 rounded-md text-sm font-bold flex-shrink-0 ${
                    points >= getUpgradeCost(stat.level)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Versione desktop - Griglia */}
      <div className="hidden lg:grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={stat.type} className="bg-gray-800 rounded-lg border border-gray-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="font-medium text-white">{stat.name}</span>
              </div>
              <span className="font-bold text-purple-400">Lv.{stat.level}</span>
            </div>

            {isOwner && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {getUpgradeCost(stat.level)} pts
                </span>
                <button
                  onClick={() => onUpgrade(index)}
                  disabled={points < getUpgradeCost(stat.level)}
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    points >= getUpgradeCost(stat.level)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <button
          onClick={onReset}
          className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 font-medium"
        >
          Reset Statistiche
        </button>
      )}
    </div>
  );
};