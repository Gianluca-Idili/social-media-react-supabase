import { MedalIcon, PaletteIcon, PlusIcon, ShareIcon, TrashIcon } from "../../svgs/Svgs";

export const Instructions = () => {
    return (
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
                <PlusIcon className="w-3 h-3 mr-1" />
                ADD TASKS
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
                <TrashIcon className="w-3 h-3 mr-1" />
                Cancella l'ultima
              </span>
            </span>
          </p>
  
          <p className="mb-3 flex items-start">
            <span className="inline-block mr-3 font-mono text-sm text-pink-400">
              5.
            </span>
            <span>Completale e accumula punti</span>
          </p>
  
          <p className="mb-3 flex items-start">
            <span className="inline-block mr-3 font-mono text-sm text-pink-400">
              6.
            </span>
            <span>
              Sblocca badge speciali dopo 5 task completate con
              <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-gray-800 text-yellow-300 border border-yellow-900">
                <MedalIcon className="w-3 h-3 mr-1" />
                BADGE
              </span>
            </span>
          </p>
  
          <p className="mb-3 flex items-start">
            <span className="inline-block mr-3 font-mono text-sm text-pink-400">
              7.
            </span>
            <span>
              Condividi la lista con altri usando
              <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-gray-800 text-blue-300 border border-blue-900">
                <ShareIcon className="w-3 h-3 mr-1" />
                INVIA
              </span>
            </span>
          </p>
  
          <p className="flex items-start">
            <span className="inline-block mr-3 font-mono text-sm text-pink-400">
              8.
            </span>
            <span>
              Personalizza il colore della scheda con
              <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-gray-800 text-green-300 border border-green-900">
                <PaletteIcon className="w-3 h-3 mr-1" />
                STILE
              </span>
            </span>
          </p>
        </div>
      </div>
    );
  };