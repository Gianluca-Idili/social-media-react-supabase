interface ProfileProps {
  username: string;
  email: string;
  createdAt: string;
  onEdit: () => void;
}

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);
const GearIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const ProfileItem = ({
  username,
  email,
  createdAt,
  onEdit,
}: ProfileProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-lg border border-gray-800">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:flex-1 space-y-10">
          <h2 className="text-xl text-center font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Istruzioni
          </h2>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-gray-300">
            <p className="mb-3 flex items-start">
              <span className="inline-block mr-3 font-mono text-sm text-pink-400">
                1.
              </span>
              <span>
                Scegli il tipo di scheda:{" "}
                <span className="text-pink-300">Giornaliera</span>,{" "}
                <span className="text-purple-300">Settimanale</span> o{" "}
                <span className="text-indigo-300">Mensile</span>
              </span>
            </p>

            <p className="mb-3 flex items-start">
              <span className="inline-block mr-3 font-mono text-sm text-pink-400">
                2.
              </span>
              <span>
                Scrivi la tua{" "}
                <strong className="text-white">Task principale</strong> nel
                primo campo disponibile
              </span>
            </p>

            <p className="mb-3 flex items-start">
              <span className="inline-block mr-3 font-mono text-sm text-pink-400">
                3.
              </span>
              <span>
                Aggiungi task aggiuntive con il pulsante
                <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-gray-800 text-pink-300 border border-pink-900">
                  <PlusIcon className="w-3 h-3 mr-1" /> ADD TASKS
                </span>
              </span>
            </p>

            <p className="flex items-start">
              <span className="inline-block mr-3 font-mono text-sm text-pink-400">
                4.
              </span>
              <span>
                Puoi eliminare le task in più partendo dall'ultima creata con
                <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-gray-800 text-red-300 border border-red-900">
                  <TrashIcon className="w-3 h-3 mr-1" /> Cancella l'ultima
                </span>
              </span>
            </p>
          </div>
        </div>

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
    </div>
  );
};
