import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  FirebaseUser,
} from './firebase';
import { dataStore } from './dataStore';
import { UserProfile, UserRole } from '../types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsLocalUser: (emailInput?: string, nameInput?: string, roleInput?: UserRole) => void;
  signOutUser: () => Promise<void>;
  syncProfileToFirestore: (profile: Partial<UserProfile>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore upon authentication
  const syncUserFromFirestore = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const firestoreData = userSnap.data() as Partial<UserProfile>;
        dataStore.updateProfile({
          id: fbUser.uid,
          email: fbUser.email || firestoreData.email || 'user@virtuoso.io',
          fullName: firestoreData.fullName || fbUser.displayName || 'Virtuoso Member',
          avatarUrl: fbUser.photoURL || firestoreData.avatarUrl || undefined,
          role: firestoreData.role || 'apprentice',
          currentJobTitle: firestoreData.currentJobTitle || 'Junior Cloud Practitioner',
          targetJobTitle: firestoreData.targetJobTitle || 'Senior Cloud & DevOps Architect',
          organizationName: firestoreData.organizationName || 'Virtuoso Tech Enterprise',
        });
      } else {
        // First-time document creation in Firestore
        const currentState = dataStore.getState();
        const initialProfile: UserProfile = {
          ...currentState.currentUser,
          id: fbUser.uid,
          email: fbUser.email || 'user@virtuoso.io',
          fullName: fbUser.displayName || currentState.currentUser.fullName || 'Virtuoso Member',
          avatarUrl: fbUser.photoURL || undefined,
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, {
          id: initialProfile.id,
          userId: fbUser.uid,
          email: initialProfile.email,
          fullName: initialProfile.fullName,
          avatarUrl: initialProfile.avatarUrl || '',
          role: initialProfile.role,
          currentJobTitle: initialProfile.currentJobTitle,
          targetJobTitle: initialProfile.targetJobTitle,
          organizationName: initialProfile.organizationName || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        dataStore.updateProfile(initialProfile);
      }
    } catch (err) {
      console.warn('Firestore profile sync note:', err);
      // Ensure local state reflects signed-in identity even if remote doc write is pending
      dataStore.updateProfile({
        id: fbUser.uid,
        email: fbUser.email || 'user@virtuoso.io',
        fullName: fbUser.displayName || 'Virtuoso Member',
        avatarUrl: fbUser.photoURL || undefined,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        await syncUserFromFirestore(user);
      } else {
        // Restore local auth session if saved
        try {
          const storedLocalSession = localStorage.getItem('virtuoso_local_auth_session');
          if (storedLocalSession) {
            const parsed = JSON.parse(storedLocalSession);
            const mockFbUser = {
              uid: parsed.uid || 'usr-local-session',
              email: parsed.email || 'learner@virtuoso.io',
              displayName: parsed.fullName || 'Virtuoso Learner',
              photoURL: null,
              emailVerified: true,
              isAnonymous: false,
              tenantId: null,
              providerData: [],
            } as unknown as FirebaseUser;

            setFirebaseUser(mockFbUser);
            dataStore.updateProfile({
              id: mockFbUser.uid,
              email: mockFbUser.email || 'learner@virtuoso.io',
              fullName: mockFbUser.displayName || 'Virtuoso Learner',
              role: parsed.role || 'apprentice',
            });
          } else {
            setFirebaseUser(null);
          }
        } catch (e) {
          setFirebaseUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // If popup blocked or unsupported in iframe, fallback to redirect
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          throw redirectErr;
        }
      } else {
        throw err;
      }
    }
  };

  const signInAsLocalUser = (emailInput?: string, nameInput?: string, roleInput: UserRole = 'apprentice') => {
    const userEmail = emailInput && emailInput.trim() ? emailInput.trim() : 'learner@virtuoso.io';
    const userName = nameInput && nameInput.trim() ? nameInput.trim() : 'Virtuoso Learner';
    const localUid = 'usr-local-' + Date.now();

    const isOrg = ['training_provider', 'employer_mentor', 'programme_admin'].includes(roleInput);
    dataStore.updateProfile({
      id: localUid,
      email: userEmail,
      fullName: userName,
      role: roleInput,
      roleCategory: isOrg ? 'organization' : 'individual',
      currentJobTitle: roleInput === 'apprentice' ? 'Junior Cloud Practitioner' : 'Technical Lead & Mentor',
      targetJobTitle: 'Senior Cloud & DevOps Architect',
      organizationName: 'Virtuoso Tech Enterprise',
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });

    const mockFbUser = {
      uid: localUid,
      email: userEmail,
      displayName: userName,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: [{ providerId: 'google.com', email: userEmail, uid: userEmail, displayName: userName, photoURL: null, phoneNumber: null }],
    } as unknown as FirebaseUser;

    try {
      localStorage.setItem(
        'virtuoso_local_auth_session',
        JSON.stringify({ email: userEmail, fullName: userName, role: roleInput, uid: localUid })
      );
    } catch (e) {
      // ignore
    }

    setFirebaseUser(mockFbUser);
  };

  const signOutUser = async () => {
    try {
      localStorage.removeItem('virtuoso_local_auth_session');
    } catch (e) {
      // ignore
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    setFirebaseUser(null);
  };

  const syncProfileToFirestore = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error saving profile to Firestore:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        loading,
        signInWithGoogle,
        signInAsLocalUser,
        signOutUser,
        syncProfileToFirestore,
        isAuthenticated: !!firebaseUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
