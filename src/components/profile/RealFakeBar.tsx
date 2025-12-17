import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { motion } from "framer-motion";
import { FakeIcon, RealIcon } from "../../svgs/Svgs";

interface RealFakeBarProps {
  userId: string;
}

interface VoteStats {
  realVotes: number;
  fakeVotes: number;
  totalVotes: number;
}

const fetchUserListsVotes = async (userId: string): Promise<VoteStats> => {
  // Prima ottieni tutte le liste dell'utente
  const { data: userLists, error: listsError } = await supabase
    .from("lists")
    .select("id")
    .eq("user_id", userId);

  if (listsError) throw new Error(listsError.message);
  if (!userLists || userLists.length === 0) {
    return { realVotes: 0, fakeVotes: 0, totalVotes: 0 };
  }

  const listIds = userLists.map(list => list.id);

  // Ottieni tutti i voti per queste liste
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("vote")
    .in("list_id", listIds);

  if (votesError) throw new Error(votesError.message);

  const realVotes = votes?.filter(vote => vote.vote === 1).length || 0;
  const fakeVotes = votes?.filter(vote => vote.vote === -1).length || 0;
  const totalVotes = realVotes + fakeVotes;

  return { realVotes, fakeVotes, totalVotes };
};

export const RealFakeBar = ({ userId }: RealFakeBarProps) => {
  const { data: voteStats, isLoading, error } = useQuery({
    queryKey: ["userListsVotes", userId],
    queryFn: () => fetchUserListsVotes(userId),
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

  const { realVotes, fakeVotes, totalVotes } = voteStats!;

  // Calcola le percentuali
  const realPercentage = totalVotes > 0 ? (realVotes / totalVotes) * 100 : 0;
  const fakePercentage = totalVotes > 0 ? (fakeVotes / totalVotes) * 100 : 0;

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
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-gray-300 to-red-400 bg-clip-text text-transparent mb-2">
            Credibilità delle tue Liste
          </h3>
          <p className="text-gray-400 text-sm">
            Basato su {totalVotes} vot{totalVotes === 1 ? 'o' : 'i'} ricevut{totalVotes === 1 ? 'o' : 'i'} sulle tue liste
          </p>
        </div>

        {/* Stats numeri */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <RealIcon className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-2xl font-bold text-green-400">{realVotes}</span>
            </div>
            <p className="text-sm text-gray-400">Real</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-300 mb-2">{totalVotes}</div>
            <p className="text-sm text-gray-400">Totale</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FakeIcon className="w-6 h-6 text-red-400 mr-2" />
              <span className="text-2xl font-bold text-red-400">{fakeVotes}</span>
            </div>
            <p className="text-sm text-gray-400">Fake</p>
          </div>
        </div>

        {/* Barra centrale */}
        <div className="relative">
          <div className="flex items-center h-12 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
            {/* Sezione verde (Real) - sinistra */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${realPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-end pr-2"
            >
              {realPercentage > 15 && (
                <span className="text-white font-bold text-sm">
                  {realPercentage.toFixed(0)}%
                </span>
              )}
            </motion.div>

            {/* Linea centrale */}
            <div className="w-0.5 h-full bg-white opacity-75 flex-shrink-0"></div>

            {/* Sezione rossa (Fake) - destra */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fakePercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-l from-red-500 to-red-400 flex items-center justify-start pl-2"
            >
              {fakePercentage > 15 && (
                <span className="text-white font-bold text-sm">
                  {fakePercentage.toFixed(0)}%
                </span>
              )}
            </motion.div>
          </div>

          {/* Etichette ai lati */}
          <div className="flex justify-between mt-3 px-2">
            <div className="flex items-center">
              <RealIcon className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 font-medium text-sm">Real</span>
            </div>
            <div className="flex items-center">
              <span className="text-red-400 font-medium text-sm">Fake</span>
              <FakeIcon className="w-4 h-4 text-red-400 ml-1" />
            </div>
          </div>
        </div>

        {/* Messaggio motivazionale */}
        {totalVotes === 0 ? (
          <div className="text-center mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">
              🚀 Crea e condividi le tue prime liste per ricevere feedback dalla community!
            </p>
          </div>
        ) : (
          <div className="text-center mt-4">
            <p className="text-gray-300 text-sm">
              {realPercentage > fakePercentage 
                ? "🎉 Ottimo lavoro! Le tue liste sono considerate credibili dalla community!"
                : realPercentage === fakePercentage
                ? "⚖️ Le opinioni sulla tua credibilità sono divise. Continua a migliorare!"
                : "💪 C'è margine di miglioramento. Crea liste più accurate per aumentare la credibilità!"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};