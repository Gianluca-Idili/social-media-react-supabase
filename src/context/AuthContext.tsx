import { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase-client";

interface AuthContextType {
  user: User | null;
  signInWithGitHub: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
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
                email: user.email,
                username: user.user_metadata?.user_name || "",
              });
            }
          }
        });
      }, []);

    const signInWithGitHub = () => {
        supabase.auth.signInWithOAuth({provider: "github"})
    };

    const signOut = () => {
        supabase.auth.signOut();
    };

  return (
    <AuthContext.Provider value={{ user, signInWithGitHub, signOut}}>
        { children }
    
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used whithin the AuthProvider");
    }
    return context;
};
