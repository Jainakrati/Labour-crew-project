import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

console.log("Firebase Initializing with Project ID:", firebaseConfig.projectId);
console.log("Using Firestore Database ID:", (firebaseConfig as any).firestoreDatabaseId || '(default)');

const app = initializeApp(firebaseConfig);

// Use initializeFirestore to enable experimentalForceLongPolling for better connectivity in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const auth = getAuth(app);
