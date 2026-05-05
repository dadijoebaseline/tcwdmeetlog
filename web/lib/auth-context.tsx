'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'attendee' | 'hr' | null;

export interface AuthUser extends User {
  role?: UserRole;
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role and additional data from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const authUser: AuthUser = {
              ...firebaseUser,
              role: userData.role,
              department: userData.department,
              position: userData.position,
            };
            setUser(authUser);
            setRole(userData.role);
          } else {
            // User data not created yet
            setUser(firebaseUser as AuthUser);
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
