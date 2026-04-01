import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const signUpWithEmail = (email: string, pass: string) => 
  createUserWithEmailAndPassword(auth, email, pass);

export const signInWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const signInWithGoogle = () => 
  signInWithPopup(auth, googleProvider);

export const signIn = signInWithGoogle;

export const signOut = () => 
  firebaseSignOut(auth);

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => 
  onAuthStateChanged(auth, callback);
