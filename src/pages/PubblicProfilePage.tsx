import { useParams, useEffect } from "react-router-dom";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { sendPushNotification } from "../utils/notifications";
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
          await sendPushNotification(profileId, {
            title: '👁️ Visita al profilo',
            body: `${visitorData.username} ha visitato il tuo profilo pubblico!`,
            tag: 'profile-visit',
          });
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