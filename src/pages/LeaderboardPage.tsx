import { LeaderboardList } from "../components/leaderboard/leaderboardList";

export const LeaderboardPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Leaderboard
      </h1>
     <LeaderboardList />
    </div>
  );
};