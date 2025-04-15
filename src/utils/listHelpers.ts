import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase-client";
import { ListType, ListTypeWithEmpty, Task } from "../types/listTypes";

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