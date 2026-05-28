import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAVEeeMxVxnZNpLmQnyaTOD9UGOVSTsKuk",
  authDomain: "retoactivo.firebaseapp.com",
  projectId: "retoactivo",
  storageBucket: "retoactivo.firebasestorage.app",
  messagingSenderId: "843317552429",
  appId: "1:843317552429:web:c82b047ea9b4c2f16d1fa4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
