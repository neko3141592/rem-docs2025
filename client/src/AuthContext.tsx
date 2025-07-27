import React, { createContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export interface UserState {
  user: any; // Replace 'any' with your user type if available
  uid: string | null;
  loading: boolean;
}

export const AuthContext = createContext<UserState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      setUser(firebaseUser);
      setLoading(false);
      console.log(firebaseUser ? `ログイン中: ${firebaseUser.email}` : '未ログイン');
    });

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(() => ({
    user,
    uid: user?.uid ?? null,
    loading,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};