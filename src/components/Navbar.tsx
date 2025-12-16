import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signInWithGitHub, signInWithGoogle, signOut, user } = useAuth();

  useEffect(() => {
    console.log("User ID:", user?.id);
  }, [user]);

  const displayName = user?.user_metadata?.user_name || 
                   user?.user_metadata?.name ||
                   user?.user_metadata?.full_name ||
                   user?.email?.split('@')[0] ||
                   "User";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10,10,10,0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-mono text-xl font-bold text-white">
            Task<span className="text-purple-500">.level</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
          <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>

            {user && (
              <Link
              to={`/my-lists/${user?.id}`}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  signInWithGitHub();
                }
              }}>
                  My Lists
                </Link>
            )}

            <Link
              to="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>

            <Link
              to="/lists"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Lists
            </Link>
            
            {user && (
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
            )}

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
                  onClick={async () => {
                    await signOut();
                  }}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={signInWithGitHub}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
                  </svg>
                  GitHub
                </button>
                <button
                  onClick={signInWithGoogle}
                  className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
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
              to="/"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            {user && (
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
            )}

            {user && (
            <Link
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              to={`/my-lists/${user?.id}`}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  signInWithGitHub();
                }
                setMenuOpen(false);
              }}
            >
              My Lists
            </Link>
            )}

            <Link
              to="/leaderboard"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Leaderboard
            </Link>

            <Link
              to="/lists"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Lists
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
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Sign in with GitHub</span>
                  </button>
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
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
