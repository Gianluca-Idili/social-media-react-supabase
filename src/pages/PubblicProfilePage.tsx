import { useParams } from "react-router-dom";
import { PublicDetailProfile } from "../components/showDetails/PublicDetailProfile";

export const PublicProfilePage = () => {
  const { profileId } = useParams<{ profileId: string }>();
  
  if (!profileId) {
    return <div>Errore: ID profilo mancante</div>;
  }

  return <PublicDetailProfile profileId={profileId} />;
};