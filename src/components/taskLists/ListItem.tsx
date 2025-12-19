import { supabase } from "../../supabase-client";
import { v4 as uuidv4 } from 'uuid';
import { notifyUser } from "../../utils/notifications";

interface TaskInput {
    id: string;
    label: string;
    value: string;
  }

interface RewardPunishment {
  type: 'reward' | 'punishment';
  text: string;
}

export async function ListItem(
    userId: string,
    type: 'daily' | 'weekly' | 'monthly',
    tasks: TaskInput[],
    rewards: RewardPunishment[],
    expires_at?: string, // Rendi expires_at opzionale
  ): Promise<{ success: boolean; message: string }> {
    if (!type || tasks.some(task => !task.value)) {
      return { success: false, message: 'Compila tutti i campi' };
    }

  const listId = uuidv4();

  const { error: listError } = await supabase.from('lists').insert({
    id: listId,
    user_id: userId,
    title: `Lista ${type}`,
    type,
    is_public: false,
    is_completed: false,
    reward: rewards.find(r => r.type === 'reward')?.text || '',
    punishment: rewards.find(r => r.type === 'punishment')?.text || '',
    created_at: new Date().toISOString(),
    expires_at: expires_at, // Usa il parametro expires_at
  });

  if (listError) {
    return { success: false, message: 'Errore nella creazione lista' };
  }

  const taskInserts = tasks.map(task => ({
    id: uuidv4(),
    list_id: listId,
    description: task.value,
    is_completed: false
  }));

  const { error: taskError } = await supabase.from('tasks').insert(taskInserts);

  if (taskError) {
    return { success: false, message: 'Errore nella creazione delle task' };
  }

  // Schedule 5-minute reminder notification
  setTimeout(() => {
    notifyUser.newList(userId, "Appena creato", `Lista ${type} creata 5 minuti fa. Come sta procedendo?`).catch(console.error);
  }, 5 * 60 * 1000); // 5 minutes

  return { success: true, message: 'Lista creata con successo!' };
}
