import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { NotificationSettings } from '../components/notifications/NotificationSettings';

export const SettingsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">⚙️ Impostazioni</h1>
          <p className="text-gray-400">Gestisci le tue preferenze</p>
        </div>

        {/* Sezioni impostazioni */}
        <div className="space-y-6">
          {/* Notifiche Push */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🔔</span>
              Notifiche
            </h2>
            <NotificationSettings />
          </section>

          {/* Altre impostazioni future */}
          <section className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🎨</span>
              Aspetto
            </h2>
            <p className="text-gray-400 text-sm">
              Altre opzioni di personalizzazione in arrivo...
            </p>
          </section>

          <section className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🔒</span>
              Privacy
            </h2>
            <p className="text-gray-400 text-sm">
              Opzioni privacy in arrivo...
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
