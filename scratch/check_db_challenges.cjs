const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function run() {
  const querySnapshot = await getDocs(collection(db, "user_challenges"));
  console.log(`Encontradas ${querySnapshot.size} inscripciones.`);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`Inscripción ID: ${doc.id}`);
    console.log(`- user_id: ${data.user_id}`);
    console.log(`- challenge_id: ${data.challenge_id}`);
    console.log(`- enrolled_at type: ${typeof data.enrolled_at}`, data.enrolled_at);
  });
}

run().catch(console.error);
