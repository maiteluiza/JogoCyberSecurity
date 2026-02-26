import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

let app
try {
  if (!cfg.apiKey) throw new Error('Missing VITE_FIREBASE_API_KEY')
  app = initializeApp(cfg)
} catch (e) {
  console.warn('Firebase root init skipped or failed:', e.message)
}

export const db = app ? getFirestore(app) : null

if (db && import.meta.env.VITE_FIRESTORE_EMULATOR === 'true') {
  const host = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost'
  const port = parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || '8080')
  connectFirestoreEmulator(db, host, port)
}