import { supabase } from '../supabase-client';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
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
): Promise<{ success: boolean; sent?: number; error?: string }> => {
  try {
    const targetIds = Array.isArray(userIds) ? userIds : [userIds];
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userIds: targetIds,
        payload: {
          ...payload,
          icon: payload.icon || '/icon-192.png',
          badge: payload.badge || '/icon-192.png',
        }
      }
    });

    if (error) throw error;
    
    return { success: true, sent: data?.sent || 0 };
  } catch (error) {
    console.error('Errore invio notifica:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Notifiche predefinite per eventi comuni - ITALIANO
 */
export const NotificationTemplates = {
  // Quando qualcuno vota Real sulla tua lista
  newRealVote: (voterName: string, listTitle: string) => ({
    title: '✅ Nuovo voto Real!',
    body: `${voterName} pensa che "${listTitle}" sia realistica!`,
    tag: 'vote-real',
  }),

  // Quando qualcuno vota Fake sulla tua lista
  newFakeVote: (voterName: string, listTitle: string) => ({
    title: '❌ Nuovo voto Fake',
    body: `${voterName} ha dubbi su "${listTitle}"`,
    tag: 'vote-fake',
  }),

  // Quando una lista sta per scadere
  listExpiring: (listTitle: string, hoursLeft: number) => ({
    title: '⏰ Lista in scadenza!',
    body: hoursLeft <= 1 
      ? `"${listTitle}" scade tra meno di un'ora!`
      : `"${listTitle}" scade tra ${hoursLeft} ore`,
    tag: 'expiring',
  }),

  // Quando una lista è completata
  listCompleted: (listTitle: string) => ({
    title: '🎉 Obiettivo raggiunto!',
    body: `Hai completato "${listTitle}"! Fantastico!`,
    tag: 'completed',
  }),

  // Quando completi un task
  taskCompleted: (taskName: string, remaining: number) => ({
    title: '✨ Task completato!',
    body: remaining > 0 
      ? `"${taskName}" fatto! Ne mancano ${remaining}`
      : `"${taskName}" fatto! Lista completata!`,
    tag: 'task-done',
  }),

  // Aggiornamento leaderboard - sei salito
  leaderboardUp: (position: number) => ({
    title: '🏆 Stai scalando!',
    body: `Sei salito alla posizione #${position} in classifica!`,
    tag: 'leaderboard',
  }),

  // Aggiornamento leaderboard - sei sceso
  leaderboardDown: (position: number) => ({
    title: '📉 Classifica aggiornata',
    body: `Sei sceso alla posizione #${position}. Riconquista il podio!`,
    tag: 'leaderboard',
  }),

  // Promemoria giornaliero
  dailyReminder: (pendingTasks: number) => ({
    title: '📋 Buongiorno!',
    body: pendingTasks > 0
      ? `Hai ${pendingTasks} task da completare oggi. Forza! 💪`
      : `Nessun task in sospeso. Crea una nuova sfida!`,
    tag: 'reminder',
  }),

  // Nuova lista pubblica da seguire
  newPublicList: (authorName: string, listTitle: string) => ({
    title: '📢 Nuova lista pubblica',
    body: `${authorName} ha pubblicato "${listTitle}"`,
    tag: 'new-list',
  }),

  // Streak reminder
  streakReminder: (days: number) => ({
    title: '🔥 Non perdere la streak!',
    body: `Hai una serie di ${days} giorni. Completa un task per mantenerla!`,
    tag: 'streak',
  }),
};

/**
 * Helper per inviare notifiche con template - ITALIANO
 */
export const notifyUser = {
  realVote: async (userId: string, voterName: string, listTitle: string) => {
    return sendPushNotification(userId, NotificationTemplates.newRealVote(voterName, listTitle));
  },

  fakeVote: async (userId: string, voterName: string, listTitle: string) => {
    return sendPushNotification(userId, NotificationTemplates.newFakeVote(voterName, listTitle));
  },

  expiring: async (userId: string, listTitle: string, hoursLeft: number) => {
    return sendPushNotification(userId, NotificationTemplates.listExpiring(listTitle, hoursLeft));
  },

  completed: async (userId: string, listTitle: string) => {
    return sendPushNotification(userId, NotificationTemplates.listCompleted(listTitle));
  },

  taskDone: async (userId: string, taskName: string, remaining: number) => {
    return sendPushNotification(userId, NotificationTemplates.taskCompleted(taskName, remaining));
  },

  leaderboardUp: async (userId: string, position: number) => {
    return sendPushNotification(userId, NotificationTemplates.leaderboardUp(position));
  },

  leaderboardDown: async (userId: string, position: number) => {
    return sendPushNotification(userId, NotificationTemplates.leaderboardDown(position));
  },

  dailyReminder: async (userId: string, pendingTasks: number) => {
    return sendPushNotification(userId, NotificationTemplates.dailyReminder(pendingTasks));
  },

  newList: async (userId: string, authorName: string, listTitle: string) => {
    return sendPushNotification(userId, NotificationTemplates.newPublicList(authorName, listTitle));
  },

  streak: async (userId: string, days: number) => {
    return sendPushNotification(userId, NotificationTemplates.streakReminder(days));
  },
};
