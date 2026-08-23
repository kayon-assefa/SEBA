import { useParams } from "react-router-dom";
import { PublicBusinessPage } from "../../features/public-business";

export default function PublicBusinessRoute() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return null;
  }

  return <PublicBusinessPage />;
}
