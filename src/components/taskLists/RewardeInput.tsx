import { GiftIcon, SkullIcon } from "../../svgs/Svgs";
import { RewardPunishment } from "../../types/listTypes";

type RewardInputProps = {
  item: RewardPunishment;
  onChange: (text: string) => void;
};

export const RewardInput = ({ item, onChange }: RewardInputProps) => (
  <div className={`p-4 rounded-lg border ${
    item.type === "reward"
      ? "bg-green-900/20 border-green-700"
      : "bg-red-900/20 border-red-700"
  }`}>
    <div className="flex items-center mb-2">
      {item.type === "reward" ? (
        <GiftIcon className="w-5 h-5 mr-2 text-green-400" />
      ) : (
        <SkullIcon className="w-5 h-5 mr-2 text-red-400" />
      )}
      <span className="font-medium text-pink-300">
        {item.type === "reward" ? "Premio" : "Punizione"}
      </span>
    </div>
    <input
      type="text"
      value={item.text}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-1 text-white"
      placeholder={
        item.type === "reward"
          ? "Es: Pizza stasera!"
          : "Es: Niente social!"
      }
    />
  </div>
);