import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyAAqcFHJBJMtwkosehQOnY6BKqLJqbFhF8",
  authDomain:        "bill-breaker-55fd2.firebaseapp.com",
  projectId:         "bill-breaker-55fd2",
  storageBucket:     "bill-breaker-55fd2.firebasestorage.app",
  messagingSenderId: "514341239704",
  appId:             "1:514341239704:web:ca56b5f207f9a2115089ed",
  measurementId:     "G-5PH6W0YYC2",
};

// Prevent duplicate initialization in Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
