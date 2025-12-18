import { useAuth } from "@/contexts/auth-context";

export function useAdmin() {
  const { user } = useAuth();
  return {
    isAdmin: user?.isAdmin === true,
    isSuperuser: user?.isSuperuser === true,
    user
  };
}
