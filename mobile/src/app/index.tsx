import LoadingScreen from "@/components/LoadingScreen";
import { useSession } from "@/providers/SessionProvider";
import { Redirect } from "expo-router";

export default function Unauthenticated() {
  const { isLoading, session } = useSession();

  if (isLoading) return <LoadingScreen />;
  if (!session) return <Redirect href="/login" />;
  return <Redirect href="/(authenticated)" />;
}
