import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

export const auth = getAuth(app);

// Enable local persistence so authentication state persists seamlessly across browser refreshes
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.debug('Firebase auth persistence configuration:', err?.message);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if configured
export const db: Firestore = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Connectivity check as required by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message?.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or unreachable.');
      return false;
    }
    // Any permission or missing doc response still verifies network connectivity to Firebase
    return true;
  }
}

// Immediately run non-blocking connectivity check
testFirestoreConnection().catch((err) => {
  console.debug('Firestore probe check initialized:', err?.message);
});

export {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
};
export type { FirebaseUser };
