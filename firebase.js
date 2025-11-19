// Firebase helper (browser/no-build, using Firebase v9 modular CDN)
// Usage: import functions in your page as a normal <script type="module"> or include with <script type="module" src="firebase.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

let app = null;
let db = null;

export function initFirebase() {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.warn('Firebase config not set. Copy firebase-config.sample.js to firebase-config.js and fill values.');
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized');
    return { app, db };
  } catch (err) {
    console.error('Failed to initialize Firebase', err);
    return null;
  }
}

export async function saveJournalToFirestore(journal) {
  if (!db) initFirebase();
  if (!db) throw new Error('Firestore not initialized');
  const col = collection(db, 'journals');
  const docRef = await addDoc(col, journal);
  return docRef.id;
}

export async function loadJournalsFromFirestore() {
  if (!db) initFirebase();
  if (!db) throw new Error('Firestore not initialized');
  const col = collection(db, 'journals');
  const q = query(col, orderBy('tanggal', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Subscribe to realtime changes. Returns unsubscribe function.
export function subscribeToJournals(onChange) {
  if (!db) initFirebase();
  if (!db) throw new Error('Firestore not initialized');
  const col = collection(db, 'journals');
  const q = query(col, orderBy('tanggal', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(data);
  }, (err) => {
    console.error('Firestore onSnapshot error', err);
  });
  return unsubscribe;
}

// Export default convenience object
export default {
  initFirebase,
  saveJournalToFirestore,
  loadJournalsFromFirestore,
  subscribeToJournals,
};
