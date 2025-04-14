import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { CommunityList } from "../components/communitys/CommunityList";

export default function CommunitiesPage() {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Spaziatura per la navbar fissa (h-16 come nella tua navbar) */}
      <div className="h-16"></div>

      {/* Pulsante posizionato sotto la navbar */}
      <div className="fixed top-20 right-4 z-30"> {/* top-20 = 5rem = 80px */}
        <Link
          to={user ? "/community/create" : "#"}
          onClick={!user ? (e) => {
            e.preventDefault();
            alert("Per favore accedi per creare una community");
          } : undefined}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg border border-white/10 hover:shadow-xl transition-all"
          >
            <span className="text-lg">+</span>
            <span className="ml-2 sm:inline">
              {user ? "Crea community" : "Accedi"}
            </span>
          </motion.div>
        </Link>
      </div>

      {/* Contenuto principale */}
      <div className="pt-4 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl pb-10 sm:text-5xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Communities
        </h2>
        <CommunityList />
      </div>
    </div>
  );
}