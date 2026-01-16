import { supabase } from '../supabase-client';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Invia una notifica push a uno o più utenti
 */
export const sendPushNotification = async (
  userIds: string | string[],
  payload: NotificationPayload
): Promise<{ success: boolean; sent?: number; failed?: number; errors?: any[]; error?: string }> => {
  try {
    const targetIds = Array.isArray(userIds) ? userIds : [userIds];
    
    console.log('📤 Sending push notification to:', targetIds);
    console.log('📤 Payload:', payload);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userIds: targetIds,
        payload: {
          ...payload,
          icon: payload.icon || '/icon-192.png',
          badge: payload.badge || '/icon-192.png',
          image: payload.image || '/icon-512.png', // Aggiunge l'immagine grande della brand identity
        }
      }
    });

    console.log('📤 Edge Function response:', data, error);

    if (error) throw error;
    
    return { 
      success: true, 
      sent: data?.sent || 0,
      failed: data?.failed || 0,
      errors: data?.errors
    };
  } catch (error) {
    console.error('❌ Errore invio notifica:', error);
    return { 
      success: false, 
      sent: 0, 
      failed: 1, 
      error: (error as Error).message,
      errors: [(error as Error).message]
    };
  }
};

/**
 * Notifiche predefinite per eventi comuni - ITALIANO
 */
export const NotificationTemplates = {
  // Quando qualcuno vota Real sulla tua lista
  newRealVote: (voterName: string, listTitle: string, listId: string) => ({
    title: '✅ Nuovo voto Real!',
    body: `${voterName} pensa che "${listTitle}" sia realistica!`,
    tag: 'vote-real',
    url: `/list/${listId}`,
  }),

  // Quando qualcuno vota Fake sulla tua lista
  newFakeVote: (voterName: string, listTitle: string, listId: string) => ({
    title: '❌ Nuovo voto Fake',
    body: `${voterName} ha dubbi su "${listTitle}"`,
    tag: 'vote-fake',
    url: `/list/${listId}`,
  }),

  // Quando una lista sta per scadere
  listExpiring: (listTitle: string, hoursLeft: number, listId: string) => ({
    title: '⏰ Lista in scadenza!',
    body: hoursLeft <= 1 
      ? `"${listTitle}" scade tra meno di un'ora!`
      : `"${listTitle}" scade tra ${hoursLeft} ore`,
    tag: 'expiring',
    url: `/list/${listId}`,
  }),

  // Quando una lista è completata
  listCompleted: (listTitle: string, listId: string) => ({
    title: '🎉 Obiettivo raggiunto!',
    body: `Hai completato "${listTitle}"! Fantastico!`,
    tag: 'completed',
    url: `/list/${listId}`,
  }),

  // Quando qualcuno visita il profilo pubblico
  profileVisit: (visitorName: string, visitorId: string) => ({
    title: '👁️ Visita al profilo',
    body: `${visitorName} ha visitato il tuo profilo pubblico!`,
    tag: 'profile-visit',
    url: `/detail/profile/${visitorId}`,
  }),

  // Quando una lista scade
  listExpired: (listTitle: string, listId: string) => ({
    title: '⏳ Lista scaduta',
    body: `"${listTitle}" è scaduta. Puoi completarla comunque!`,
    tag: 'expired',
    url: `/list/${listId}`,
  }),

  // Quando completi un task
  taskCompleted: (taskName: string, remaining: number, listId: string) => ({
    title: '✨ Task completato!',
    body: remaining > 0 
      ? `"${taskName}" fatto! Ne mancano ${remaining}`
      : `"${taskName}" fatto! Lista completata!`,
    tag: 'task-done',
    url: `/list/${listId}`,
  }),

  // Aggiornamento leaderboard - sei salito
  leaderboardUp: (position: number) => ({
    title: '🏆 Stai scalando!',
    body: `Sei salito alla posizione #${position} in classifica!`,
    tag: 'leaderboard',
    url: '/leaderboard',
  }),

  // Aggiornamento leaderboard - sei sceso
  leaderboardDown: (position: number) => ({
    title: '📉 Classifica aggiornata',
    body: `Sei sceso alla posizione #${position}. Riconquista il podio!`,
    tag: 'leaderboard',
    url: '/leaderboard',
  }),

  // Promemoria giornaliero
  dailyReminder: (pendingTasks: number) => ({
    title: '📋 Buongiorno!',
    body: pendingTasks > 0
      ? `Hai ${pendingTasks} task da completare oggi. Forza! 💪`
      : `Nessun task in sospeso. Crea una nuova sfida!`,
    tag: 'reminder',
    url: '/lists',
  }),

  // Nuova lista pubblica da seguire
  newPublicList: (authorName: string, listTitle: string, listId: string) => ({
    title: '📢 Nuova lista pubblica',
    body: `${authorName} ha pubblicato "${listTitle}"`,
    tag: 'new-list',
    url: `/list/${listId}`,
  }),

  // Streak reminder
  streakReminder: (days: number) => ({
    title: '🔥 Non perdere la streak!',
    body: `Hai una serie di ${days} giorni. Completa un task per mantenerla!`,
    tag: 'streak',
    url: '/lists',
  }),
};

/**
 * Helper per inviare notifiche con template - ITALIANO
 */
export const notifyUser = {
  realVote: async (userId: string, voterName: string, listTitle: string, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.newRealVote(voterName, listTitle, listId));
  },

  fakeVote: async (userId: string, voterName: string, listTitle: string, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.newFakeVote(voterName, listTitle, listId));
  },

  expiring: async (userId: string, listTitle: string, hoursLeft: number, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.listExpiring(listTitle, hoursLeft, listId));
  },

  completed: async (userId: string, listTitle: string, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.listCompleted(listTitle, listId));
  },

  taskDone: async (userId: string, taskName: string, remaining: number, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.taskCompleted(taskName, remaining, listId));
  },

  leaderboardUp: async (userId: string, position: number) => {
    return sendPushNotification(userId, NotificationTemplates.leaderboardUp(position));
  },

  leaderboardDown: async (userId: string, position: number) => {
    return sendPushNotification(userId, NotificationTemplates.leaderboardDown(position));
  },

  profileVisit: async (userId: string, visitorName: string, visitorId: string) => {
    return sendPushNotification(userId, NotificationTemplates.profileVisit(visitorName, visitorId));
  },

  expired: async (userId: string, listTitle: string, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.listExpired(listTitle, listId));
  },

  dailyReminder: async (userId: string, pendingTasks: number) => {
    return sendPushNotification(userId, NotificationTemplates.dailyReminder(pendingTasks));
  },

  newList: async (userId: string, authorName: string, listTitle: string, listId: string) => {
    return sendPushNotification(userId, NotificationTemplates.newPublicList(authorName, listTitle, listId));
  },

  streak: async (userId: string, days: number) => {
    return sendPushNotification(userId, NotificationTemplates.streakReminder(days));
  },
};
