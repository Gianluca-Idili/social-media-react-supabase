import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from 'chart.js';
import { Stat } from "../publicLists/types";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PersonalStatsRadarProps {
  stats: Stat[];
  isOwner: boolean;
}

export const PersonalStatsRadar = ({ stats, isOwner }: PersonalStatsRadarProps) => {
  const chartData = {
    labels: stats.map(stat => stat.name),
    datasets: [{
      label: "Statistiche",
      data: stats.map(stat => stat.level),
      backgroundColor: "rgba(139, 92, 246, 0.2)",
      borderColor: "rgba(139, 92, 246, 0.8)",
      borderWidth: 2,
      pointBackgroundColor: stats.map(stat => stat.color),
      pointBorderColor: "#fff",
      pointHoverRadius: 5,
    }],
  };

  
  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true, color: "rgba(255, 255, 255, 0.1)" },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { stepSize: 2, display: false },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        pointLabels: { 
          color: "#E5E7EB",
          font: {
            size: () => window.innerWidth < 640 ? 10 : 14
          },
          callback: (_, index) => {
            return window.innerWidth < 640 
              ? stats[index].icon // Mostra solo l'emoji su mobile
              : `${stats[index].icon} ${stats[index].name}`; // Mostra emoji + nome su desktop
          }
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const stat = stats[context.dataIndex];
            return `${stat.icon} ${stat.name}: Lv.${stat.level}`;
          },
        },
      },
    },
  };

  return (
    <div className="flex-1">
      <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        {isOwner ? "Le Tue Statistiche" : "Statistiche Abilità"}
      </h3>
      <div className="h-64 lg:h-80">
        <Radar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};