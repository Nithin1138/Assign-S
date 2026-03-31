import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// @ts-ignore
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize storage
const bucket = firebaseConfig.storageBucket || `${firebaseConfig.projectId}.firebasestorage.app`;
export const storage = getStorage(app, `gs://${bucket}`);

export const googleProvider = new GoogleAuthProvider();

export default app;
