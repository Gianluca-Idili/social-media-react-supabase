import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signInWithGitHub, signOut, user } = useAuth();

  useEffect(() => {
    console.log("User ID:", user?.id);
  }, [user]);

  const displayName = user?.user_metadata?.user_name || user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10,10,10,0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-mono text-xl font-bold text-white">
            forum<span className="text-purple-500">.app</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>

            <Link
              to="/communities"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Communities
            </Link>

            <Link
              to={`/profile/${user?.id}`}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  signInWithGitHub();
                }
              }}
            >
              Profile
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-300">{displayName}</span>
                <button
                  onClick={signOut}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={signInWithGitHub}
                  className="bg-gray-800 px-3 py-1 rounded flex items-center"
                >
                  <span>GitHub</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {user && avatarUrl && (
              <img
                src={avatarUrl}
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
            )}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[rgba(10,10,10,0.95)] border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-3">
            {/* User Info */}
            {user && (
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{displayName}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <Link
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              to={`/profile/${user?.id}`}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  signInWithGitHub();
                }
                setMenuOpen(false);
              }}
            >
              Profile
            </Link>

            <Link
              to="/"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/communities"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Communities
            </Link>

            {/* Auth Buttons */}
            <div className="pt-2 border-t border-white/10">
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-red-400 hover:text-white hover:bg-gray-700"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      signInWithGitHub();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 flex items-center"
                  >
                    <span>Sign in with GitHub</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
