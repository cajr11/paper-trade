import { useStorageState } from "@/hooks/useStorageState";
import { use, createContext, type PropsWithChildren } from "react";

const AuthContext = createContext<{
  login: () => void;
  logout: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  login: () => null,
  logout: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const ctx = use(AuthContext);

  if (!ctx) {
    throw new Error("useSession must be wrapped in a session provider");
  }

  return ctx;
}

export default function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        login: () => {
          // Perform sign-in logic here
          setSession("");
        },
        logout: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
