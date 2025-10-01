
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration for "aula-digital-plus"
const firebaseConfig = {
  apiKey: "AIzaSyD_RZVvk6QIU0GIJewypdl50l-0dhAXJbM",
  authDomain: "aula-digital-plus-ytiyf.firebaseapp.com",
  projectId: "aula-digital-plus-ytiyf",
  storageBucket: "aula-digital-plus-ytiyf.firebasestorage.app",
  messagingSenderId: "838099933524",
  appId: "1:838099933524:web:0e593e08f4dbc6bb5dd0c1"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
