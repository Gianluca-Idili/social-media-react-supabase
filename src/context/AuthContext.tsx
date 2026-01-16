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

  const syncProfile = async (user: User) => {
    try {
      console.log("🔄 Sincronizzazione profilo per:", user.email);
      let usernameFromMeta = "";
      let avatarUrl = "";
      
      if (user.app_metadata?.provider === "github") {
        usernameFromMeta = user.user_metadata?.user_name || user.user_metadata?.preferred_username || "";
        avatarUrl = user.user_metadata?.avatar_url || "";
      } else if (user.app_metadata?.provider === "google") {
        usernameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || "";
        avatarUrl = user.user_metadata?.picture || "";
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id, avatar_url, username")
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("❌ Errore fetch profilo:", fetchError);
        return;
      }

      if (!existingProfile) {
        console.log("✨ Creazione nuovo profilo...");
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email || "",
          username: usernameFromMeta || user.email?.split('@')[0] || "User",
          avatar_url: avatarUrl,
        });
        if (insertError) console.error("❌ Errore insert profilo:", insertError);
      } else {
        // Update only if avatar is different or username is missing
        const updates: any = {};
        if (avatarUrl && existingProfile.avatar_url !== avatarUrl) {
          updates.avatar_url = avatarUrl;
        }
        
        if (Object.keys(updates).length > 0) {
          console.log("📝 Aggiornamento profilo con:", updates);
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id);
          if (updateError) console.error("❌ Errore update profilo:", updateError);
        }
      }
    } catch (err) {
      console.error("⚠️ Eccezione improvvisa in syncProfile:", err);
    }
  };

  useEffect(() => {
    // 1. Controlla lo stato iniziale
    const initializeAuth = async () => {
      console.log("🔑 Inizializzazione Auth...");
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      console.log("👤 User iniziale:", currentUser?.id || "Nessuno");
      setUser(currentUser);

      if (currentUser) {
        syncProfile(currentUser); // Non attendiamo per non bloccare l'app
      }
    };

    // 2. Listener per cambiamenti in tempo reale
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth Event:", event);
        const currentUser = session?.user ?? null;
        console.log("👤 Current User state:", currentUser?.id || "Nessuno");
        setUser(currentUser);
        
        if (currentUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          syncProfile(currentUser); // Non attendiamo per non bloccare l'app
        }
        
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