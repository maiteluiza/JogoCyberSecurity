import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  addDoc,
  onSnapshot,
  updateDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  connectFirestoreEmulator
} from 'firebase/firestore'

let db = null

export function initFirebase(config) {
  try {
    const app = initializeApp(config)
    db = getFirestore(app)
    console.log('Firebase initialized for project:', config.projectId)
    return db
  } catch (err) {
    console.warn('Firebase init failed', err)
    return null
  }
}

// Auto-init when env vars are present (convenience for the app)
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    initFirebase({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    })

    if (import.meta.env.VITE_FIRESTORE_EMULATOR === 'true') {
      const host = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost'
      const port = parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || '8080')
      connectFirestoreEmulator(db, host, port)
      console.log('Connected to Firestore emulator', host, port)
    }
  } catch (e) {
    // ignore — app can still initialize later
  }
}

function ensureDb() {
  return db
}

export function isInitialized() {
  return !!db
}

// Rooms
export async function createRoom(roomId, metadata = {}) {
  const firestore = ensureDb()
  if (!firestore) {
    console.error('createRoom: Firestore not initialized (db is null)')
    return null
  }
  const roomRef = doc(firestore, 'rooms', roomId)
  const payload = {
    hostId: metadata.hostId || null,
    phase: 'chat',
    roundActive: false,
    endTime: null,
    createdAt: serverTimestamp(),
    ...metadata
  }
  await setDoc(roomRef, payload)
  return roomRef
}

export function subscribeToRoom(roomId, cb) {
  const firestore = ensureDb()
  if (!firestore) return () => {}
  const ref = doc(firestore, 'rooms', roomId)
  return onSnapshot(ref, snap => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function getRoom(roomId) {
  const firestore = ensureDb()
  if (!firestore) {
    console.error('getRoom: Firestore not initialized')
    return null
  }
  try {
    const r = await getDoc(doc(firestore, 'rooms', roomId))
    if (!r.exists()) {
      console.warn('getRoom: room not found', roomId)
      return null
    }
    return { id: r.id, ...r.data() }
  } catch (err) {
    console.error('getRoom: error reading room', roomId, err)
    return null
  }
}

export async function updateRoomField(roomId, data) {
  const firestore = ensureDb()
  if (!firestore) return null
  const ref = doc(firestore, 'rooms', roomId)
  await updateDoc(ref, data)
}

// Players
export async function addPlayerToRoom(roomId, player) {
  const firestore = ensureDb()
  if (!firestore) {
    console.error('addPlayerToRoom: Firestore not initialized')
    return null
  }
  try {
    const playersCol = collection(firestore, `rooms/${roomId}/players`)
    const docRef = await addDoc(playersCol, { ...player })
    console.log('addPlayerToRoom: added player', docRef.id, 'to room', roomId)
    return docRef
  } catch (err) {
    console.error('addPlayerToRoom: failed to add player to', roomId, err)
    return null
  }
}

export function subscribeToPlayers(roomId, cb) {
  const firestore = ensureDb()
  if (!firestore) return () => {}
  const players = collection(firestore, `rooms/${roomId}/players`)
  return onSnapshot(players, snap => {
    const list = []
    snap.docs.forEach(d => list.push({ id: d.id, ...d.data() }))
    cb(list)
  })
}

export async function getPlayers(roomId) {
  const firestore = ensureDb()
  if (!firestore) return []
  try {
    const playersCol = collection(firestore, `rooms/${roomId}/players`)
    const snap = await getDocs(playersCol)
    const list = []
    snap.docs.forEach(d => list.push({ id: d.id, ...d.data() }))
    return list
  } catch (err) {
    console.error('getPlayers failed', err)
    return []
  }
}

export async function updatePlayer(roomId, playerId, data) {
  const firestore = ensureDb()
  if (!firestore) return null
  const ref = doc(firestore, 'rooms', roomId, 'players', playerId)
  await updateDoc(ref, data)
}

// Chats (each message is a document in rooms/{roomId}/chats)
export async function sendChat(roomId, message) {
  const firestore = ensureDb()
  if (!firestore) return null
  const msgs = collection(firestore, `rooms/${roomId}/chats`)
  return await addDoc(msgs, { ...message, timestamp: serverTimestamp() })
}

export function subscribeToChats(roomId, cb) {
  const firestore = ensureDb()
  if (!firestore) return () => {}
  const msgsCol = collection(firestore, `rooms/${roomId}/chats`)
  const q = query(msgsCol, orderBy('timestamp'))
  return onSnapshot(q, snap => {
    const messages = []
    snap.docs.forEach(d => messages.push({ id: d.id, ...d.data() }))
    cb(messages)
  })
}

export default {
  initFirebase,
  createRoom,
  subscribeToRoom,
  getRoom,
  updateRoomField,
  addPlayerToRoom,
  subscribeToPlayers,
  updatePlayer,
  sendChat,
  subscribeToChats
}
