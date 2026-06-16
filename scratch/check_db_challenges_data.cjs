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
  const querySnapshot = await getDocs(collection(db, "retos"));
  console.log(`Encontrados ${querySnapshot.size} retos.`);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`Reto ID: ${doc.id}`);
    console.log(`- title: ${data.title}`);
    console.log(`- start_date: ${data.start_date} (${typeof data.start_date})`);
    console.log(`- end_date: ${data.end_date} (${typeof data.end_date})`);
    console.log(`- daily_target: ${data.daily_target}`);
    console.log(`- target: ${data.target}`);
    console.log(`- unit: ${data.unit}`);
  });
}

run().catch(console.error);
