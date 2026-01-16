import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase-client";
import { ListType, ListTypeWithEmpty, Task } from "../types/listTypes";
import { notifyUser } from "./notifications";

export const getInitialTasks = (listType: ListTypeWithEmpty): Task[] => {
  switch (listType) {
    case "daily":
      return Array(4).fill(0).map((_, i) => ({
        id: uuidv4(),
        label: `Task ${i + 1}`,
        value: ""
      }));
    case "weekly":
      return Array(7).fill(0).map((_, i) => ({
        id: uuidv4(),
        label: `Task ${i + 1}`,
        value: ""
      }));
    case "monthly":
      return Array(10).fill(0).map((_, i) => ({
        id: uuidv4(),
        label: `Task ${i + 1}`,
        value: ""
      }));
    default:
      return [];
  }
};

export const getMinTasks = (listType: ListTypeWithEmpty): number => {
  switch (listType) {
    case "daily": return 4;
    case "weekly": return 7;
    case "monthly": return 10;
    default: return 1;
  }
};

export const calculateExpirationDate = (selectedOption: ListTypeWithEmpty): Date => {
  const now = new Date();
  const expiresAt = new Date(now);
  const ITALY_UTC_OFFSET = 2 * 60 * 60 * 1000;
  const THREE_HOURS = 3 * 60 * 60 * 1000;

  const setItalianMidnight = (date: Date) => {
    date.setUTCHours(22, 0, 0, 0);
    return date;
  };

  if (selectedOption === "daily") {
    setItalianMidnight(expiresAt);
    if (expiresAt.getTime() - now.getTime() + ITALY_UTC_OFFSET < THREE_HOURS) {
      expiresAt.setUTCDate(expiresAt.getUTCDate() + 1);
    }
  } 
  else if (selectedOption === "weekly") {
    setItalianMidnight(expiresAt);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
    if (expiresAt.getTime() - now.getTime() + ITALY_UTC_OFFSET < THREE_HOURS) {
      expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
    }
  }
  else if (selectedOption === "monthly") {
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const endOfMonth = new Date(nextMonth.getTime() - 1);
    setItalianMidnight(endOfMonth);

    if (endOfMonth.getTime() - now.getTime() + ITALY_UTC_OFFSET < THREE_HOURS) {
      const nextEndOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
      setItalianMidnight(nextEndOfMonth);
      expiresAt.setTime(nextEndOfMonth.getTime());
    } else {
      expiresAt.setTime(endOfMonth.getTime());
    }
  }

  return expiresAt;
};

export const checkListLimit = async (userId: string, listType: ListType): Promise<boolean> => {
  const now = new Date();
  const startOfDayItaly = new Date(now);
  startOfDayItaly.setHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(startOfDayItaly.getTime() - (2 * 60 * 60 * 1000));

  const { data: userLists, error } = await supabase
    .from('lists')
    .select('created_at')
    .eq('user_id', userId)
    .eq('type', listType)
    .gte('created_at', startOfDayUTC.toISOString());

  if (error) throw error;

  switch (listType) {
    case 'daily': return (userLists?.length || 0) < 2;
    case 'weekly': return (userLists?.length || 0) < 1;
    case 'monthly': return (userLists?.length || 0) < 1;
    default: return true;
  }
};

// abbreviazioni per il grafico!
export const getAbbreviatedLabel = (name: string): string => {
  const abbreviations: Record<string, string> = {
    'Forza': 'FZA',
    'Resistenza': 'RST', 
    'Velocità': 'VEL',
    'Percezione': 'PRC',
    'Intelligenza': 'INT',
    'Fortuna': 'FRT'
  };
  return abbreviations[name] || name;
};
// Check for lists expiring within 6 hours and send notifications
// NOTE: Disabled until notification_sent column is added to lists table in Supabase
export const checkListsExpiringWithin6Hours = async (userId: string) => {
  try {
    const now = new Date();
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    const { data: expiringLists, error } = await supabase
      .from('lists')
      .select('id, title, expires_at')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .gt('expires_at', now.toISOString())
      .lt('expires_at', sixHoursFromNow.toISOString())
      .eq('notification_sent', false);

    if (error) {
      console.error('Error checking expiring lists:', error);
      return;
    }

    if (!expiringLists || expiringLists.length === 0) {
      return;
    }

    console.log(`⏰ Found ${expiringLists.length} lists expiring soon. Sending notifications...`);

    // Send notification for each expiring list
    for (const list of expiringLists) {
      const expiresAt = new Date(list.expires_at as string);
      const hoursLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000));
      
      await notifyUser.expiring(userId, list.title, hoursLeft, list.id);

      // Mark as notification sent
      await supabase
        .from('lists')
        .update({ notification_sent: true })
        .eq('id', list.id);
    }
  } catch (error) {
    console.error('Error in checkListsExpiringWithin6Hours:', error);
  }
};