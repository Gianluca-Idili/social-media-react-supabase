import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { notifyUser } from "../utils/notifications";
import { PublicDetailProfile } from "../components/showDetails/PublicDetailProfile";

export const PublicProfilePage = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { user } = useAuth();
  
  useEffect(() => {
    // Notifica il proprietario del profilo che qualcuno lo sta visitando
    if (profileId && user && profileId !== user.id) {
      const notifyVisit = async () => {
        const { data: visitorData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (visitorData?.username) {
          await notifyUser.profileVisit(profileId, visitorData.username, user.id);
        }
      };

      // Manda la notifica con un piccolo delay per evitare spam
      const timeout = setTimeout(() => {
        notifyVisit().catch(err => console.log('Notifica visita non inviata:', err));
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [profileId, user?.id]);
  
  if (!profileId) {
    return <div>Errore: ID profilo mancante</div>;
  }

  return <PublicDetailProfile profileId={profileId} />;
};