import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { 
    permission, 
    subscription, 
    isSupported, 
    subscribe, 
    unsubscribe 
  } = useNotifications(user?.id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleToggleNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (subscription) {
        // Unsubscribe
        const success = await unsubscribe();
        if (success) {
          console.log('✅ Notifiche disattivate');
        }
      } else {
        // Subscribe
        const success = await subscribe();
        if (success) {
          console.log('✅ Notifiche attivate');
        }
      }
    } catch (error) {
      console.error('Errore toggle notifiche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!subscription || !user) return;
    
    setTestStatus('Invio in corso...');
    
    // Test notifica locale (funziona sempre)
    if ('Notification' in window && permission === 'granted') {
      try {
        // Usa il Service Worker per mostrare la notifica (più affidabile)
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🔔 Test Notifica', {
          body: 'Fantastico! Le notifiche funzionano! 🎉',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-local',
        });
        setTestStatus('✅ Notifica inviata!');
      } catch {
        // Fallback a Notification API diretta
        new Notification('🔔 Test Notifica', {
          body: 'Fantastico! Le notifiche funzionano! 🎉',
          icon: '/icon-192.png',
          tag: 'test-local',
        });
        setTestStatus('✅ Notifica inviata!');
      }
    } else {
      setTestStatus('❌ Permesso notifiche non concesso');
    }
    
    // Reset status dopo 3 secondi
    setTimeout(() => setTestStatus(null), 3000);
  };

  if (!user) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400 text-center">
          Effettua il login per gestire le notifiche
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">⚠️</span>
          <h3 className="text-xl font-bold text-white">
            Notifiche Non Supportate
          </h3>
        </div>
        <p className="text-gray-400">
          Il tuo browser non supporta le notifiche push. 
          Prova con Chrome, Firefox o Edge moderni.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🔔</span>
          <h3 className="text-xl font-bold text-white">
            Notifiche Push
          </h3>
        </div>
        
        {/* Status badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          subscription 
            ? 'bg-green-900 text-green-300 border border-green-700' 
            : 'bg-gray-800 text-gray-400 border border-gray-600'
        }`}>
          {subscription ? '🟢 Attive' : '⚪ Inattive'}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-300 mb-2">
          Ricevi notifiche per:
        </p>
        <ul className="text-sm text-gray-400 space-y-1 ml-4">
          <li>• ⏰ Liste in scadenza</li>
          <li>• 🎉 Completamenti e achievement</li>
          <li>• 👍 Like e commenti</li>
          <li>• 🏆 Aggiornamenti leaderboard</li>
        </ul>
      </div>

      {/* Permission status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Permesso Browser:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            permission === 'granted' 
              ? 'bg-green-900 text-green-300'
              : permission === 'denied'
              ? 'bg-red-900 text-red-300'  
              : 'bg-yellow-900 text-yellow-300'
          }`}>
            {permission === 'granted' ? '✅ Concesso' : 
             permission === 'denied' ? '❌ Negato' : 
             '⏳ Da richiedere'}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleToggleNotifications}
          disabled={isLoading || permission === 'denied'}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            subscription
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Caricamento...
            </span>
          ) : subscription ? (
            '🔕 Disattiva Notifiche'
          ) : (
            '🔔 Attiva Notifiche'
          )}
        </button>

        {subscription && (
          <button
            onClick={handleTestNotification}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-300"
          >
            🧪 Test
          </button>
        )}
      </div>

      {/* Test status */}
      {testStatus && (
        <div className="mt-3 p-2 bg-gray-800 rounded-lg text-center text-sm text-gray-300">
          {testStatus}
        </div>
      )}

      {/* Help text */}
      {permission === 'denied' && (
        <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">
            ❌ Notifiche bloccate. Per attivarle:
            <br />• Chrome: Clicca l'icona 🔒 nella barra indirizzi
            <br />• Cambia "Notifiche" da "Blocca" a "Consenti"
          </p>
        </div>
      )}
    </div>
  );
};