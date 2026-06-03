import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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

// Initialize Firestore with persistent local cache (offline data) and multi-tab synchronization
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
export const storage = getStorage(app);
