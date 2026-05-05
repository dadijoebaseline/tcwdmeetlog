import { UserProfile } from './auth-context';
import { db } from './firebase';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  QueryConstraint,
} from 'firebase/firestore';

/**
 * Fetch user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? (userDocSnap.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Get all users (HR only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => doc.data() as UserProfile);
    return users.sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a client-side filter approach
    const allUsers = await getAllUsers();
    const term = searchTerm.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => doc.data() as UserProfile);
    return users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  hrCount: number;
  attendeeCount: number;
}> {
  try {
    const allUsers = await getAllUsers();
    const hrCount = allUsers.filter((u) => u.role === 'hr').length;
    const attendeeCount = allUsers.filter((u) => u.role === 'attendee').length;

    return {
      totalUsers: allUsers.length,
      hrCount,
      attendeeCount,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Change user role (HR only)
 */
export async function changeUserRole(uid: string, newRole: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    throw error;
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUser(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

/**
 * Delete user document from Firestore
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
