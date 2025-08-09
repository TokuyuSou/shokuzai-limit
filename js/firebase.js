// js/firebase.js (minimal, CDN/ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let app, auth, db;
let authCallbacks = [];

// ---- Your Firebase config (from Console) ----
// NOTE: storageBucket should be '<project-id>.appspot.com'
const firebaseConfig = {
  apiKey: "AIzaSyAGmf3e64fl1J_8nNJHZ5W8F-emIGOQNjQ",
  authDomain: "recipe-generator-91e1a.firebaseapp.com",
  projectId: "recipe-generator-91e1a",
  storageBucket: "recipe-generator-91e1a.appspot.com",
  messagingSenderId: "671033178478",
  appId: "1:671033178478:web:9a8a3d25aa46c4e960a97f",
  measurementId: "G-ND1GR2J8NH"
};

export function initFirebase(){
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, (user)=> authCallbacks.forEach(cb=>cb(user || null)));
}

export function getDB(){ return db; }
export function getAuthInstance(){ return auth; }

export async function signInWithGoogle(){
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}
export async function signOutUser(){ await signOut(auth); }
export function onAuthChanged(cb){ authCallbacks.push(cb); }
