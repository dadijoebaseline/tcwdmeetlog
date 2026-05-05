'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export type UserRole = 'attendee' | 'hr' | null;

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  position?: string;
  photoURL?: string;
  digitalSignature?: string; // User's digital signature (can be handwriting or initials)
  createdAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
}

export interface AuthUser extends User {
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            setProfile(userData);
            setRole(userData.role || null);
            setUser({
              ...firebaseUser,
              profile: userData,
            } as AuthUser);

            // Update last login time
            await updateDoc(userDocRef, {
              lastLoginAt: new Date().toISOString(),
            }).catch(console.error);
          } else {
            setUser(firebaseUser as AuthUser);
            setProfile(null);
            setRole(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(firebaseUser as AuthUser);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setRole(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No authenticated user');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userDocRef, updateData);

      // Update local state
      const updatedProfile = { ...profile, ...updateData } as UserProfile;
      setProfile(updatedProfile);

      if (data.role) {
        setRole(data.role);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, logout, updateProfile, hasRole }}>
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

// Hook for requiring authentication
export function useRequireAuth(requiredRole?: UserRole | UserRole[]) {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // User not authenticated - redirect will be handled by ProtectedRoute
      return;
    }

    if (!loading && requiredRole && !user) {
      return;
    }
  }, [user, loading, requiredRole]);

  return { user, role, loading };
}

