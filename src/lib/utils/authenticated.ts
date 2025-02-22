import { useAuth } from "@/lib/store/auth-store";

export function isAuthenticated(): boolean {
  const user = useAuth.getState().user;
  return !!user;
}

export function requireAuthentication(): boolean | never {
  if (!isAuthenticated()) {
    throw new Error("Authentication required");
  }
  return true;
} 