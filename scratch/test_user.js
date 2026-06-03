import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVEeeMxVxnZNpLmQnyaTOD9UGOVSTsKuk",
  authDomain: "retoactivo.firebaseapp.com",
  projectId: "retoactivo",
  storageBucket: "retoactivo.firebasestorage.app",
  messagingSenderId: "843317552429",
  appId: "1:843317552429:web:c82b047ea9b4c2f16d1fa4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Buscando admin@acme.com...");
  try {
    const q = query(collection(db, "usuarios"), where("email", "==", "admin@acme.com"));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log("No se encontró ningún usuario con ese email.");
    } else {
      snap.forEach(doc => {
        console.log("Campos del usuario encontrado:");
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    }
  } catch (err) {
    console.error("Error buscando usuario:", err);
  }
}

test();
