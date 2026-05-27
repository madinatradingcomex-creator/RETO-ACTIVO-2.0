import { supabase, isSupabaseConfigured } from '../supabaseClient';

// --- DATOS DE SEMILLA INICIALES (MOCKS) ---
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
    daily_steps_history: [7200, 9100, 11000, 8400, 12000, 6000, 500]
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
    daily_steps_history: [5000, 6200, 7500, 8000, 5100, 8200, 1200]
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
    daily_steps_history: [6200, 8400, 10200, 5100, 9200, 7100, 300]
  }
];

const ADMIN_USER = {
  id: 'admin_1',
  name: 'Recursos Humanos Acme',
  lastname: 'Admin',
  email: 'rrhh@acme.com',
  company_code: 'ACME2026',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
  points: 0,
  department: 'Recursos Humanos',
  role: 'company',
  level: 'Administrador de Bienestar 🏢'
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
  },
  {
    id: 'ch_3',
    title: 'Pausa Activa y Relajación',
    description: 'Registra al menos 5 sesiones de estiramientos o meditación de 10 minutos en la oficina para liberar la tensión muscular acumulada.',
    points: 150,
    category: 'lavender',
    target: 5,
    unit: 'sesiones',
    duration: '10 días',
    participantsCount: 15,
    image: '🧘‍♀️'
  }
];

const INITIAL_REWARDS = [
  {
    id: 'rw_1',
    title: 'Desayuno Saludable Gourmet',
    description: 'Un increíble desayuno fresco enviado directamente a tu oficina o casa: bowl de acai/yogurt, frutas de estación, tostadas con aguacate y jugo natural.',
    points_cost: 300,
    stock: 8,
    category: 'Alimentación',
    icon: '🥑'
  },
  {
    id: 'rw_2',
    title: 'Viernes de Tarde Libre',
    description: 'Canjea tus puntos acumulados por media jornada libre un viernes para que disfrutes de un fin de semana largo bien merecido.',
    points_cost: 800,
    stock: 3,
    category: 'Tiempo Libre',
    icon: '☀️'
  }
];

const INITIAL_PENDING_EVIDENCES = [
  {
    id: 'ev_1',
    user_id: 'usr_2',
    user_name: 'Carlos Benítez',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    user_department: 'Ventas',
    challenge_id: 'ch_1',
    challenge_title: 'Cruce de los Andes Virtual',
    amount: 15,
    unit: 'km',
    screenshot: 'evidencia_carlos.png',
    screenshot_preview: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=300',
    submitted_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// --- SISTEMA DE PERSISTENCIA LOCAL (LOCALSTORAGE) ---
const getLocalData = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

  // Inicializamos el storage v3
if (!localStorage.getItem('ra_initialized_v3')) {
  setLocalData('ra_users', INITIAL_PRESET_USERS);
  setLocalData('ra_challenges', INITIAL_CHALLENGES);
  setLocalData('ra_user_challenges', [
    { user_id: 'usr_4', challenge_id: 'ch_1', progress: 20, status: 'active', screenshot: null, enrolled_at: new Date().toISOString() },
    { user_id: 'usr_4', challenge_id: 'ch_2', progress: 34300, status: 'active', screenshot: null, enrolled_at: new Date().toISOString() }
  ]);
  setLocalData('ra_rewards', INITIAL_REWARDS);
  setLocalData('ra_redeemed_rewards', []);
  setLocalData('ra_pending_evidences', INITIAL_PENDING_EVIDENCES);
  
  // Establecer sesión activa inicial vacía (sin login automático)
  setLocalData('ra_current_user', null);
  
  localStorage.setItem('ra_initialized_v3', 'true');
}

// --- SERVICIO CENTRAL DE BASE DE DATOS (MOCK + PREPARACIÓN SUPABASE) ---
export const dbService = {
  
  // --- AUTENTICACIÓN ---
  
  async getCurrentUser() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('usuarios').select('*').single();
        if (!error) return data;
      } catch (err) {
        console.error("Error cargando usuario de Supabase:", err);
      }
    }
    return getLocalData('ra_current_user', null);
  },

  // Login con validación de código de empresa
  async loginWithCompanyCode(email, companyCode) {
    if (email === 'admin@acme.com' && companyCode === 'ACME2026') {
      setLocalData('ra_current_user', ADMIN_USER);
      return ADMIN_USER;
    }

    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.company_code.toUpperCase() === companyCode.toUpperCase());
    
    if (user) {
      setLocalData('ra_current_user', user);
      return user;
    }
    return null;
  },

  // Registrar un nuevo empleado con Nombre, Apellido, Email, Código Empresa y Departamento
  async registerUser(name, lastname, email, companyCode, department) {
    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const newId = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const fullName = `${name} ${lastname}`;

    const newUser = {
      id: newId,
      name,
      lastname,
      email,
      company_code: companyCode.toUpperCase(),
      avatar: randomAvatar,
      points: 100, // Regalo de bienvenida
      department,
      role: 'employee',
      level: 'Wellness Principiante 🌱',
      streak: 1,
      daily_steps_history: [0, 0, 0, 0, 0, 0, 0]
    };

    users.push(newUser);
    setLocalData('ra_users', users);
    setLocalData('ra_current_user', newUser);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('usuarios').insert(newUser);
      } catch (err) {
        console.error("Error al registrar en Supabase:", err);
      }
    }

    return newUser;
  },

  async logout() {
    localStorage.removeItem('ra_current_user');
  },

  async getPresetUsers() {
    return getLocalData('ra_users', INITIAL_PRESET_USERS);
  },

  // --- MÉTODOS DE EMPLEADO ---

  async updateUserStats(userId, pointsAdded, stepsToday = 0) {
    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const userIdx = users.findIndex(u => u.id === userId);
    
    if (userIdx !== -1) {
      users[userIdx].points += pointsAdded;
      if (stepsToday > 0) {
        const lastIdx = users[userIdx].daily_steps_history.length - 1;
        users[userIdx].daily_steps_history[lastIdx] += stepsToday;
      }
      setLocalData('ra_users', users);
      
      const currentUser = getLocalData('ra_current_user', null);
      if (currentUser && currentUser.id === userId) {
        currentUser.points = users[userIdx].points;
        currentUser.daily_steps_history = users[userIdx].daily_steps_history;
        setLocalData('ra_current_user', currentUser);
      }
    }
  },

  async getChallenges() {
    return getLocalData('ra_challenges', INITIAL_CHALLENGES);
  },

  async getRewards() {
    return getLocalData('ra_rewards', INITIAL_REWARDS);
  },

  async getUserChallenges(userId) {
    const userChallenges = getLocalData('ra_user_challenges', []);
    return userChallenges.filter(uc => uc.user_id === userId);
  },

  async enrollInChallenge(userId, challengeId) {
    const userChallenges = getLocalData('ra_user_challenges', []);
    
    if (userChallenges.some(uc => uc.user_id === userId && uc.challenge_id === challengeId)) {
      return userChallenges.filter(uc => uc.user_id === userId);
    }

    const newEnrollment = {
      user_id: userId,
      challenge_id: challengeId,
      progress: 0,
      status: 'active',
      screenshot: null,
      enrolled_at: new Date().toISOString()
    };

    userChallenges.push(newEnrollment);
    setLocalData('ra_user_challenges', userChallenges);

    const challenges = getLocalData('ra_challenges', INITIAL_CHALLENGES);
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      challenge.participantsCount += 1;
      setLocalData('ra_challenges', challenges);
    }

    return userChallenges.filter(uc => uc.user_id === userId);
  },

  // Registrar progreso con evidencia
  async logChallengeProgress(userId, challengeId, amount, screenshotFile = null, screenshotUrlMock = '') {
    const userChallenges = getLocalData('ra_user_challenges', []);
    const enrollment = userChallenges.find(uc => uc.user_id === userId && uc.challenge_id === challengeId);
    
    if (!enrollment) return { error: "No estás inscrito en este reto." };

    const challenges = getLocalData('ra_challenges', INITIAL_CHALLENGES);
    const challengeObj = challenges.find(c => c.id === challengeId);
    if (!challengeObj) return { error: "Reto no encontrado." };

    const currentUser = getLocalData('ra_current_user', null);
    const userFullName = `${currentUser.name} ${currentUser.lastname || ''}`;

    // Si tiene captura de pantalla, pasa por flujo de aprobación por RRHH
    if (screenshotFile || screenshotUrlMock) {
      const pendingEvidences = getLocalData('ra_pending_evidences', INITIAL_PENDING_EVIDENCES);
      const newEvidence = {
        id: `ev_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        user_name: userFullName,
        user_avatar: currentUser.avatar,
        user_department: currentUser.department,
        challenge_id: challengeId,
        challenge_title: challengeObj.title,
        amount: parseFloat(amount),
        unit: challengeObj.unit,
        screenshot: screenshotFile ? screenshotFile.name : 'evidencia_salud.png',
        screenshot_preview: screenshotUrlMock || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=300',
        submitted_at: new Date().toISOString()
      };
      
      pendingEvidences.unshift(newEvidence);
      setLocalData('ra_pending_evidences', pendingEvidences);
      
      return {
        pendingApproval: true,
        message: "Tu actividad y captura (o sincronización de salud) han sido enviadas para aprobación. RRHH validará tus pasos a la brevedad. 🕒"
      };
    }

    // Sin captura (ej. vasos de agua)
    enrollment.progress += parseFloat(amount);
    let completedNow = false;
    let pointsAwarded = 0;

    if (enrollment.progress >= challengeObj.target && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.progress = challengeObj.target;
      pointsAwarded = challengeObj.points;
      completedNow = true;
      
      await this.updateUserStats(userId, pointsAwarded, challengeObj.unit === 'pasos' ? amount : 0);
    } else {
      if (challengeObj.unit === 'pasos') {
        await this.updateUserStats(userId, 0, amount);
      }
    }

    setLocalData('ra_user_challenges', userChallenges);

    return {
      enrollment,
      completed: completedNow,
      pointsAwarded
    };
  },

  async redeemReward(userId, rewardId) {
    const rewards = getLocalData('ra_rewards', INITIAL_REWARDS);
    const rewardIdx = rewards.findIndex(r => r.id === rewardId);
    if (rewardIdx === -1) return { error: "El premio no existe." };
    
    const reward = rewards[rewardIdx];
    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const userIdx = users.findIndex(u => u.id === userId);
    
    if (userIdx === -1) return { error: "Usuario no encontrado." };
    const user = users[userIdx];

    if (user.points < reward.points_cost) {
      return { error: "No tienes suficientes puntos." };
    }

    if (reward.stock <= 0) {
      return { error: "Este premio se encuentra agotado." };
    }

    user.points -= reward.points_cost;
    reward.stock -= 1;
    
    setLocalData('ra_users', users);
    setLocalData('ra_rewards', rewards);

    const currentUser = getLocalData('ra_current_user', null);
    if (currentUser && currentUser.id === userId) {
      currentUser.points = user.points;
      setLocalData('ra_current_user', currentUser);
    }

    const redeemedRewards = getLocalData('ra_redeemed_rewards', []);
    const newRedemption = {
      id: `red_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      reward_id: rewardId,
      reward_title: reward.title,
      reward_icon: reward.icon,
      points_cost: reward.points_cost,
      redeemed_at: new Date().toISOString(),
      status: 'approved'
    };

    redeemedRewards.unshift(newRedemption);
    setLocalData('ra_redeemed_rewards', redeemedRewards);

    return {
      success: true,
      newPoints: user.points,
      redemption: newRedemption
    };
  },

  async getRedeemedRewards(userId) {
    const redeemed = getLocalData('ra_redeemed_rewards', []);
    return redeemed.filter(r => r.user_id === userId);
  },

  async getLeaderboard() {
    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const sorted = [...users].sort((a, b) => b.points - a.points);
    return sorted.map((u, idx) => ({
      id: u.id,
      name: `${u.name} ${u.lastname || ''}`,
      avatar: u.avatar,
      points: u.points,
      department: u.department,
      rank: idx + 1
    }));
  },

  // --- PORTAL DE EMPRESAS (MÉTODOS ADMINISTRATIVOS) ---

  async getPendingEvidences() {
    return getLocalData('ra_pending_evidences', INITIAL_PENDING_EVIDENCES);
  },

  async approveEvidence(evidenceId) {
    const pending = getLocalData('ra_pending_evidences', INITIAL_PENDING_EVIDENCES);
    const idx = pending.findIndex(e => e.id === evidenceId);
    if (idx === -1) return { error: "Evidencia no encontrada." };

    const evidence = pending[idx];
    const userChallenges = getLocalData('ra_user_challenges', []);
    
    const enrollment = userChallenges.find(uc => uc.user_id === evidence.user_id && uc.challenge_id === evidence.challenge_id);
    const challenges = getLocalData('ra_challenges', INITIAL_CHALLENGES);
    const challengeObj = challenges.find(c => c.id === evidence.challenge_id);

    let completedNow = false;
    let pointsAwarded = 0;

    if (enrollment && challengeObj) {
      enrollment.progress += parseFloat(evidence.amount);
      enrollment.screenshot = evidence.screenshot;

      if (enrollment.progress >= challengeObj.target && enrollment.status !== 'completed') {
        enrollment.status = 'completed';
        enrollment.progress = challengeObj.target;
        pointsAwarded = challengeObj.points;
        completedNow = true;
        
        await this.updateUserStats(evidence.user_id, pointsAwarded, challengeObj.unit === 'pasos' ? evidence.amount : 0);
      } else {
        await this.updateUserStats(
          evidence.user_id, 
          0, 
          challengeObj.unit === 'pasos' ? evidence.amount : 0
        );
      }
      setLocalData('ra_user_challenges', userChallenges);
    }

    pending.splice(idx, 1);
    setLocalData('ra_pending_evidences', pending);

    return {
      success: true,
      user_id: evidence.user_id,
      completed: completedNow,
      pointsAwarded
    };
  },

  async rejectEvidence(evidenceId) {
    const pending = getLocalData('ra_pending_evidences', INITIAL_PENDING_EVIDENCES);
    const idx = pending.findIndex(e => e.id === evidenceId);
    if (idx === -1) return { error: "Evidencia no encontrada." };

    pending.splice(idx, 1);
    setLocalData('ra_pending_evidences', pending);
    return { success: true };
  },

  async createChallenge(title, description, points, category, target, unit, duration, image) {
    const challenges = getLocalData('ra_challenges', INITIAL_CHALLENGES);
    const newChallenge = {
      id: `ch_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      points: parseInt(points),
      category,
      target: parseFloat(target),
      unit,
      duration,
      participantsCount: 0,
      image: image || '🏆'
    };

    challenges.push(newChallenge);
    setLocalData('ra_challenges', challenges);
    return newChallenge;
  },

  async createReward(title, description, points_cost, category, icon, stock) {
    const rewards = getLocalData('ra_rewards', INITIAL_REWARDS);
    const newReward = {
      id: `rw_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      points_cost: parseInt(points_cost),
      stock: parseInt(stock),
      category,
      icon: icon || '🎁'
    };

    rewards.push(newReward);
    setLocalData('ra_rewards', rewards);
    return newReward;
  },

  async getCompanyStats() {
    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const userChallenges = getLocalData('ra_user_challenges', []);
    
    const totalCompanySteps = users.reduce((sum, u) => sum + u.daily_steps_history.reduce((a,b)=>a+b, 0), 0);
    
    const totalEmployeesCount = users.length;
    const activeEmployeesCount = users.filter(u => {
      const enrolls = userChallenges.filter(uc => uc.user_id === u.id && uc.status === 'active');
      return enrolls.length > 0;
    }).length;
    
    const participationPercentage = Math.round((activeEmployeesCount / totalEmployeesCount) * 100) || 0;
    const totalPointsAwarded = users.reduce((sum, u) => sum + u.points, 0);

    const deptStats = {};
    users.forEach(u => {
      const uSteps = u.daily_steps_history.reduce((a,b)=>a+b, 0);
      if (!deptStats[u.department]) {
        deptStats[u.department] = { steps: 0, points: 0, members: 0 };
      }
      deptStats[u.department].steps += uSteps;
      deptStats[u.department].points += u.points;
      deptStats[u.department].members += 1;
    });

    const deptChartData = Object.keys(deptStats).map(name => ({
      name,
      steps: deptStats[name].steps,
      points: deptStats[name].points,
      avgSteps: Math.round(deptStats[name].steps / deptStats[name].members)
    }));

    return {
      totalCompanySteps,
      participationPercentage,
      totalPointsAwarded,
      deptChartData,
      totalEmployeesCount
    };
  },

  // --- GOOGLE FIT INTEGRATION (FASE 1: OAUTH 2.0 + REST API) ---

  // Construir la URL de autorización de Google OAuth 2.0
  buildGoogleOAuthUrl(clientId, redirectUri) {
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: scopes,
      prompt: 'consent',
      access_type: 'online',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  // Extraer el token de acceso del hash de la URL (después del redirect de Google)
  extractTokenFromUrl() {
    const hash = window.location.hash;
    if (!hash) return null;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');
    if (token) {
      // Limpiar la URL para que quede limpia
      window.history.replaceState({}, document.title, window.location.pathname);
      return { token, expiresIn: parseInt(expiresIn || '3600') };
    }
    return null;
  },

  // Guardar y recuperar el token de Google Fit
  saveGoogleFitToken(token, expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('ra_gfit_token', token);
    localStorage.setItem('ra_gfit_expires_at', expiresAt.toString());
  },

  getGoogleFitToken() {
    const token = localStorage.getItem('ra_gfit_token');
    const expiresAt = parseInt(localStorage.getItem('ra_gfit_expires_at') || '0');
    if (!token || Date.now() > expiresAt) {
      this.clearGoogleFitToken();
      return null;
    }
    return token;
  },

  clearGoogleFitToken() {
    localStorage.removeItem('ra_gfit_token');
    localStorage.removeItem('ra_gfit_expires_at');
  },

  isGoogleFitConnected() {
    return !!this.getGoogleFitToken();
  },

  // Consultar pasos de los últimos 7 días a Google Fit REST API
  async fetchWeeklyStepsFromGoogleFit(token) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000); // 7 días incluyendo hoy

    const body = {
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: startOfWeek.getTime(),
      endTimeMillis: now.getTime(),
    };

    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Error al consultar Google Fit');
    }

    const data = await response.json();
    const dailySteps = [];
    let totalSteps = 0;
    
    if (data.bucket && data.bucket.length > 0) {
      data.bucket.forEach(bucket => {
        let bucketSteps = 0;
        if (bucket.dataset && bucket.dataset.length > 0) {
          bucket.dataset.forEach(ds => {
            if (ds.point && ds.point.length > 0) {
              ds.point.forEach(pt => {
                if (pt.value && pt.value.length > 0) {
                  bucketSteps += pt.value[0].intVal || 0;
                }
              });
            }
          });
        }
        dailySteps.push(bucketSteps);
        totalSteps += bucketSteps;
      });
    }
    
    // Asegurar que sean exactamente 7 días para el gráfico
    while (dailySteps.length < 7) { dailySteps.unshift(0); }
    if (dailySteps.length > 7) { dailySteps.splice(0, dailySteps.length - 7); }

    return { dailySteps, totalSteps };
  },

  // Sincronizar pasos de Google Fit: actualiza usuario + crea evidencia auto-aprobada
  async syncGoogleFitSteps(userId, challengeId, fitData) {
    const { dailySteps, totalSteps } = fitData;
    const kmEquivalent = parseFloat((totalSteps / 1312).toFixed(2)); // 1312 pasos ≈ 1 km

    // Actualizar historial de pasos de la semana del usuario
    const users = getLocalData('ra_users', INITIAL_PRESET_USERS);
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx].daily_steps_history = dailySteps;
      setLocalData('ra_users', users);
      const cu = getLocalData('ra_current_user', null);
      if (cu && cu.id === userId) {
        cu.daily_steps_history = dailySteps;
        setLocalData('ra_current_user', cu);
      }
    }

    // Si hay un reto seleccionado, crear evidencia auto-aprobada con badge de Google Fit
    if (challengeId) {
      const challenges = getLocalData('ra_challenges', INITIAL_CHALLENGES);
      const challengeObj = challenges.find(c => c.id === challengeId);
      const currentUser = getLocalData('ra_current_user', null);

      if (challengeObj && currentUser) {
        // Aprobar directo sin pasar por bandeja de revisión (fuente confiable: Google)
        const evidenceId = 'ev_gfit_' + Date.now();
        const pts = Math.floor(kmEquivalent * 10);
        
        const newEvidence = {
          id: evidenceId,
          challengeId,
          userId,
          userName: currentUser.name,
          type: challengeObj.type,
          activityType: 'google_fit_sync',
          date: new Date().toISOString(),
          status: 'approved',
          pointsAwarded: pts,
          value: totalSteps,
          metrics: { km: kmEquivalent },
          source: 'google_fit'
        };

        const userChallenges = getLocalData('ra_user_challenges', []);
        const enrollment = userChallenges.find(uc => uc.user_id === userId && uc.challenge_id === challengeId);

        const amount = challengeObj.unit === 'pasos' ? totalSteps : kmEquivalent;

        if (enrollment) {
          enrollment.progress += parseFloat(amount);
          let pointsAwarded = 0;
          let completedNow = false;
          if (enrollment.progress >= challengeObj.target && enrollment.status !== 'completed') {
            enrollment.status = 'completed';
            enrollment.progress = challengeObj.target;
            pointsAwarded = challengeObj.points;
            completedNow = true;
          }
          setLocalData('ra_user_challenges', userChallenges);
          if (pointsAwarded > 0) {
            await this.updateUserStats(userId, pointsAwarded);
          }
          return { steps, kmEquivalent, completed: completedNow, pointsAwarded };
        }
      }
    }

    return { steps, kmEquivalent, completed: false, pointsAwarded: 0 };
  },

  // Guardar la última sincronización para mostrarlo en la UI
  saveLastSync(userId, steps) {
    localStorage.setItem(`ra_gfit_last_sync_${userId}`, JSON.stringify({
      steps,
      syncedAt: new Date().toISOString(),
    }));
  },

  getLastSync(userId) {
    const raw = localStorage.getItem(`ra_gfit_last_sync_${userId}`);
    return raw ? JSON.parse(raw) : null;
  },
};

