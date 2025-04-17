import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export const CreateListButton = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h3 className="text-2xl md:text-3xl font-medium bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-6">
          Crea Ora La Tua Lista !
        </h3>

        <Link 
  to={user ? "/list/create" : "#"}  
  onClick={(e) => {
    if (!user) {
      e.preventDefault();
      alert("Accedi per creare una lista");
    }
  }}
>
  <motion.button
    whileHover={{ scale: 1.05 }}
    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full"
  >
    Crea una lista
  </motion.button>
</Link>

        <p className="mt-4 text-gray-400 max-w-md mx-auto">
          Organizza i tuoi obiettivi giornalieri, settimanali o mensili in modo
          semplice e divertente
        </p>
      </motion.div>
    </div>
  );
};
