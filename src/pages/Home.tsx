import { motion } from "framer-motion";
import { PostList } from "../components/PostList";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="pt-10 relative">
      {/* Pulsante "Crea nuovo" in alto a destra */}
      <div className="absolute top-0 right-0">
        <Link
          to={user ? "/create" : ""}
          onClick={
            !user
              ? (e) => {
                  e.preventDefault();
                  // Qui puoi aggiungere un redirect al login o un modal
                  alert("Per favore accedi per creare un post");
                }
              : undefined
          }
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-xl">+</span>
            <span>{user ? "Crea nuovo" : "Accedi per creare"}</span>
          </motion.div>
        </Link>
      </div>

      {/* Titolo centrale */}
      <h2 className="text-6xl pt-5 pb-10 font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Recent Posts
      </h2>

      {/* Lista post */}
      <div>
        <PostList />
      </div>
    </div>
  );
};
