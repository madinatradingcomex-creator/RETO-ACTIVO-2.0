import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

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

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const getLocalUser = () => {
  const u = sessionStorage.getItem('ra_current_user');
  return u ? JSON.parse(u) : null;
};
const setLocalUser = (u) => {
  if (u) sessionStorage.setItem('ra_current_user', JSON.stringify(u));
  else sessionStorage.removeItem('ra_current_user');
};

// Local cache state for query result caching to avoid redundant queries during load
const _queryCache = {};
const _queryCacheTime = {};

const getCachedData = (key, ttl = 5000) => {
  const now = Date.now();
  if (_queryCache[key] !== undefined && _queryCacheTime[key] && (now - _queryCacheTime[key] < ttl)) {
    return _queryCache[key];
  }
  return null;
};

const setCachedData = (key, data) => {
  _queryCache[key] = data;
  _queryCacheTime[key] = Date.now();
};

const clearCache = () => {
  for (const key in _queryCache) {
    delete _queryCache[key];
  }
  for (const key in _queryCacheTime) {
    delete _queryCacheTime[key];
  }
};

export const dbService = {
  clearCache() {
    clearCache();
  },
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
    const cacheKey = `current_user_${local.id}`;
    const cached = getCachedData(cacheKey, 5000);
    if (cached) return cached;
    try {
      const docSnap = await getDoc(doc(db, 'usuarios', local.id));
      if (docSnap.exists()) {
        const u = docSnap.data();
        // NOTE: last_login is intentionally NOT updated here.
        // It is only recorded during loginWithCompanyCode and registerUser
        // to avoid a Firestore write on every session/data refresh.
        setLocalUser(u);
        setCachedData(cacheKey, u);
        return u;
      }
    } catch(err) { console.error(err); }
    return null;
  },

  async hashPassword(password) {
    if (!crypto?.subtle) {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return 'fb_' + Math.abs(hash).toString(16);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async loginWithCompanyCode(email, companyCode, password) {
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
        
        // If user already has a password set, validate it
        if (user.password_hash) {
          const inputHash = await this.hashPassword(password);
          if (user.password_hash !== inputHash) {
            return { error: "Contraseña incorrecta." };
          }
        } else {
          // User exists but has no password set (needs migration)
          return { needsMigration: true, user };
        }

        const lastLogin = new Date().toISOString();
        try {
          await updateDoc(doc(db, 'usuarios', user.id), { last_login: lastLogin });
          user.last_login = lastLogin;
        } catch(e) {
          console.error("Error updating last_login:", e);
        }

        setLocalUser(user);
        return { success: true, user };
      }
    } catch(err) { console.error(err); return { error: "Error en el servidor de base de datos." }; }
    return { error: "Credenciales incorrectas. Verifica tu email y el código de empresa." };
  },

  async registerUser(name, lastname, email, companyCode, department, password) {
    const newId = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = await this.hashPassword(password);
    const lastLogin = new Date().toISOString();
    const newUser = {
      id: newId,
      name,
      lastname,
      email: email.toLowerCase(),
      company_code: companyCode.toUpperCase(),
      password_hash: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120',
      points: 100,
      department,
      role: 'employee',
      level: 'Wellness Principiante 🌱',
      streak: 1,
      daily_steps_history: [0, 0, 0, 0, 0, 0, 0],
      status: 'pending',
      last_login: lastLogin
    };

    try {
      await setDoc(doc(db, 'usuarios', newId), newUser);
      setLocalUser(newUser);
      return newUser;
    } catch(err) { console.error(err); }
    return null;
  },

  async setUserPassword(userId, password) {
    try {
      const hash = await this.hashPassword(password);
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, { password_hash: hash });
      
      const local = getLocalUser();
      if (local && local.id === userId) {
        local.password_hash = hash;
        setLocalUser(local);
      }
      return { success: true };
    } catch(err) {
      console.error(err);
      return { error: "No se pudo establecer la contraseña." };
    }
  },
  async getPendingUsers() {
    const cached = getCachedData('pending_users', 5000);
    if (cached) return cached;
    try {
      const q = query(collection(db, 'usuarios'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data());
      setCachedData('pending_users', list);
      return list;
    } catch(err) { console.error(err); return []; }
  },

  async approveUser(userId) {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { status: 'approved' });
      clearCache();
      return true;
    } catch(err) { console.error(err); return false; }
  },

  async rejectUser(userId) {
    try {
      await deleteDoc(doc(db, 'usuarios', userId));
      clearCache();
      return true;
    } catch(err) { console.error(err); return false; }
  },

  async logout() {
    setLocalUser(null);
    clearCache();
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
        clearCache();
      }
    } catch(err) { console.error(err); }
  },

  async getChallenges() {
    const cached = getCachedData('challenges', 10000);
    if (cached) return cached;
    try {
      const snap = await getDocs(collection(db, 'retos'));
      const list = snap.docs.map(d => d.data());
      setCachedData('challenges', list);
      return list;
    } catch(err) { console.error(err); return []; }
  },

  async getRewards() {
    const cached = getCachedData('rewards', 10000);
    if (cached) return cached;
    try {
      const snap = await getDocs(collection(db, 'rewards'));
      const list = snap.docs.map(d => d.data());
      setCachedData('rewards', list);
      return list;
    } catch(err) { console.error(err); return []; }
  },

  async getUserChallenges(userId) {
    const cacheKey = `user_challenges_${userId}`;
    const cached = getCachedData(cacheKey, 5000);
    if (cached) return cached;
    try {
      const q = query(collection(db, 'user_challenges'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data());
      setCachedData(cacheKey, list);
      return list;
    } catch(err) { console.error(err); return []; }
  },
  // Fetch ALL enrollments in one query (used for leaderboard privacy filter)
  async getAllUserChallenges() {
    const cached = getCachedData('all_user_challenges', 10000);
    if (cached) return cached;
    try {
      const snap = await getDocs(collection(db, 'user_challenges'));
      const list = snap.docs.map(d => d.data());
      setCachedData('all_user_challenges', list);
      return list;
    } catch(err) { console.error(err); return []; }
  },

  async enrollInChallenge(userId, challengeId) {
    try {
      const cRef = doc(db, 'retos', challengeId);
      const cSnap = await getDoc(cRef);
      if (!cSnap.exists()) return { error: "El reto no existe." };
      const challenge = cSnap.data();

      // Block enrollment if challenge is inactive/paused
      if (challenge.status === 'inactive') {
        return { error: "Este reto está pausado y no acepta nuevas inscripciones en este momento." };
      }

      // Restrict enrollment after the challenge has started or deadline has passed
      const todayStr = getLocalDateString();
      if (challenge.modality === 'immediate') {
        if (challenge.enrollment_deadline && todayStr > challenge.enrollment_deadline) {
          return { error: `Inscripción cerrada. El límite para anotarse era el ${challenge.enrollment_deadline.split('-').reverse().join('/')}.` };
        }
      } else {
        if (challenge.start_date && todayStr >= challenge.start_date) {
          return { error: "Inscripción cerrada. El reto ya se inició o ha finalizado." };
        }
      }

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
        await updateDoc(cRef, { participantsCount: (challenge.participantsCount || 0) + 1 });
      }
      clearCache();
      return await this.getUserChallenges(userId);
    } catch(err) { console.error(err); return { error: "Error de servidor al inscribirse." }; }
  },

  async adminEnrollInChallenge(userId, challengeId) {
    try {
      const cRef = doc(db, 'retos', challengeId);
      const cSnap = await getDoc(cRef);
      if (!cSnap.exists()) return { error: "El reto no existe." };
      const challenge = cSnap.data();

      const uRef = doc(db, 'usuarios', userId);
      const uSnap = await getDoc(uRef);
      if (!uSnap.exists()) return { error: "Usuario no encontrado." };
      const user = uSnap.data();
      const dailySteps = user.daily_steps_history || [0, 0, 0, 0, 0, 0, 0];

      const q = query(
        collection(db, 'user_challenges'),
        where('user_id', '==', userId),
        where('challenge_id', '==', challengeId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) return { error: "El colaborador ya está inscrito en este reto." };

      // Calculate dates array corresponding to the 7 days (index 6 = today, index 0 = 6 days ago)
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d));
      }

      // Retroactive steps sync for this challenge
      let progress = 0;
      const dailySyncs = {};
      
      for (let i = 0; i < 7; i++) {
        const dateStr = dates[i];
        
        if (challenge.start_date && dateStr < challenge.start_date) continue;
        if (challenge.end_date && dateStr > challenge.end_date) continue;
        
        const daySteps = dailySteps[i] || 0;
        if (daySteps > 0) {
          dailySyncs[dateStr] = daySteps;
          const amount = challenge.unit === 'km' 
            ? parseFloat((daySteps / 1312).toFixed(2))
            : daySteps;
          progress += amount;
        }
      }
      
      progress = parseFloat(progress.toFixed(2));
      let status = 'active';
      const tempEnrollmentForCheck = {
        progress,
        daily_syncs: dailySyncs,
        enrolled_at: new Date().toISOString()
      };
      const dailyConditionMet = this.verifyDailyCondition(tempEnrollmentForCheck, challenge);

      if (progress >= challenge.target && dailyConditionMet) {
        progress = challenge.target;
        status = 'completed';
        
        // Create pending completion evidence record
        const qComp = query(collection(db, 'evidencias'), where('user_id', '==', userId), where('challenge_id', '==', challengeId), where('type', '==', 'challenge_completion'));
        const snapComp = await getDocs(qComp);
        if (snapComp.empty) {
          const compEv = {
            id: `ev_comp_${Math.random().toString(36).substr(2, 9)}`,
            challenge_id: challengeId,
            user_id: userId,
            user_name: `${user.name || ''} ${user.lastname || ''}`.trim() || 'Colaborador',
            type: 'challenge_completion',
            activity_type: 'manual',
            status: 'pending',
            points_awarded: challenge.points,
            value: challenge.target,
            screenshot_url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23FFA000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>`,
            date: new Date().toISOString(),
            submission_date: getLocalDateString()
          };
          await setDoc(doc(db, 'evidencias', compEv.id), compEv);
        }
      }

      const newEnrollment = {
        user_id: userId,
        challenge_id: challengeId,
        progress,
        status,
        enrolled_at: new Date().toISOString(),
        daily_syncs: dailySyncs
      };

      await addDoc(collection(db, 'user_challenges'), newEnrollment);
      await updateDoc(cRef, { participantsCount: (challenge.participantsCount || 0) + 1 });

      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error in adminEnrollInChallenge:", err);
      return { error: "Error de servidor al inscribir administrativamente." };
    }
  },

  async leaveChallenge(userId, challengeId) {
    try {
      const q = query(collection(db, 'user_challenges'), where('user_id', '==', userId), where('challenge_id', '==', challengeId));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, 'user_challenges', docSnap.id));
        }
        
        const cRef = doc(db, 'retos', challengeId);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          const challenge = cSnap.data();
          const currentCount = challenge.participantsCount || 0;
          const newCount = Math.max(0, currentCount - 1);
          await updateDoc(cRef, { participantsCount: newCount });
        }
      }
      
      clearCache();
      return await this.getUserChallenges(userId);
    } catch(err) {
      console.error("Error al darse de baja del reto:", err);
      return { error: "Error de servidor al darse de baja del reto." };
    }
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

      if (challengeObj.status === 'inactive') {
        return { error: "El reto está inactivo o pausado por el administrador." };
      }

      // Check date constraints for logging progress
      const todayStr = getLocalDateString();
      if (challengeObj.modality !== 'immediate' && challengeObj.start_date && todayStr < challengeObj.start_date) {
        return { error: `El reto inicia el ${challengeObj.start_date.split('-').reverse().join('/')}. Aún no puedes registrar progreso.` };
      }
      if (challengeObj.end_date && todayStr > challengeObj.end_date) {
        return { error: "El reto ha finalizado. No se puede registrar más progreso." };
      }

      const currentUser = getLocalUser();
      const userFullName = currentUser ? `${currentUser.name} ${currentUser.lastname || ''}` : 'Anónimo';

      // Mandatory: screenshot or mock URL required
      if (!screenshotFile && !screenshotUrlMock) {
        return { error: "La evidencia en captura de pantalla es obligatoria para evitar registros falsos o incorrectos." };
      }

      // Duplicate check: prevent submitting multiple evidences for the same challenge on same day
      const evQuery = query(
        collection(db, 'evidencias'),
        where('user_id', '==', userId),
        where('challenge_id', '==', challengeId)
      );
      const evSnap = await getDocs(evQuery);
      const alreadySubmitted = evSnap.docs.some(d => {
        const ev = d.data();
        if (ev.status === 'rejected') return false; // Rejected evidence can be resubmitted
        const evDate = ev.submission_date || (ev.date ? ev.date.split('T')[0] : '');
        return evDate === todayStr;
      });

      if (alreadySubmitted) {
        return { error: "Ya has registrado una evidencia para este reto hoy. Espera a que RRHH la revise." };
      }

      let finalUrl = screenshotUrlMock || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=300';
      if (screenshotFile) {
        try {
          finalUrl = await compressImage(screenshotFile);
        } catch(err) {
          console.error("Error compressing image:", err);
        }
      }

      // Generate a unique evidence ID used as both the Firestore doc ID and the data field
      const evidenceId = `ev_${Math.random().toString(36).substr(2, 9)}`;
      const newEvidence = {
        id: evidenceId,
        challenge_id: challengeId,
        user_id: userId,
        user_name: userFullName,
        type: challengeObj.category,
        activity_type: (!screenshotFile && screenshotUrlMock && screenshotUrlMock.startsWith('data:image/svg+xml')) ? 'sync' : 'manual',
        status: 'pending',
        points_awarded: challengeObj.points,
        value: parseFloat(amount),
        screenshot_url: finalUrl,
        date: new Date().toISOString(),
        submission_date: todayStr
      };
      // Use the same ID as both Firestore document ID and data.id for consistent lookups
      await setDoc(doc(db, 'evidencias', evidenceId), newEvidence);
      clearCache();
      return { pendingApproval: true, message: "Enviado a RRHH." };
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

      clearCache();
      return { success: true, newPoints, redemption: newRedemption };
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async getRedeemedRewards(userId) {
    const cacheKey = `redeemed_rewards_${userId}`;
    const cached = getCachedData(cacheKey, 5000);
    if (cached) return cached;
    try {
      const q = query(collection(db, 'redeemed_rewards'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data());
      setCachedData(cacheKey, list);
      return list;
    } catch(err) { console.error(err); return []; }
  },
  async getLeaderboard() {
    const cached = getCachedData('leaderboard', 10000);
    if (cached) return cached;
    try {
      const q = query(collection(db, 'usuarios'), where('status', '==', 'approved'), where('role', '==', 'employee'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => {
        const data = d.data();
        data.id = data.id || d.id;
        return data;
      });
      list.sort((a, b) => (b.points || 0) - (a.points || 0));
      const enriched = list.map((u, idx) => ({
        id: u.id,
        name: `${u.name} ${u.lastname || ''}`,
        avatar: u.avatar,
        points: u.points || 0,
        department: u.department,
        rank: idx + 1
      }));
      setCachedData('leaderboard', enriched);
      return enriched;
    } catch(err) { console.error("Error in getLeaderboard:", err); return []; }
  },

  async getPendingEvidences() {
    const cached = getCachedData('pending_evidences', 5000);
    if (cached) return cached;
    try {
      const q = query(collection(db, 'evidencias'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      
      const userCache = {};
      const challengeCache = {};
      
      const evs = await Promise.all(snap.docs.map(async (d) => {
        const e = d.data();
        
        let u = {};
        if (e.user_id) {
          if (!userCache[e.user_id]) {
            userCache[e.user_id] = getDoc(doc(db, 'usuarios', e.user_id)).then(snap => snap.exists() ? snap.data() : {});
          }
          u = await userCache[e.user_id];
        }
        
        let c = {};
        if (e.challenge_id) {
          if (!challengeCache[e.challenge_id]) {
            challengeCache[e.challenge_id] = getDoc(doc(db, 'retos', e.challenge_id)).then(snap => snap.exists() ? snap.data() : {});
          }
          c = await challengeCache[e.challenge_id];
        }
        
        return {
          id: d.id,
          user_id: e.user_id,
          user_name: e.user_name || `${u.name || ''} ${u.lastname || ''}`.trim(),
          user_avatar: u.avatar,
          user_department: u.department,
          challenge_id: e.challenge_id,
          challenge_title: c.title || 'Reto sin título',
          amount: e.value,
          unit: c.unit || '',
          screenshot_preview: e.screenshot_url,
          submitted_at: e.date,
          type: e.type || '',
          points: e.points_awarded || c.points || 0
        };
      }));
      
      setCachedData('pending_evidences', evs);
      return evs;
    } catch(err) { console.error(err); return []; }
  },

  async getApprovedEvidencesForUserAndChallenge(userId, challengeId) {
    const cacheKey = `approved_evidences_${userId}_${challengeId}`;
    const cached = getCachedData(cacheKey, 5000);
    if (cached) return cached;
    try {
      const q = query(
        collection(db, 'evidencias'),
        where('user_id', '==', userId),
        where('challenge_id', '==', challengeId),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data());
      setCachedData(cacheKey, list);
      return list;
    } catch(err) {
      console.error("Error getting approved evidences:", err);
      return [];
    }
  },

  async approveEvidence(evidenceId) {
    try {
      const eRef = doc(db, 'evidencias', evidenceId);
      const eSnap = await getDoc(eRef);
      if (!eSnap.exists()) return { error: "Evidencia no encontrada." };
      const evidence = eSnap.data();

      // Idempotency guard: don't double-credit if already approved
      if (evidence.status === 'approved') {
        return { success: true, completed: false, pointsAwarded: 0 };
      }

      let res = { success: true, completed: false, pointsAwarded: 0 };

      if (evidence.type === 'challenge_completion') {
        const cSnap = await getDoc(doc(db, 'retos', evidence.challenge_id));
        if (cSnap.exists()) {
          const c = cSnap.data();
          await this.updateUserStats(evidence.user_id, c.points, 0);
          res = { success: true, completed: true, pointsAwarded: c.points };
        }
        await updateDoc(eRef, { status: 'approved' });
        clearCache();
        return res;
      }

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
          const dailySyncs = { ...(enrollment.daily_syncs || {}) };
          if (c.unit === 'pasos' || c.unit === 'km') {
            const dateStr = evidence.submission_date || evidence.date.split('T')[0];
            const stepsValue = c.unit === 'km' 
              ? Math.round(parseFloat(evidence.value) * 1312)
              : parseFloat(evidence.value);
            dailySyncs[dateStr] = (dailySyncs[dateStr] || 0) + stepsValue;
          }

          const updatedEnrollmentForCheck = {
            ...enrollment,
            progress: newProgress,
            daily_syncs: dailySyncs
          };
          const dailyConditionMet = this.verifyDailyCondition(updatedEnrollmentForCheck, c);

          if (newProgress >= c.target && dailyConditionMet && enrollment.status !== 'completed') {
            await updateDoc(enrollDoc.ref, { 
              progress: c.target, 
              status: 'completed',
              daily_syncs: dailySyncs
            });
            await this.updateUserStats(evidence.user_id, 0, c.unit === 'pasos' ? evidence.value : 0);
            
            // Create pending completion evidence record
            const qComp = query(collection(db, 'evidencias'), where('user_id', '==', evidence.user_id), where('challenge_id', '==', evidence.challenge_id), where('type', '==', 'challenge_completion'));
            const snapComp = await getDocs(qComp);
            if (snapComp.empty) {
              const compEv = {
                id: `ev_comp_${Math.random().toString(36).substr(2, 9)}`,
                challenge_id: evidence.challenge_id,
                user_id: evidence.user_id,
                user_name: evidence.user_name,
                type: 'challenge_completion',
                activity_type: 'manual',
                status: 'pending',
                points_awarded: c.points,
                value: c.target,
                screenshot_url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23FFA000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>`,
                date: new Date().toISOString(),
                submission_date: getLocalDateString()
              };
              await setDoc(doc(db, 'evidencias', compEv.id), compEv);
            }
            res = { success: true, completed: true, pointsAwarded: 0 };
          } else {
            await updateDoc(enrollDoc.ref, { 
              progress: newProgress,
              daily_syncs: dailySyncs
            });
            await this.updateUserStats(evidence.user_id, 0, c.unit === 'pasos' ? evidence.value : 0);
            res = { success: true, completed: false, pointsAwarded: 0 };
          }
        }
      }
      clearCache();
      return res;
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async rejectEvidence(evidenceId) {
    try {
      await updateDoc(doc(db, 'evidencias', evidenceId), { status: 'rejected' });
      clearCache();
      return { success: true };
    } catch(err) { console.error(err); return { error: "Error interno" }; }
  },

  async createChallenge(title, description, points, category, target, unit, duration, image, startDate, endDate, modality = 'scheduled', enrollmentDeadline = '', isDaily = false, dailyTarget = null) {
    try {
      const newChallenge = {
        id: `ch_${Math.random().toString(36).substr(2, 9)}`,
        title, description, points: parseInt(points), category, target: parseFloat(target), unit, duration, participantsCount: 0, image: image || '🏆',
        start_date: startDate || '',
        end_date: endDate || '',
        modality,
        enrollment_deadline: enrollmentDeadline || '',
        is_daily: isDaily,
        daily_target: dailyTarget ? parseFloat(dailyTarget) : null
      };
      await setDoc(doc(db, 'retos', newChallenge.id), newChallenge);
      clearCache();
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
      clearCache();
      return newReward;
    } catch(err) { console.error(err); return null; }
  },

  async getCompanyStats() {
    const cached = getCachedData('company_stats', 10000);
    if (cached) return cached;
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

      let settings = null;
      try {
        const dSnap = await getDoc(doc(db, 'settings', 'dashboard_stats'));
        if (dSnap.exists()) {
          settings = dSnap.data();
        }
      } catch(e) {
        console.error("Error loading stats overrides settings:", e);
      }

      const stats = { 
        totalCompanySteps, 
        participationPercentage, 
        totalPointsAwarded, 
        deptChartData, 
        totalEmployeesCount,
        card_1_title: settings?.card_1_title || "Movilidad Total Acme",
        card_1_footer: settings?.card_1_footer || "Pasos acumulados por empleados",
        card_1_val_display: settings?.card_1_override ? settings.card_1_value : totalCompanySteps.toLocaleString(),
        
        card_2_title: settings?.card_2_title || "Índice de Participación",
        card_2_footer: settings?.card_2_footer || "Colaboradores con retos activos",
        card_2_val_display: settings?.card_2_override ? settings.card_2_value : `${participationPercentage}%`,
        
        card_3_title: settings?.card_3_title || "Puntos Otorgados",
        card_3_footer: settings?.card_3_footer || "Premio al esfuerzo acumulado",
        card_3_val_display: settings?.card_3_override ? settings.card_3_value : `${totalPointsAwarded} pts`,
        
        card_4_title: settings?.card_4_title || "Plantilla Registrada",
        card_4_footer: settings?.card_4_footer || "Colaboradores activos",
        card_4_val_display: settings?.card_4_override ? settings.card_4_value : totalEmployeesCount.toString(),
        
        settings: settings || {}
      };
      
      setCachedData('company_stats', stats);
      return stats;
    } catch(err) { 
      console.error(err); 
      return { 
        totalCompanySteps: 0, 
        participationPercentage: 0, 
        totalPointsAwarded: 0, 
        deptChartData: [], 
        totalEmployeesCount: 1,
        card_1_title: "Movilidad Total Acme",
        card_1_footer: "Pasos acumulados por empleados",
        card_1_val_display: "0",
        card_2_title: "Índice de Participación",
        card_2_footer: "Colaboradores con retos activos",
        card_2_val_display: "0%",
        card_3_title: "Puntos Otorgados",
        card_3_footer: "Premio al esfuerzo acumulado",
        card_3_val_display: "0 pts",
        card_4_title: "Plantilla Registrada",
        card_4_footer: "Colaboradores activos",
        card_4_val_display: "0",
        settings: {}
      }; 
    }
  },

  // --- GOOGLE FIT INTEGRATION ---
  verifyDailyCondition(enrollment, challenge) {
    if (!challenge.daily_target || challenge.daily_target <= 0) return true;
    
    const enrolledDateStr = enrollment.enrolled_at ? enrollment.enrolled_at.split('T')[0] : getLocalDateString();
    const challengeStartStr = challenge.start_date || '';
    
    const startStr = (challengeStartStr && challengeStartStr > enrolledDateStr) ? challengeStartStr : enrolledDateStr;
    const todayStr = getLocalDateString();
    const challengeEndStr = challenge.end_date || '';
    
    // Determine the last day to check:
    // - If the challenge has ended, check up to the end date.
    // - If the challenge is still ongoing, only check COMPLETED days (yesterday and before),
    //   since today's steps may still be accumulating during the day.
    let endStr;
    if (challengeEndStr && challengeEndStr < todayStr) {
      // Challenge has already ended — check all days up to the end date
      endStr = challengeEndStr;
    } else {
      // Challenge is ongoing — only check up to yesterday to avoid false failures mid-day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      endStr = getLocalDateString(yesterday);
    }
    
    if (startStr > endStr) return true;
    
    let current = new Date(startStr + 'T12:00:00');
    const stopDate = new Date(endStr + 'T12:00:00');
    
    const dailySyncs = enrollment.daily_syncs || {};
    
    while (current <= stopDate) {
      const dateStr = getLocalDateString(current);
      const daySteps = dailySyncs[dateStr] || 0;
      const dayValue = challenge.unit === 'km'
        ? parseFloat((daySteps / 1312).toFixed(2))
        : daySteps;
      
      if (dayValue < challenge.daily_target) {
        return false;
      }
      current.setDate(current.getDate() + 1);
    }
    return true;
  },
  saveGoogleFitToken(token) {
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
    const now = new Date();
    // Fin del día de hoy: 23:59:59.999 hora local
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const endTime = todayEnd.getTime();
    
    // Inicio de hace 6 días (para cubrir 7 días calendario naturales: hace 6, 5, 4, 3, 2, 1 y hoy): 00:00:00.000 hora local
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const startTime = startDay.getTime();
    
    try {
      const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        })
      });

      if (!response.ok) {
        const error = new Error(`Google Fit API error: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }
      const data = await response.json();
      
      const dailySteps = [];
      let totalSteps = 0;
      
      data.bucket.forEach(bucket => {
        let bucketSteps = 0;
        if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point[0]) {
          bucketSteps = bucket.dataset[0].point[0].value[0].intVal || 0;
        }
        dailySteps.push(bucketSteps);
        totalSteps += bucketSteps;
      });

      while (dailySteps.length < 7) dailySteps.unshift(0);
      if (dailySteps.length > 7) dailySteps.splice(0, dailySteps.length - 7);

      return { dailySteps, totalSteps };
    } catch (err) {
      console.error("Error in fetchWeeklyStepsFromGoogleFit:", err);
      throw err;
    }
  },
  async syncGoogleFitSteps(userId, fitData, syncDays = 7) {
    try {
      const { dailySteps, totalSteps } = fitData;
      
      const userRef = doc(db, 'usuarios', userId);
      const userSnap = await getDoc(userRef);
      const user = userSnap.exists() ? userSnap.data() : {};

      await updateDoc(userRef, { 
        daily_steps_history: dailySteps,
        last_sync: new Date().toISOString()
      });

      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d));
      }

      const q = query(
        collection(db, 'user_challenges'),
        where('user_id', '==', userId),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);
      
      let syncedChallenges = [];
      let totalPointsAwarded = 0;
      let challengesCompletedCount = 0;

      for (const enrollDoc of snap.docs) {
        const enrollment = enrollDoc.data();
        const challengeId = enrollment.challenge_id;

        const cSnap = await getDoc(doc(db, 'retos', challengeId));
        if (!cSnap.exists()) continue;
        const challenge = cSnap.data();

        if (challenge.unit !== 'pasos' && challenge.unit !== 'km') continue;

        let netAmountToAdd = 0;
        const dailySyncs = enrollment.daily_syncs || {};

        for (let offset = 0; offset < syncDays; offset++) {
          const index = 6 - offset;
          if (index < 0) break;

          const dateStr = dates[index];
          
          // Only sync steps within the challenge's active range
          if (challenge.start_date && dateStr < challenge.start_date) continue;
          if (challenge.end_date && dateStr > challenge.end_date) continue;

          const daySteps = dailySteps[index] || 0;
          const previousSteps = dailySyncs[dateStr] || 0;

          if (daySteps > previousSteps) {
            const stepDiff = daySteps - previousSteps;
            const amountToAdd = challenge.unit === 'km' 
              ? parseFloat((stepDiff / 1312).toFixed(2))
              : stepDiff;

            netAmountToAdd += amountToAdd;
            dailySyncs[dateStr] = daySteps;
          }
        }

        if (netAmountToAdd > 0) {
          const newProgress = parseFloat((parseFloat(enrollment.progress) + netAmountToAdd).toFixed(2));
          let status = 'active';
          let completed = false;

          const updatedEnrollmentForCheck = {
            ...enrollment,
            progress: newProgress,
            daily_syncs: dailySyncs
          };
          const dailyConditionMet = this.verifyDailyCondition(updatedEnrollmentForCheck, challenge);

          if (newProgress >= challenge.target && dailyConditionMet) {
            status = 'completed';
            completed = true;
            challengesCompletedCount++;

            // Create pending completion evidence record
            const qComp = query(collection(db, 'evidencias'), where('user_id', '==', userId), where('challenge_id', '==', challengeId), where('type', '==', 'challenge_completion'));
            const snapComp = await getDocs(qComp);
            if (snapComp.empty) {
              const compEv = {
                id: `ev_comp_${Math.random().toString(36).substr(2, 9)}`,
                challenge_id: challengeId,
                user_id: userId,
                user_name: `${user.name || ''} ${user.lastname || ''}`.trim() || 'Colaborador',
                type: 'challenge_completion',
                activity_type: 'sync',
                status: 'pending',
                points_awarded: challenge.points,
                value: challenge.target,
                screenshot_url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23FFA000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>`,
                date: new Date().toISOString(),
                submission_date: getLocalDateString()
              };
              await setDoc(doc(db, 'evidencias', compEv.id), compEv);
            }
          }

          await updateDoc(enrollDoc.ref, {
            progress: completed ? challenge.target : newProgress,
            status,
            daily_syncs: dailySyncs
          });

          syncedChallenges.push({
            title: challenge.title,
            completed,
            amountAdded: netAmountToAdd,
            unit: challenge.unit
          });
        }
      }

      const kmEquivalent = parseFloat((totalSteps / 1312).toFixed(2));
      clearCache();
      return { 
        totalSteps, 
        kmEquivalent, 
        syncedChallenges, 
        pointsAwarded: totalPointsAwarded, 
        completed: challengesCompletedCount > 0 
      };
    } catch(err) { 
      console.error(err); 
      return { totalSteps: 0, kmEquivalent: 0, syncedChallenges: [], pointsAwarded: 0, completed: false }; 
    }
  },
  async adjustUserStepsBatch(userId, newStepsArray) {
    try {
      const userRef = doc(db, 'usuarios', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { error: "Usuario no encontrado." };
      const user = userSnap.data();
      
      const oldStepsArray = user.daily_steps_history || [0, 0, 0, 0, 0, 0, 0];
      if (newStepsArray.length !== 7) return { error: "La lista de pasos debe contener exactamente 7 días." };
      
      // Calculate dates array corresponding to the 7 days (index 6 = today, index 0 = 6 days ago)
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d));
      }
      
      // Fetch all user enrollments
      const q = query(
        collection(db, 'user_challenges'),
        where('user_id', '==', userId)
      );
      const snap = await getDocs(q);
      
      let totalPointsChange = 0;
      
      for (const enrollDoc of snap.docs) {
        const enrollment = enrollDoc.data();
        const challengeId = enrollment.challenge_id;
        
        const cSnap = await getDoc(doc(db, 'retos', challengeId));
        if (!cSnap.exists()) continue;
        const challenge = cSnap.data();
        
        if (challenge.unit !== 'pasos' && challenge.unit !== 'km') continue;
        
        const dailySyncs = { ...(enrollment.daily_syncs || {}) };
        let netAmountToAdd = 0;
        let hasChanges = false;
        
        for (let i = 0; i < 7; i++) {
          const dateStr = dates[i];
          
          if (challenge.start_date && dateStr < challenge.start_date) continue;
          if (challenge.end_date && dateStr > challenge.end_date) continue;
          
          const oldSyncSteps = dailySyncs[dateStr] || 0;
          const newSteps = newStepsArray[i];
          
          if (newSteps !== oldSyncSteps) {
            const stepDiff = newSteps - oldSyncSteps;
            const amountToAdd = challenge.unit === 'km' 
              ? parseFloat((stepDiff / 1312).toFixed(2))
              : stepDiff;
              
            netAmountToAdd += amountToAdd;
            dailySyncs[dateStr] = newSteps;
            hasChanges = true;
          }
        }
        
        if (hasChanges) {
          const oldProgress = enrollment.progress || 0;
          let newProgress = parseFloat((oldProgress + netAmountToAdd).toFixed(2));
          if (newProgress < 0) newProgress = 0;
          if (newProgress > challenge.target) newProgress = challenge.target;
          
          let newStatus = enrollment.status || 'active';
          
          const updatedEnrollmentForCheck = {
            ...enrollment,
            progress: newProgress,
            daily_syncs: dailySyncs
          };
          const dailyConditionMet = this.verifyDailyCondition(updatedEnrollmentForCheck, challenge);

          if (newProgress >= challenge.target && dailyConditionMet && enrollment.status !== 'completed') {
            newStatus = 'completed';
            newProgress = challenge.target;
            
            // Create pending completion evidence record
            const qComp = query(collection(db, 'evidencias'), where('user_id', '==', userId), where('challenge_id', '==', challengeId), where('type', '==', 'challenge_completion'));
            const snapComp = await getDocs(qComp);
            if (snapComp.empty) {
              const compEv = {
                id: `ev_comp_${Math.random().toString(36).substr(2, 9)}`,
                challenge_id: challengeId,
                user_id: userId,
                user_name: `${user.name || ''} ${user.lastname || ''}`.trim() || 'Colaborador',
                type: 'challenge_completion',
                activity_type: 'manual',
                status: 'pending',
                points_awarded: challenge.points,
                value: challenge.target,
                screenshot_url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23FFA000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>`,
                date: new Date().toISOString(),
                submission_date: getLocalDateString()
              };
              await setDoc(doc(db, 'evidencias', compEv.id), compEv);
            }
          } else if ((newProgress < challenge.target || !dailyConditionMet) && enrollment.status === 'completed') {
            newStatus = 'active';
            
            // Find all completion evidences for this user and challenge
            const qComp = query(collection(db, 'evidencias'), where('user_id', '==', userId), where('challenge_id', '==', challengeId), where('type', '==', 'challenge_completion'));
            const snapComp = await getDocs(qComp);
            for (const docComp of snapComp.docs) {
              const compData = docComp.data();
              if (compData.status === 'approved') {
                totalPointsChange -= challenge.points;
              }
              await updateDoc(docComp.ref, { status: 'rejected' });
            }
          }
          
          await updateDoc(enrollDoc.ref, {
            progress: newProgress,
            status: newStatus,
            daily_syncs: dailySyncs
          });
        }
      }
      
      const updatedPoints = (user.points || 0) + totalPointsChange;
      const parsedSteps = newStepsArray.map(s => Math.max(0, parseInt(s, 10) || 0));
      
      await updateDoc(userRef, {
        daily_steps_history: parsedSteps,
        points: updatedPoints >= 0 ? updatedPoints : 0
      });
      
      const local = getLocalUser();
      if (local && local.id === userId) {
        local.daily_steps_history = parsedSteps;
        local.points = Math.max(0, updatedPoints);
        setLocalUser(local);
      }
      
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error in adjustUserStepsBatch:", err);
      return { error: "Error interno al ajustar pasos en lote." };
    }
  },
  saveLastSync(userId, steps) {
    localStorage.setItem(`ra_gfit_last_sync_${userId}`, JSON.stringify({ steps, syncedAt: new Date().toISOString() }));
  },
  getLastSync(userId) {
    const raw = localStorage.getItem(`ra_gfit_last_sync_${userId}`);
    return raw ? JSON.parse(raw) : null;
  },
  async getChallengeRanking(challengeId) {
    const cacheKey = `ranking_${challengeId}`;
    const cached = getCachedData(cacheKey, 10000);
    if (cached) return cached;
    try {
      const q = query(
        collection(db, 'user_challenges'),
        where('challenge_id', '==', challengeId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => doc.data());
      
      const usersMap = await this._getUsersMapCached();

      const enrichedList = list.map(item => {
        const user = usersMap[item.user_id] || { name: 'Colaborador', lastname: 'Anónimo', avatar: '', department: 'Sin área' };
        return {
          user_id: item.user_id,
          user_name: `${user.name} ${user.lastname || ''}`,
          avatar: user.avatar,
          progress: item.progress,
          status: item.status,
          department: user.department || 'Sin área',
          daily_syncs: item.daily_syncs || {}
        };
      }).sort((a, b) => b.progress - a.progress);

      setCachedData(cacheKey, enrichedList);
      return enrichedList;
    } catch(err) {
      console.error(err);
      return [];
    }
  },
  async _getUsersMapCached() {
    const cacheKey = 'users_map';
    const cached = getCachedData(cacheKey, 15000);
    if (cached) return cached;
    try {
      const uSnap = await getDocs(collection(db, 'usuarios'));
      const usersMap = {};
      uSnap.docs.forEach(doc => {
        const u = doc.data();
        usersMap[u.id] = u;
      });
      setCachedData(cacheKey, usersMap);
      return usersMap;
    } catch(err) {
      console.error("Error fetching users map:", err);
      return {};
    }
  },
  async getActiveUsers() {
    const cached = getCachedData('active_users', 10000);
    if (cached) return cached;
    try {
      const q = query(
        collection(db, 'usuarios'), 
        where('role', '==', 'employee'), 
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => {
        const u = d.data();
        if (!u.last_sync && u.daily_steps_history && u.daily_steps_history.some(s => s > 0)) {
          const date = new Date();
          date.setHours(date.getHours() - 2);
          u.last_sync = date.toISOString();
        }
        return u;
      });
      setCachedData('active_users', list);
      return list;
    } catch(err) {
      console.error("Error getting active users:", err);
      return [];
    }
  },
  async updateUserPointsDirectly(userId, newPoints) {
    try {
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, { points: parseInt(newPoints) });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating user points:", err);
      return { error: err.message };
    }
  },
  async updateUserDepartmentDirectly(userId, department) {
    try {
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, { department });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating user department:", err);
      return { error: err.message };
    }
  },
  async updateUserProfile(userId, name, lastname, department) {
    try {
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, {
        name: name.trim(),
        lastname: lastname.trim(),
        department
      });
      
      const local = getLocalUser();
      if (local && local.id === userId) {
        local.name = name.trim();
        local.lastname = lastname.trim();
        local.department = department;
        setLocalUser(local);
      }
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating user profile:", err);
      return { error: err.message };
    }
  },
  async updateUserAvatar(userId, avatarUrl) {
    try {
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, { avatar: avatarUrl });
      
      const local = getLocalUser();
      if (local && local.id === userId) {
        local.avatar = avatarUrl;
        setLocalUser(local);
      }
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating user avatar:", err);
      return { error: err.message };
    }
  },
  async getUserDoc(userId) {
    try {
      const snap = await getDoc(doc(db, 'usuarios', userId));
      return snap.exists() ? snap.data() : null;
    } catch(err) {
      console.error("Error in getUserDoc:", err);
      return null;
    }
  },
  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, 'usuarios', userId));
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error deleting user:", err);
      return { error: err.message };
    }
  },
  async deleteChallenge(challengeId) {
    try {
      // Delete the challenge document itself
      await deleteDoc(doc(db, 'retos', challengeId));

      // Clean up related user_challenges enrollments (orphan prevention)
      const ucQuery = query(collection(db, 'user_challenges'), where('challenge_id', '==', challengeId));
      const ucSnap = await getDocs(ucQuery);
      for (const ucDoc of ucSnap.docs) {
        await deleteDoc(doc(db, 'user_challenges', ucDoc.id));
      }

      // Clean up related evidencias (orphan prevention)
      const evQuery = query(collection(db, 'evidencias'), where('challenge_id', '==', challengeId));
      const evSnap = await getDocs(evQuery);
      for (const evDoc of evSnap.docs) {
        await deleteDoc(doc(db, 'evidencias', evDoc.id));
      }

      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error deleting challenge:", err);
      return { error: err.message };
    }
  },
  async updateChallengeDates(challengeId, startDate, endDate) {
    try {
      const ref = doc(db, 'retos', challengeId);
      await updateDoc(ref, {
        start_date: startDate || '',
        end_date: endDate || ''
      });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating challenge dates:", err);
      return { error: err.message };
    }
  },
  async updateChallengeDetails(challengeId, title, description, target) {
    try {
      const ref = doc(db, 'retos', challengeId);
      await updateDoc(ref, {
        title,
        description,
        target: parseFloat(target)
      });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating challenge details:", err);
      return { error: err.message };
    }
  },
  async updateChallengeStatus(challengeId, newStatus) {
    try {
      const ref = doc(db, 'retos', challengeId);
      await updateDoc(ref, {
        status: newStatus
      });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating challenge status:", err);
      return { error: err.message };
    }
  },
  async updateParticipantProgress(userId, challengeId, newProgress) {
    try {
      const q = query(
        collection(db, 'user_challenges'), 
        where('user_id', '==', userId), 
        where('challenge_id', '==', challengeId)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        return { error: "Inscripción no encontrada." };
      }
      
      const enrollDoc = snap.docs[0];
      const targetProgress = parseFloat(newProgress);
      
      const cSnap = await getDoc(doc(db, 'retos', challengeId));
      let status = 'active';
      if (cSnap.exists()) {
        const challenge = cSnap.data();
        if (targetProgress >= challenge.target) {
          status = 'completed';
        }
      }
      
      await updateDoc(enrollDoc.ref, { 
        progress: targetProgress,
        status: status
      });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating participant progress:", err);
      return { error: err.message };
    }
  },
  async updateReward(rewardId, title, description, pointsCost, category, icon, stock) {
    try {
      const ref = doc(db, 'rewards', rewardId);
      await updateDoc(ref, {
        title,
        description,
        points_cost: parseInt(pointsCost),
        category,
        icon: icon || '🥑',
        stock: parseInt(stock)
      });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error updating reward:", err);
      return { error: err.message };
    }
  },
  async deleteReward(rewardId) {
    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error deleting reward:", err);
      return { error: err.message };
    }
  },
  async resetUserPasswordDirectly(userId) {
    try {
      const ref = doc(db, 'usuarios', userId);
      await updateDoc(ref, {
        password_hash: null
      });
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error resetting password:", err);
      return { error: err.message };
    }
  },
  async getDashboardStatsSettings() {
    try {
      const dRef = doc(db, 'settings', 'dashboard_stats');
      const dSnap = await getDoc(dRef);
      if (dSnap.exists()) return dSnap.data();
      return null;
    } catch(err) {
      console.error("Error fetching dashboard stats settings:", err);
      return null;
    }
  },
  async saveDashboardStatsSettings(settings) {
    try {
      const dRef = doc(db, 'settings', 'dashboard_stats');
      await setDoc(dRef, settings);
      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error saving dashboard stats settings:", err);
      return { error: err.message };
    }
  },
  async resetDatabaseData() {
    try {
      const usersSnap = await getDocs(collection(db, 'usuarios'));
      for (const d of usersSnap.docs) {
        const userData = d.data();
        if (userData.role !== 'company') {
          const userRef = doc(db, 'usuarios', d.id);
          await updateDoc(userRef, {
            points: 0,
            streak: 0,
            daily_steps_history: [0, 0, 0, 0, 0, 0, 0],
            last_sync: null,
            last_login: null
          });
        }
      }

      const ucSnap = await getDocs(collection(db, 'user_challenges'));
      for (const d of ucSnap.docs) {
        await deleteDoc(doc(db, 'user_challenges', d.id));
      }

      const evSnap = await getDocs(collection(db, 'evidencias'));
      for (const d of evSnap.docs) {
        await deleteDoc(doc(db, 'evidencias', d.id));
      }

      const rrSnap = await getDocs(collection(db, 'redeemed_rewards'));
      for (const d of rrSnap.docs) {
        await deleteDoc(doc(db, 'redeemed_rewards', d.id));
      }

      const retosSnap = await getDocs(collection(db, 'retos'));
      for (const d of retosSnap.docs) {
        const retoRef = doc(db, 'retos', d.id);
        await updateDoc(retoRef, {
          participantsCount: 0
        });
      }

      try {
        await deleteDoc(doc(db, 'settings', 'dashboard_stats'));
      } catch(e) {}

      clearCache();
      return { success: true };
    } catch(err) {
      console.error("Error resetting database:", err);
      return { error: err.message };
    }
  }
};
