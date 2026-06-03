import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  console.log("Intentando conectar a Firestore...");
  try {
    const snap = await getDocs(collection(db, "usuarios"));
    console.log("¡Conexión exitosa! Usuarios encontrados:", snap.size);
    snap.forEach(doc => {
      console.log(`- ID: ${doc.id}, Email: ${doc.data().email}, PasswordHash: ${doc.data().password_hash || 'Ninguno'}`);
    });
  } catch (err) {
    console.error("Error conectando a Firestore:", err);
  }
}

test();
