import { useParams } from "react-router-dom";
import { CommunityDisplay } from "../components/communitys/CommunityDisplay";

export const CommunityPage = () => {
  const {id} = useParams<{id: string}>()
  return (
    <div className="pt-20">
      <CommunityDisplay communityId={Number(id)} />
    </div>
  );
};
