import { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { toast } from "react-toastify";

interface AuthContextType {
  user: User | null;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>; // Modificato per ritornare Promise
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Controlla lo stato di autenticazione iniziale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);
  
      if (user) {
        // Check if profile exists
        const { error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();
  
        if (error && error.code === "PGRST116") {
          // No profile found → create one
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email || "",
            username: user.user_metadata?.user_name || "",
          });
        }
      }
    });

    // Aggiungi listener per i cambiamenti di autenticazione
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Errore durante il login con GitHub");
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Forza il refresh della pagina dopo il logout
      window.location.reload();
    } catch (error) {
      toast.error("Errore durante il logout");
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGitHub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within the AuthProvider");
  }
  return context;
};