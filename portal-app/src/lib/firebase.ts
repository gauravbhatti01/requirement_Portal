import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyCztvWhMpuOZdQcsd1B-BmR45q2qdMxOxo",
  authDomain:        "requirement-92cc9.firebaseapp.com",
  projectId:         "requirement-92cc9",
  storageBucket:     "requirement-92cc9.firebasestorage.app",
  messagingSenderId: "267418999019",
  appId:             "1:267418999019:web:41c72cd85b1e1df78946ae",
  measurementId:     "G-YHVJRCYTQ4",
};

// Prevent duplicate initialization in Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
