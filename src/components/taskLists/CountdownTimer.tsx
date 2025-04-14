import { useEffect, useState } from "react";

export const CountdownTimer = ({ targetDate }: { targetDate: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft("Nessuna scadenza");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Scaduto!");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className={timeLeft === "Scaduto!" ? "text-red-500" : "text-yellow-400"}>
      {timeLeft}
    </span>
  );
};