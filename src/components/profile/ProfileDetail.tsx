import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../supabase-client";
import { ProfileItem } from "./ProfileItem";
import { ProfileForm } from "./ProfileForm";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";

export interface Profile {
  id: string;
  username: string;
  email: string;
  points: number;
  created_at: string;
  avatar_url?: string;
}

interface Props {
  profileId: string;
}





const fetchProfileById = async (id: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
};



export const ProfileDetail = ({ profileId }: Props) => {
  const location = useLocation();


  const [isEditing, setIsEditing] = useState(false);

  const toastId = React.useRef<string | number | null>(null); // <-- Qui il fix

  useEffect(() => {
    if (location.state?.showToast) {
      if (!toastId.current || !toast.isActive(toastId.current)) {
        toastId.current = toast.success(
          <span className="gradient-text">Lista creata con successo!</span>
        );
        window.history.replaceState({}, "");
      }
    }
  }, [location.state]);

  const {
    data: profileData,
    error: profileError,
    isPending: isProfilePending,
  } = useQuery<Profile, Error>({
    queryKey: ["profile", profileId],
    queryFn: () => fetchProfileById(profileId),
  });

  

  if (isProfilePending)
    return <div className="text-center py-8">Caricamento profilo...</div>;

  if (profileError)
    return (
      <div className="text-center py-8 text-red-400">
        Errore: {profileError.message}
      </div>
    );

  if (!profileData)
    return (
      <div className="text-center py-8">Nessun dato del profilo trovato</div>
    );

  

  

  

  

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {isEditing ? (
        <ProfileForm
          profileId={profileId}
          initialData={{
            username: profileData?.username || "",
            email: profileData?.email || "",
          }}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent break-words overflow-hidden">
            Profilo di {profileData?.username || "Non hai un username"} =D
          </h2>

          <div>
            <ProfileItem
              username={profileData?.username || ""}
              email={profileData?.email || ""}
              points={profileData?.points || 0}
              createdAt={profileData?.created_at || ""}
              avatarUrl={profileData?.avatar_url}
              onEdit={() => setIsEditing(true)}
            />
          </div>
        </>
      )}
    </div>
  );
};
