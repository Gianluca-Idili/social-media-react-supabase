import { useState, useEffect } from "react";
import { supabase } from "../../supabase-client";
import { Stat } from "../publicLists/types";
import { PersonalStatsControls } from "./PersonalStatsControls";
import { PersonalStatsRadar } from "./PersonalStatsRadar";

interface PersonalStatsProps {
  userId: string;
  currentUserId: string;
  points: number;
  onPointsChange: (newPoints: number) => void;
}

export const PersonalStats = ({
  userId,
  currentUserId,
  points,
  onPointsChange,
}: PersonalStatsProps) => {
  const initialStats: Stat[] = [
    { name: "Forza", level: 0, icon: "💪", color: "#F87171", type: "forza" },
    { name: "Resistenza", level: 0, icon: "🛡️", color: "#60A5FA", type: "resistenza" },
    { name: "Velocità", level: 0, icon: "⚡", color: "#FBBF24", type: "velocita" },
    { name: "Percezione", level: 0, icon: "👁️", color: "#34D399", type: "percezione" },
    { name: "Intelligenza", level: 0, icon: "🧠", color: "#A78BFA", type: "intelligenza" },
    { name: "Fortuna", level: 0, icon: "🍀", color: "#F472B6", type: "fortuna" },
  ];

  const [stats, setStats] = useState<Stat[]>(initialStats);
  const isOwner = currentUserId === userId;

  useEffect(() => {
    const loadStats = async () => {
      const { data, error } = await supabase
        .from("stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error loading stats:", error);
        if (error.code === 'PGRST116') {
          await createDefaultStats();
        }
        return;
      }

      if (data) {
        setStats(prevStats => [
          { ...prevStats[0], level: data.forza || 0 },
          { ...prevStats[1], level: data.resistenza || 0 },
          { ...prevStats[2], level: data.velocita || 0 },
          { ...prevStats[3], level: data.percezione || 0 },
          { ...prevStats[4], level: data.intelligenza || 0 },
          { ...prevStats[5], level: data.fortuna || 0 },
        ]);
      }
    };

    const createDefaultStats = async () => {
      const { error } = await supabase
        .from("stats")
        .insert({
          user_id: userId,
          forza: 0,
          resistenza: 0,
          velocita: 0,
          percezione: 0,
          intelligenza: 0,
          fortuna: 0
        });

      if (error) {
        console.error("Error creating default stats:", error);
      } else {
        await loadStats();
      }
    };

    loadStats();
  }, [userId]);

  const upgradeStat = async (statIndex: number) => {
    if (!isOwner) return;

    const cost = (stats[statIndex].level + 1) * 2;
    if (points < cost) return;

    const newStats = [...stats];
    newStats[statIndex] = { ...newStats[statIndex], level: newStats[statIndex].level + 1 };
    setStats(newStats);
    
    const newPoints = points - cost;
    onPointsChange(newPoints);

    try {
      const updates = Promise.all([
        supabase
          .from("stats")
          .upsert({
            user_id: userId,
            [stats[statIndex].type]: newStats[statIndex].level
          }, { onConflict: "user_id" }),
        
        supabase
          .from("profiles")
          .update({ points: newPoints })
          .eq("id", userId)
      ]);

      const [statsResult, profileResult] = await updates;

      if (statsResult.error) throw statsResult.error;
      if (profileResult.error) throw profileResult.error;

    } catch (error) {
      console.error("Error upgrading stat:", error);
      setStats(stats);
      onPointsChange(points);
    }
  };

  const resetStats = async () => {
    if (!isOwner) return;

    const totalSpent = stats.reduce((sum, stat) => {
      let total = 0;
      for (let i = 0; i < stat.level; i++) {
        total += (i + 1) * 2;
      }
      return sum + total;
    }, 0);

    const refund = totalSpent;

    setStats(initialStats);
    onPointsChange(points + refund);

    try {
      const updates = Promise.all([
        supabase
          .from("stats")
          .upsert({
            user_id: userId,
            forza: 0,
            resistenza: 0,
            velocita: 0,
            percezione: 0,
            intelligenza: 0,
            fortuna: 0
          }, { onConflict: "user_id" }),
        
        supabase
          .from("profiles")
          .update({ points: points + refund })
          .eq("id", userId)
      ]);

      const [statsResult, profileResult] = await updates;

      if (statsResult.error) throw statsResult.error;
      if (profileResult.error) throw profileResult.error;

    } catch (error) {
      console.error("Error resetting stats:", error);
      setStats(stats);
      onPointsChange(points);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg mt-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <PersonalStatsRadar stats={stats} isOwner={isOwner} />
        <PersonalStatsControls 
          stats={stats} 
          points={points} 
          isOwner={isOwner} 
          onUpgrade={upgradeStat} 
          onReset={resetStats} 
        />
      </div>
    </div>
  );
};