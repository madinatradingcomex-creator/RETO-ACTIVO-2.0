import webpush from 'web-push';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAVEeeMxVxnZNpLmQnyaTOD9UGOVSTsKuk",
  authDomain: "retoactivo.firebaseapp.com",
  projectId: "retoactivo",
  storageBucket: "retoactivo.firebasestorage.app",
  messagingSenderId: "843317552429",
  appId: "1:843317552429:web:c82b047ea9b4c2f16d1fa4"
};

// Avoid initializing multiple apps in serverless hot-reload contexts
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const messages = [
  "¡No te olvides de sincronizar tus pasos de hoy para mantener tu racha! 🏃‍♂️🔥",
  "Tus pasos de hoy te están esperando. ¡Sincronizá ahora y sumá puntos para tu equipo! 🏆",
  "¿Hiciste actividad hoy? Sincronizá tus pasos en un clic para no perder tu racha diaria. ⚡",
  "¡Quedan pocas horas para cerrar el día! Sincronizá tu Google Fit y asegura tus puntos. 🌟"
];

export default async function handler(req, res) {
  // 1. Cron secret protection in production
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Vercel backend reads private key; public key falls back to VITE public variable
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(500).json({ error: 'VAPID keys not configured in environment.' });
  }

  webpush.setVapidDetails(
    'mailto:soporte@retoactivo.com',
    vapidPublicKey,
    vapidPrivateKey
  );

  try {
    const usersSnap = await getDocs(collection(db, 'usuarios'));
    const pendingNotifications = [];
    const dbCleanupPromises = [];

    const today = new Date();
    // UTC-3 Timezone offset helper (Argentina/Brazil)
    const offset = -3;
    const localToday = new Date(today.getTime() + offset * 3600000);

    usersSnap.forEach(userDoc => {
      const user = { id: userDoc.id, ...userDoc.data() };
      
      if (!user.push_subscription || user.role !== 'employee') {
        return;
      }

      let hasSyncedToday = false;
      if (user.last_sync) {
        const lastSyncDate = new Date(user.last_sync);
        const localLastSync = new Date(lastSyncDate.getTime() + offset * 3600000);

        if (
          localToday.getUTCDate() === localLastSync.getUTCDate() &&
          localToday.getUTCMonth() === localLastSync.getUTCMonth() &&
          localToday.getUTCFullYear() === localLastSync.getUTCFullYear()
        ) {
          hasSyncedToday = true;
        }
      }

      if (!hasSyncedToday) {
        pendingNotifications.push(user);
      }
    });

    const results = {
      total_checked: usersSnap.size,
      pending_users: pendingNotifications.length,
      notified: 0,
      failed: 0,
      cleaned_subscriptions: 0
    };

    for (const user of pendingNotifications) {
      const payload = JSON.stringify({
        title: 'Sincronizá tus Pasos 🏃‍♂️',
        body: messages[Math.floor(Math.random() * messages.length)],
        url: '/'
      });

      try {
        await webpush.sendNotification(user.push_subscription, payload);
        results.notified++;
      } catch (err) {
        results.failed++;
        console.error(`Failed to send push to user ${user.id}:`, err.statusCode, err.message);
        
        // HTTP 410 (Gone) or 404 (Not Found) means subscription has expired/revoked
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Cleaning up expired subscription for user: ${user.id}`);
          const userRef = doc(db, 'usuarios', user.id);
          dbCleanupPromises.push(updateDoc(userRef, { push_subscription: null }));
          results.cleaned_subscriptions++;
        }
      }
    }

    // Wait for all DB cleanups to complete
    if (dbCleanupPromises.length > 0) {
      await Promise.all(dbCleanupPromises);
    }

    return res.status(200).json({
      success: true,
      results
    });
  } catch (err) {
    console.error("Cron notification error:", err);
    return res.status(500).json({ error: err.message });
  }
}
