export type Task = {
    id: string;
    label: string;
    value: string;
  };
  
  export type RewardPunishment = {
    type: "reward" | "punishment";
    text: string;
  };
  
  export type ListType = "daily" | "weekly" | "monthly";
  export type ListTypeWithEmpty = ListType | "";