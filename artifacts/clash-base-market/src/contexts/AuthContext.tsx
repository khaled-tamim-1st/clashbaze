import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const ADMIN_EMAIL = "owner@clashbaze.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    // Attach the current user's Firebase ID token to every API request as
    // `Authorization: Bearer <token>` so the server can verify admin writes.
    setAuthTokenGetter(() => userRef.current?.getIdToken() ?? null);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      userRef.current = u;
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
