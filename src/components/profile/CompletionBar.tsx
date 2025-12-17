import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { motion } from "framer-motion";

interface CompletionBarProps {
  userId: string;
}

interface CompletionStats {
  completedLists: number;
  expiredLists: number;
  totalLists: number;
}

const fetchUserListsCompletion = async (userId: string): Promise<CompletionStats> => {
  // Ottieni tutte le liste dell'utente con data di scadenza
  const { data: userLists, error: listsError } = await supabase
    .from("lists")
    .select("is_completed, expires_at")
    .eq("user_id", userId);

  if (listsError) throw new Error(listsError.message);
  if (!userLists || userLists.length === 0) {
    return { completedLists: 0, expiredLists: 0, totalLists: 0 };
  }

  const now = new Date();
  
  // Controlla se una lista è scaduta
  const isExpired = (list: { is_completed: boolean; expires_at: string | null }) => {
    if (!list.expires_at) return false;
    const expiresAt = new Date(list.expires_at);
    return now >= expiresAt;
  };

  const completedLists = userLists.filter(list => list.is_completed === true).length;
  const expiredLists = userLists.filter(list => !list.is_completed && isExpired(list)).length;
  const totalLists = userLists.length;

  return { completedLists, expiredLists, totalLists };
};

export const CompletionBar = ({ userId }: CompletionBarProps) => {
  const { data: completionStats, isLoading, error } = useQuery({
    queryKey: ["userListsCompletion", userId],
    queryFn: () => fetchUserListsCompletion(userId),
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <p className="text-red-400 text-center">Errore nel caricamento dei dati</p>
        </div>
      </div>
    );
  }

  const { completedLists, expiredLists, totalLists } = completionStats!;

  // Calcola le percentuali - solo tra completate e scadute
  const relevantLists = completedLists + expiredLists;
  const completedPercentage = relevantLists > 0 ? (completedLists / relevantLists) * 100 : 0;
  const expiredPercentage = relevantLists > 0 ? (expiredLists / relevantLists) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-gray-300 to-orange-400 bg-clip-text text-transparent mb-2">
            Completamento delle tue Liste
          </h3>
          <p className="text-gray-400 text-xs md:text-sm">
            Hai creato {totalLists} list{totalLists === 1 ? 'a' : 'e'} in totale
          </p>
        </div>

        {/* Stats numeri */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1 md:mb-2">
              <span className="text-xl mr-1">✅</span>
              <span className="text-2xl font-bold text-blue-400">{completedLists}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-400">Completate</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-300 mb-1 md:mb-2">{totalLists}</div>
            <p className="text-xs md:text-sm text-gray-400">Totale</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1 md:mb-2">
              <span className="text-xl mr-1">⏰</span>
              <span className="text-2xl font-bold text-red-400">{expiredLists}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-400">Scadute</p>
          </div>
        </div>

        {/* Barra centrale */}
        <div className="relative">
          <div className="flex items-center h-12 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
            {/* Sezione blu (Completate) - sinistra */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completedPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-end pr-2"
            >
              {completedPercentage > 15 && (
                <span className="text-white font-bold text-sm">
                  {completedPercentage.toFixed(0)}%
                </span>
              )}
            </motion.div>

            {/* Linea centrale */}
            <div className="w-0.5 h-full bg-white opacity-75 flex-shrink-0"></div>

            {/* Sezione rossa (Scadute) - destra */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expiredPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-l from-red-500 to-red-400 flex items-center justify-start pl-2"
            >
              {expiredPercentage > 15 && (
                <span className="text-white font-bold text-sm">
                  {expiredPercentage.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>

          {/* Etichette ai lati */}
          <div className="flex justify-between items-center mt-3 px-1 md:px-2">
            <div className="flex items-center">
              <span className="text-sm md:text-lg mr-0.5 md:mr-1">✅</span>
              <span className="text-blue-400 font-medium text-xs md:text-sm">Completate ({completedLists})</span>
            </div>
            <div className="flex items-center">
              <span className="text-red-400 font-medium text-xs md:text-sm">Scadute ({expiredLists})</span>
              <span className="text-sm md:text-lg ml-0.5 md:ml-1">⏰</span>
            </div>
          </div>
        </div>

        {/* Messaggio motivazionale */}
        {totalLists === 0 ? (
          <div className="text-center mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">
              🎯 Crea la tua prima lista e inizia il tuo percorso di produttività!
            </p>
          </div>
        ) : relevantLists === 0 ? (
          <div className="text-center mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">
              📝 Nessuna lista completata o scaduta ancora. Aspetta per vedere le statistiche!
            </p>
          </div>
        ) : (
          <div className="text-center mt-4">
            <p className="text-gray-300 text-sm">
              {expiredLists === 0
                ? `🏆 Perfetto! Tutte le liste finite sono state completate in tempo!`
                : completedLists === 0
                ? `⚠️ Tutte le liste finite sono scadute. Prova a gestire meglio i tempi!`
                : completedPercentage > 70
                ? `🌟 Eccellente! ${completedLists}/${relevantLists} liste completate in tempo!`
                : `📈 ${completedLists}/${relevantLists} liste completate. Puoi fare meglio!`}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};