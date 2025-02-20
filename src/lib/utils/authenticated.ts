import { useAuth } from "@/lib/auth";

export function isAuthenticated(): boolean {
  const user = useAuth.getState().user;
  return user !== null;
}

export function requireAuthentication(): boolean | never {
  if (!isAuthenticated()) {
    throw new Error("Authentication required");
  }
  return true;
} 