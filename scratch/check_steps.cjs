// Diagnostic script to query Firestore for 'prueba 1' and 'prueba inmediata'
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

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

async function diagnose() {
  console.log("=== DIAGNÓSTICO DE BASE DE DATOS ===");

  // 1. Find user "prueba 1"
  const usersSnap = await getDocs(collection(db, "usuarios"));
  let targetUser = null;
  usersSnap.forEach(doc => {
    const u = doc.data();
    const fullName = `${u.name || ''} ${u.lastname || ''}`.toLowerCase();
    if (fullName.includes("prueba 1") || (u.name && u.name.toLowerCase().includes("prueba 1"))) {
      targetUser = { id: doc.id, ...u };
    }
  });

  if (!targetUser) {
    console.log("❌ No se encontró ningún usuario con nombre 'prueba 1'");
    // Print all users to help identify
    console.log("Usuarios en la base de datos:");
    usersSnap.forEach(doc => {
      const u = doc.data();
      console.log(`- ID: ${doc.id} | Nombre: ${u.name} ${u.lastname || ''} | Email: ${u.email}`);
    });
    process.exit(0);
  }

  console.log(`\n👤 Usuario Encontrado:`);
  console.log(`- ID: ${targetUser.id}`);
  console.log(`- Nombre: ${targetUser.name} ${targetUser.lastname || ''}`);
  console.log(`- Email: ${targetUser.email}`);
  console.log(`- Puntos: ${targetUser.points}`);
  console.log(`- Historial de pasos diarios:`, targetUser.daily_steps_history);

  // 2. Find challenge "prueba inmediata"
  const retosSnap = await getDocs(collection(db, "retos"));
  let targetChallenge = null;
  retosSnap.forEach(doc => {
    const r = doc.data();
    if (r.title && r.title.toLowerCase().includes("inmediata")) {
      targetChallenge = { id: doc.id, ...r };
    }
  });

  if (!targetChallenge) {
    console.log("\n❌ No se encontró ningún reto con título que contenga 'inmediata'");
    console.log("Retos en la base de datos:");
    retosSnap.forEach(doc => {
      const r = doc.data();
      console.log(`- ID: ${doc.id} | Título: ${r.title} | Objetivo: ${r.target} ${r.unit}`);
    });
    process.exit(0);
  }

  console.log(`\n🏆 Reto Encontrado:`);
  console.log(`- ID: ${targetChallenge.id}`);
  console.log(`- Título: ${targetChallenge.title}`);
  console.log(`- Objetivo: ${targetChallenge.target} ${targetChallenge.unit}`);
  console.log(`- Vigencia: ${targetChallenge.start_date} al ${targetChallenge.end_date}`);

  // 3. Query user enrollment (user_challenges) for this user and challenge
  const enrollQuery = query(
    collection(db, "user_challenges"),
    where("user_id", "==", targetUser.id),
    where("challenge_id", "==", targetChallenge.id)
  );
  const enrollSnap = await getDocs(enrollQuery);

  if (enrollSnap.empty) {
    console.log(`\n❌ El usuario no está inscrito en este reto en 'user_challenges'`);
  } else {
    const enroll = enrollSnap.docs[0].data();
    console.log(`\n📋 Inscripción en Reto (user_challenges):`);
    console.log(`- Progreso Registrado: ${enroll.progress}`);
    console.log(`- Estado: ${enroll.status}`);
    console.log(`- Sincronizaciones Diarias Guardadas (daily_syncs):`, enroll.daily_syncs);
  }

  // 4. Query evidences for this user and challenge
  const evQuery = query(
    collection(db, "evidencias"),
    where("user_id", "==", targetUser.id),
    where("challenge_id", "==", targetChallenge.id)
  );
  const evSnap = await getDocs(evQuery);
  if (evSnap.empty) {
    console.log(`\n📷 No se encontraron evidencias asociadas (cargas manuales/sincronizaciones con aprobación).`);
  } else {
    console.log(`\n📷 Evidencias encontradas (${evSnap.size}):`);
    evSnap.forEach(doc => {
      const ev = doc.data();
      console.log(`- ID Evidencia: ${doc.id}`);
      console.log(`  - Estado: ${ev.status}`);
      console.log(`  - Valor reportado: ${ev.value}`);
      console.log(`  - Fecha: ${ev.date}`);
      console.log(`  - Tipo de actividad: ${ev.activity_type || 'manual'}`);
    });
  }
}

diagnose().catch(err => console.error("Error al diagnosticar:", err));
