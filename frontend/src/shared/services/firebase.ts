import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import config from "@/config/firebase-applet-config.json"
// Initialize Firebase
const app = initializeApp(config);
export const auth = getAuth(app);

// Initialize storage
const bucket = config.storageBucket || `${config.projectId}.firebasestorage.app`;
export const storage = getStorage(app, `gs://${bucket}`);

export const googleProvider = new GoogleAuthProvider();

export default app;
