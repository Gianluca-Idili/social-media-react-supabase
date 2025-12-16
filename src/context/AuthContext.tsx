import { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { toast } from "react-toastify";

interface AuthContextType {
  user: User | null;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Controlla lo stato iniziale
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        await handleProfileCreation(user);
      }
    };

    // 2. Listener per cambiamenti in tempo reale
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Forza cleanup completo su logout
        if (event === 'SIGNED_OUT') {
          clearAuthState();
        }
      }
    );

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleProfileCreation = async (user: User) => {
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (error?.code === "PGRST116") {
      // Determina username in base al provider
      let username = "";
      if (user.app_metadata?.provider === "github") {
        username = user.user_metadata?.user_name || user.user_metadata?.preferred_username || "";
      } else if (user.app_metadata?.provider === "google") {
        username = user.user_metadata?.full_name || user.user_metadata?.name || "";
      }
      
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email || "",
        username: username,
      });
    }
  };

  const clearAuthState = () => {
    // Pulisci cache e storage
    localStorage.removeItem('sb-auth-token');
    sessionStorage.clear();
  };

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Login failed");
      console.error(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Login con Google fallito");
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearAuthState();
      
      // Soluzione ibrida per Vercel
      window.location.href = '/?logout=' + Date.now();
    } catch (error) {
      toast.error("Logout failed");
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGitHub, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};