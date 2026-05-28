import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// --- MOCKS INITIAL DATA FOR SEEDING ---
const INITIAL_PRESET_USERS = [
  {
    id: 'usr_2',
    name: 'Carlos',
    lastname: 'Benítez',
    email: 'carlos.benitez@acme.com',
    company_code: 'ACME2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    points: 650,
    department: 'Ventas',
    role: 'employee',
    level: 'Velocista Imparable ⚡',
    streak: 8,
    daily_steps_history: [7200, 9100, 11000, 8400, 12000, 6000, 500],
    status: 'approved'
  },
  {
    id: 'usr_3',
    name: 'Laura',
    lastname: 'Gómez',
    email: 'laura.gomez@acme.com',
    company_code: 'ACME2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    points: 580,
    department: 'Recursos Humanos',
    role: 'employee',
    level: 'Gurú de la Calma 🧘',
    streak: 12,
    daily_steps_history: [5000, 6200, 7500, 8000, 5100, 8200, 1200],
    status: 'approved'
  },
  {
    id: 'usr_4',
    name: 'Sofía',
    lastname: 'Martínez',
    email: 'sofia.martinez@acme.com',
    company_code: 'ACME2026',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    points: 450,
    department: 'Tecnología',
    role: 'employee',
    level: 'Wellness Champion 🌟',
    streak: 5,
    daily_steps_history: [6200, 8400, 10200, 5100, 9200, 7100, 300],
    status: 'approved'
  }
];

const ADMIN_USER = {
  id: 'admin_1',
  name: 'Recursos Humanos Acme',
  lastname: 'Admin',
  email: 'admin@acme.com',
  company_code: 'ACME2026',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
  points: 0,
  department: 'Recursos Humanos',
  role: 'company',
  level: 'Administrador de Bienestar 🏢',
  status: 'approved'
};

const INITIAL_CHALLENGES = [
  {
    id: 'ch_1',
    title: 'Cruce de los Andes Virtual',
    description: 'Recorre un total de 50 kilómetros en bicicleta o caminando durante este mes para fomentar la movilidad activa. ¡Sincroniza tu app de salud o sube tu captura de Strava, Garmin o Google Fit!',
    points: 350,
    category: 'mobility',
    target: 50,
    unit: 'km',
    duration: '30 días',
    participantsCount: 24,
    image: '🚴‍♀️'
  },
  {
    id: 'ch_2',
    title: 'Paso a Paso Saludable',
    description: 'Alcanza la meta de 10,000 pasos diarios durante una semana completa. Mantén tus pies en movimiento para mejorar tu resistencia cardiovascular.',
    points: 200,
    category: 'sky',
    target: 70000,
    unit: 'pasos',
    duration: '7 días',
    participantsCount: 42,
    image: '🚶‍♂️'
  }
];

const INITIAL_REWARDS = [
  {
    id: 'rw_1',
    title: 'Desayuno Saludable Gourmet',
    description: 'Un increíble desayuno fresco enviado directamente a tu oficina o casa.',
    points_cost: 300,
    stock: 8,
    category: 'Alimentación',
    icon: '🥑'
  }
];

const getLocalUser = () => {
  const u = localStorage.getItem('ra_current_user');
  return u ? JSON.parse(u) : null;
};
const setLocalUser = (u) => {
  if (u) localStorage.setItem('ra_current_user', JSON.stringify(u));
  else localStorage.removeItem('ra_current_user');
};

export const dbService = {
  async seedDatabase() {
    try {
      const usersSnap = await getDocs(collection(db, 'usuarios'));
      if (usersSnap.empty) {
        for (const u of [...INITIAL_PRESET_USERS, ADMIN_USER]) {
          await setDoc(doc(db, 'usuarios', u.id), u);
        }
        for (const c of INITIAL_CHALLENGES) {
          await setDoc(doc(db, 'retos', c.id), c);
        }
        for (const r of INITIAL_REWARDS) {
          await setDoc(doc(db, 'rewards', r.id), r);
        }
        console.log('Database seeded with initial data.');
      }
    } catch(err) {
      console.error("Error seeding DB:", err);
    }
  },

  async getCurrentUser() {
    const local = getLocalUser();
    if (!local) return null;
    try {
      const docSnap = await getDoc(doc(db, 'usuarios', local.id));
      if (docSnap.exists()) {
        const u = docSnap.data();
        setLocalUser(u);
        return u;
      }
    } catch(err) { console.error(err); }
    return null;
  },

  async loginWithCompanyCode(email, companyCode) {
    await this.seedDatabase(); // Ensure seeded on first login attempt
    
    try {
      const q = query(
        collection(db, 'usuarios'), 
        where('email', '==', email.toLowerCase()), 
        where('company_code', '==', companyCode.toUpperCase())
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const user = snap.docs[0].data();
        setLocalUser(user);
        return user;
      }
    } catch(err) { console.error(err); }
    return null;
  },

  async registerUser(name, lastname, email, companyCode, department) {
    const newId = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: newId,
      name,
      lastname,
      email: email.toLowerCase(),
      company_code: companyCode.toUpperCase(),
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120',
      points: 100,
      department,
      role: 'employee',
      level: 'Wellness Principiante 🌱',
      streak: 1,
      daily_steps_history: [0, 0, 0, 0, 0, 0, 0],
      status: 'pending'
    };

    try {
      await setDoc(doc(db, 'usuarios', newId), newUser);
      setLocalUser(newUser);
      return newUser;
    } catch(err) { console.error(err); }
    return null;
  },

  async getPendingUsers() {
    try {
      const q = query(collection(db, 'usuarios'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch(err) { console.error(err); return []; }
  },

  async approveUser(userId) {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { status: 'approved' });
      return true;
    } catch(err) { console.error(err); return false; }
  },

  async rejectUser(userId) {
    try {
      await deleteDoc(doc(db, 'usuarios', userId));
      return true;
    } catch(err) { console.error(err); return false; }
  },

  async logout() {
    setLocalUser(null);
  },

  async getPresetUsers() {
    try {
      const snap = await getDocs(collection(db, 'usuarios'));
      return snap.docs.map(d => d.data()).filter(u => u.role === 'employee');
    } catch(err) { console.error(err); return []; }
  },

  async updateUserStats(userId, pointsAdded, stepsToday = 0) {
    try {
      const ref = doc(db, 'usuarios', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const u = snap.data();
        let newPoints = (u.points || 0) + pointsAdded;
        let hist = u.daily_steps_history || [0,0,0,0,0,0,0];
        if (stepsToday > 0) {
          hist[hist.length - 1] += stepsToday;
        }
        await updateDoc(ref, { points: newPoints, daily_steps_history: hist });
        const local = getLocalUser();
        if (local && local.id === userId) {
          local.points = newPoints;
          local.daily_steps_history = hist;
          setLocalUser(local);
        }
      }
    } catch(err) { console.error(err); }
  },

  async getChallenges() {
    try {
      const snap = await getDocs(collection(db, 'retos'));
      return snap.docs.map(d => d.data());
    } catch(err) { console.error(err); return []; }
  },

  async getRewards() {
    try {
      const snap = await getDocs(collection(db, 'rewards'));
      return snap.docs.map(d => d.data());
    } catch(err) { console.error(err); return []; }
  },

  async getUserChallenges(userId) {
    try {
      const q = query(collection(db, 'user_challenges'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch(err) { console.error(err); return []; }
  },

  async enrollInChallenge(userId, challengeId) {
    try {
      const q = query(collection(db, 'user_challenges'), where('user_id', '==', userId), where('challenge_id', '==', challengeId));
      const snap = await getDocs(q);
      if (snap.empty) {
        const newEnrollment = {
          user_id: userId,
          challenge_id: challengeId,
          progress: 0,
          status: 'active',
          enrolled_at: new Date().toISOString()
        };
        await addDoc(collection(db, 'user_challenges'), newEnrollment);
        
        const cRef = doc(db, 'retos', challengeId);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          await updateDoc(cRef, { participantsCount: (cSnap.data().participantsCount || 0) + 1 });
        }
      }
      return await this.getUserChallenges(userId);
    } catch(err) { console.error(err); return []; }
  },

  async logChallengeProgress(userId, challengeId, amount, screenshotFile = null, screenshotUrlMock = '') {
    try {
      const q = query(collection(db, 'user_challenges'), where('user_id', '==', userId), where('challenge_id', '==', challengeId));
      const snap = await getDocs(q);
      if (snap.empty) return { error: "No estás inscrito." };
      
      const enrollDoc = snap.docs[0];
      const enrollment = enrollDoc.data();
      
      const cRef = doc(db, 'retos', challengeId);
      const cSnap = await getDoc(cRef);
      if (!cSnap.exists()) return { error: "Reto no encontrado." };
      const challengeObj = cSnap.data();

      const currentUser = getLocalUser();
      const userFullName = currentUser ? `${currentUser.name} ${currentUser.lastname || ''}` : 'Anónimo';

      if (screenshotFile || screenshotUrlMock) {
        let finalUrl = screenshotUrlMock || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=300';
        if (screenshotFile) {
          try {
            const storageRef = ref(storage, `evidencias/${Date.now()}_${screenshotFile.name}`);
            await uploadBytes(storageRef, screenshotFile);
            finalUrl = await getDownloadURL(storageRef);
          } catch(err) {
            console.error("Error uploading image:", err);
          }
        }
        const newEvidence = {
          id: `ev_${Math.random().toString(36).substr(2, 9)}`,
          challenge_id: challengeId,
          user_id: userId,
          user_name: userFullName,
          type: challengeObj.category,
          activity_type: 'manual',
          status: 'pending',
          points_awarded: challengeObj.points,
          value: parseFloat(amount),
          screenshot_url: finalUrl,
          date: new Date().toISOString()
        };
        await setDoc(doc(db, 'evidencias', newEvidence.id), newEvidence);
        return { pendingApproval: true, message: "Enviado a RRHH." };
      }

      const newProgress = parseFloat(enrollment.progress) + parseFloat(amount);
      let completedNow = false;
      let pointsAdded = 0;

      if (newProgress >= challengeObj.target && enrollment.status !== 'completed') {
        await updateDoc(enrollDoc.ref, { progress: challengeObj.target, status: 'completed' });
        completedNow = true;
        pointsAdded = challengeObj.points;
        await this.updateUserStats(userId, pointsAdded, challengeObj.unit === 'pasos' ? amount : 0);
      } else {
        await updateDoc(enrollDoc.ref, { progress: newProgress });
        if (challengeObj.unit === 'pasos') {
          await this.updateUserStats(userId, 0, amount);
        }
      }

      return { enrollment: { ...enrollment, progress: newProgress, status: completedNow ? 'completed' : 'active' }, completed: completedNow, pointsAwarded: pointsAdded };
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async redeemReward(userId, rewardId) {
    try {
      const rRef = doc(db, 'rewards', rewardId);
      const rSnap = await getDoc(rRef);
      if (!rSnap.exists()) return { error: "El premio no existe." };
      const reward = rSnap.data();

      const uRef = doc(db, 'usuarios', userId);
      const uSnap = await getDoc(uRef);
      if (!uSnap.exists()) return { error: "Usuario no encontrado." };
      const user = uSnap.data();

      if (user.points < reward.points_cost) return { error: "No tienes suficientes puntos." };
      if (reward.stock <= 0) return { error: "Este premio se encuentra agotado." };

      const newPoints = user.points - reward.points_cost;
      const newStock = reward.stock - 1;

      await updateDoc(uRef, { points: newPoints });
      await updateDoc(rRef, { stock: newStock });

      const newRedemption = {
        id: `red_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        reward_id: rewardId,
        reward_title: reward.title,
        reward_icon: reward.icon,
        points_cost: reward.points_cost,
        code: `RETO-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'approved',
        redeemed_at: new Date().toISOString()
      };
      await setDoc(doc(db, 'redeemed_rewards', newRedemption.id), newRedemption);

      const local = getLocalUser();
      if (local && local.id === userId) {
        local.points = newPoints;
        setLocalUser(local);
      }

      return { success: true, newPoints, redemption: newRedemption };
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async getRedeemedRewards(userId) {
    try {
      const q = query(collection(db, 'redeemed_rewards'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch(err) { console.error(err); return []; }
  },

  async getLeaderboard() {
    try {
      const q = query(collection(db, 'usuarios'), where('status', '==', 'approved'), where('role', '==', 'employee'), orderBy('points', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d, idx) => {
        const u = d.data();
        return { id: u.id, name: `${u.name} ${u.lastname || ''}`, avatar: u.avatar, points: u.points, department: u.department, rank: idx + 1 };
      });
    } catch(err) { console.error(err); return []; }
  },

  async getPendingEvidences() {
    try {
      const q = query(collection(db, 'evidencias'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const evs = [];
      for (const d of snap.docs) {
        const e = d.data();
        const uSnap = await getDoc(doc(db, 'usuarios', e.user_id));
        const u = uSnap.exists() ? uSnap.data() : {};
        const cSnap = await getDoc(doc(db, 'retos', e.challenge_id));
        const c = cSnap.exists() ? cSnap.data() : {};
        
        evs.push({
          id: e.id,
          user_id: e.user_id,
          user_name: e.user_name,
          user_avatar: u.avatar,
          user_department: u.department,
          challenge_id: e.challenge_id,
          challenge_title: c.title,
          amount: e.value,
          unit: c.unit,
          screenshot_preview: e.screenshot_url,
          submitted_at: e.date
        });
      }
      return evs;
    } catch(err) { console.error(err); return []; }
  },

  async approveEvidence(evidenceId) {
    try {
      const eRef = doc(db, 'evidencias', evidenceId);
      const eSnap = await getDoc(eRef);
      if (!eSnap.exists()) return { error: "Evidencia no encontrada." };
      const evidence = eSnap.data();

      await updateDoc(eRef, { status: 'approved' });

      const q = query(collection(db, 'user_challenges'), where('user_id', '==', evidence.user_id), where('challenge_id', '==', evidence.challenge_id));
      const uChalls = await getDocs(q);
      if (!uChalls.empty) {
        const enrollDoc = uChalls.docs[0];
        const enrollment = enrollDoc.data();
        
        const cSnap = await getDoc(doc(db, 'retos', evidence.challenge_id));
        if (cSnap.exists()) {
          const c = cSnap.data();
          const newProgress = parseFloat(enrollment.progress) + parseFloat(evidence.value);
          if (newProgress >= c.target && enrollment.status !== 'completed') {
            await updateDoc(enrollDoc.ref, { progress: c.target, status: 'completed' });
            await this.updateUserStats(evidence.user_id, c.points, c.unit === 'pasos' ? evidence.value : 0);
            return { success: true, completed: true, pointsAwarded: c.points };
          } else {
            await updateDoc(enrollDoc.ref, { progress: newProgress });
            await this.updateUserStats(evidence.user_id, 0, c.unit === 'pasos' ? evidence.value : 0);
            return { success: true, completed: false, pointsAwarded: 0 };
          }
        }
      }
      return { success: true, completed: false, pointsAwarded: 0 };
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async rejectEvidence(evidenceId) {
    try {
      await updateDoc(doc(db, 'evidencias', evidenceId), { status: 'rejected' });
      return { success: true };
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async createChallenge(title, description, points, category, target, unit, duration, image) {
    try {
      const newChallenge = {
        id: `ch_${Math.random().toString(36).substr(2, 9)}`,
        title, description, points: parseInt(points), category, target: parseFloat(target), unit, duration, participantsCount: 0, image: image || '🏆'
      };
      await setDoc(doc(db, 'retos', newChallenge.id), newChallenge);
      return newChallenge;
    } catch(err) { console.error(err); return null; }
  },

  async createReward(title, description, points_cost, category, icon, stock) {
    try {
      const newReward = {
        id: `rw_${Math.random().toString(36).substr(2, 9)}`,
        title, description, points_cost: parseInt(points_cost), stock: parseInt(stock), category, icon: icon || '🥑'
      };
      await setDoc(doc(db, 'rewards', newReward.id), newReward);
      return newReward;
    } catch(err) { console.error(err); return null; }
  },

  async getCompanyStats() {
    try {
      const usersSnap = await getDocs(query(collection(db, 'usuarios'), where('status', '==', 'approved')));
      const users = usersSnap.docs.map(d => d.data());
      const uChallsSnap = await getDocs(collection(db, 'user_challenges'));
      const userChallenges = uChallsSnap.docs.map(d => d.data());

      const totalCompanySteps = users.reduce((sum, u) => sum + (u.daily_steps_history?.reduce((a,b)=>a+b, 0) || 0), 0);
      const totalEmployeesCount = users.filter(u => u.role === 'employee').length || 1;
      const activeEmployeesCount = users.filter(u => {
        return userChallenges.some(uc => uc.user_id === u.id && uc.status === 'active');
      }).length;
      const participationPercentage = Math.round((activeEmployeesCount / totalEmployeesCount) * 100) || 0;
      const totalPointsAwarded = users.reduce((sum, u) => sum + (u.points || 0), 0);

      const deptStats = {};
      users.filter(u => u.role === 'employee').forEach(u => {
        const uSteps = u.daily_steps_history?.reduce((a,b)=>a+b, 0) || 0;
        if (!deptStats[u.department]) deptStats[u.department] = { steps: 0, points: 0, members: 0 };
        deptStats[u.department].steps += uSteps;
        deptStats[u.department].points += (u.points || 0);
        deptStats[u.department].members += 1;
      });

      const deptChartData = Object.keys(deptStats).map(name => ({
        name, steps: deptStats[name].steps, points: deptStats[name].points, avgSteps: Math.round(deptStats[name].steps / (deptStats[name].members || 1))
      }));

      return { totalCompanySteps, participationPercentage, totalPointsAwarded, deptChartData, totalEmployeesCount };
    } catch(err) { console.error(err); return { totalCompanySteps: 0, participationPercentage: 0, totalPointsAwarded: 0, deptChartData: [], totalEmployeesCount: 1 }; }
  },

  // --- GOOGLE FIT INTEGRATION (MOCK SIMULATION) ---
  buildGoogleOAuthUrl(clientId, redirectUri) {
    return '#connected'; 
  },
  extractTokenFromUrl() {
    return { token: 'DEMO', expiresIn: 3600 };
  },
  saveGoogleFitToken(token, expiresIn) {
    localStorage.setItem('ra_gfit_token', token);
  },
  getGoogleFitToken() {
    return localStorage.getItem('ra_gfit_token');
  },
  clearGoogleFitToken() {
    localStorage.removeItem('ra_gfit_token');
  },
  isGoogleFitConnected() {
    return !!localStorage.getItem('ra_gfit_token');
  },
  async fetchWeeklyStepsFromGoogleFit(token) {
    const dailySteps = Array.from({ length: 7 }, () => Math.floor(Math.random() * 4000) + 7000);
    const totalSteps = dailySteps.reduce((a, b) => a + b, 0);
    return { dailySteps, totalSteps };
  },
  async syncGoogleFitSteps(userId, challengeId, fitData) {
    try {
      const { dailySteps, totalSteps } = fitData;
      const kmEquivalent = parseFloat((totalSteps / 1312).toFixed(2));
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, { daily_steps_history: dailySteps });
      return { totalSteps, kmEquivalent, completed: false, pointsAwarded: 0 };
    } catch(err) { console.error(err); return { totalSteps: 0, kmEquivalent: 0, completed: false, pointsAwarded: 0 }; }
  },
  saveLastSync(userId, steps) {
    localStorage.setItem(`ra_gfit_last_sync_${userId}`, JSON.stringify({ steps, syncedAt: new Date().toISOString() }));
  },
  getLastSync(userId) {
    const raw = localStorage.getItem(`ra_gfit_last_sync_${userId}`);
    return raw ? JSON.parse(raw) : null;
  }
};
