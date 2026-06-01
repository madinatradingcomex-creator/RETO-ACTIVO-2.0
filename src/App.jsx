import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { 
  LayoutDashboard, 
  Trophy, 
  Gift, 
  User, 
  Flame, 
  Footprints, 
  Activity, 
  Sparkles, 
  Plus, 
  Upload, 
  X, 
  Check, 
  Search,
  CheckCircle2,
  Lock,
  HeartHandshake,
  LogOut,
  Building,
  ClipboardCheck,
  PlusCircle,
  Award,
  RefreshCw,
  Mail,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Trash2,
  Edit2
} from 'lucide-react';
import { dbService } from './services/db';
import './App.css';



function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const local = sessionStorage.getItem('ra_current_user');
    return local ? JSON.parse(local) : null;
  });
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [landingView, setLandingView] = useState(() => {
    const local = sessionStorage.getItem('ra_current_user');
    if (local) return false;
    const hash = window.location.hash.replace('#', '');
    return !hash || hash === 'landing';
  });
  
  // Login Form Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCompanyCode, setLoginCompanyCode] = useState('');

  // Register Form Inputs
  const [regName, setRegName] = useState('');
  const [regLastname, setRegLastname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompanyCode, setRegCompanyCode] = useState('');
  const [regDept, setRegDept] = useState('Tecnología');

  // Admin Challenges Manager & Detail view states (Hoisted for Navigation effects)
  const [adminSelectedChallenge, setAdminSelectedChallenge] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'challenge_detail') {
      window.location.hash = 'dashboard';
      return 'dashboard';
    }
    return (hash && hash !== 'landing') ? hash : 'dashboard';
  });



  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'landing') {
        setLandingView(true);
      } else {
        setLandingView(false);
        if (hash === 'challenge_detail' && !adminSelectedChallenge) {
          window.location.hash = 'dashboard';
          setActiveTab('dashboard');
        } else if (hash === 'user_detail' && !selectedDetailUser) {
          window.location.hash = 'manage_users';
          setActiveTab('manage_users');
        } else if (hash !== activeTab) {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab, adminSelectedChallenge, selectedDetailUser]);

  useEffect(() => {
    if (landingView) {
      if (window.location.hash !== '#landing') {
        window.location.hash = 'landing';
      }
    } else {
      if (window.location.hash.replace('#', '') !== activeTab) {
        window.location.hash = activeTab;
      }
    }
  }, [activeTab, landingView]);
  
  // Data States
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Admin Data States
  const [pendingEvidences, setPendingEvidences] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [companyStats, setCompanyStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeUsersSearch, setActiveUsersSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editPoints, setEditPoints] = useState('');
  const [editDept, setEditDept] = useState('');
  
  // Forms - Employee Log
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [logAmount, setLogAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auth Password States
  const [loginPassword, setLoginPassword] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showMigratePasswordModal, setShowMigratePasswordModal] = useState(false);
  const [migratePassword, setMigratePassword] = useState('');
  const [migratePasswordConfirm, setMigratePasswordConfirm] = useState('');
  const [migrateUserRef, setMigrateUserRef] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Custom Premium UI/UX Toggle States
  const [showFitBreakdown, setShowFitBreakdown] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);
  const [showMigratePassword, setShowMigratePassword] = useState(false);
  const [showMigratePasswordConfirm, setShowMigratePasswordConfirm] = useState(false);

  // Terms & Conditions States
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);


  // Forms - Admin Create Challenge
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPoints, setCPoints] = useState('');
  const [cCategory, setCCategory] = useState('mobility');
  const [cTarget, setCTarget] = useState('');
  const [cUnit, setCUnit] = useState('km');
  const [cDuration, setCDuration] = useState('7 días');
  const [cIcon, setCIcon] = useState('🚴‍♀️');
  const [cStartDate, setCStartDate] = useState('');
  const [cEndDate, setCEndDate] = useState('');
  const [cModality, setCModality] = useState('scheduled');
  const [cEnrollmentDeadline, setCEnrollmentDeadline] = useState('');

  // Admin Challenges Manager & Detail view states (Participants declared here)
  const [adminChallengeParticipants, setAdminChallengeParticipants] = useState([]);
  const [loadingAdminRanking, setLoadingAdminRanking] = useState(false);
  const [adminChallengesFilter, setAdminChallengesFilter] = useState('all');

  // Modals for editing challenge dates & progress
  const [showEditDatesModal, setShowEditDatesModal] = useState(false);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSavingDates, setIsSavingDates] = useState(false);

  const [showEditProgressModal, setShowEditProgressModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [editProgressValue, setEditProgressValue] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Forms - Admin Create Reward
  const [rTitle, setRTitle] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rPoints, setRPoints] = useState('');
  const [rCategory, setRCategory] = useState('Alimentación');
  const [rIcon, setRIcon] = useState('🥑');
  const [rStock, setRStock] = useState('10');

  // Modals for editing reward
  const [showEditRewardModal, setShowEditRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editRTitle, setEditRTitle] = useState('');
  const [editRDesc, setEditRDesc] = useState('');
  const [editRPoints, setEditRPoints] = useState('');
  const [editRCategory, setEditRCategory] = useState('Alimentación');
  const [editRIcon, setEditRIcon] = useState('🥑');
  const [editRStock, setEditRStock] = useState('10');
  const [isSavingReward, setIsSavingReward] = useState(false);

  // User detail states (ficha del colaborador)
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);
  const [userDetailChallenges, setUserDetailChallenges] = useState([]);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Search and Filters
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [challengesFilter, setChallengesFilter] = useState('all');
  const [rewardsFilter, setRewardsFilter] = useState('Todos');
  
  // Full screen preview of evidences
  const [previewEvidenceImage, setPreviewEvidenceImage] = useState(null);
  
  // Notifications/Toast
  const [toast, setToast] = useState(null);

  // === GOOGLE FIT STATE ===
  const [gFitConnected, setGFitConnected] = useState(false);
  const [gFitSyncing, setGFitSyncing] = useState(false);
  const [gFitLastSync, setGFitLastSync] = useState(null);

  const [gFitSyncDays, setGFitSyncDays] = useState(7); // 1, 2, 3, 4, 5, or 7
  const [challengeRankings, setChallengeRankings] = useState({});

  const loadViewData = async (userSession) => {
    if (!userSession) return;
    
    try {
      if (userSession.role === 'company') {
        const pending = await dbService.getPendingEvidences();
        const pendingUsrs = await dbService.getPendingUsers();
        const stats = await dbService.getCompanyStats();
        const activeUsrs = await dbService.getActiveUsers();
        setPendingEvidences(pending);
        setPendingUsers(pendingUsrs);
        setCompanyStats(stats);
        setActiveUsers(activeUsrs);
        
        const challengesData = await dbService.getChallenges();
        const rewardsData = await dbService.getRewards();
        setChallenges(challengesData);
        setRewards(rewardsData);
      } else {
        const challengesData = await dbService.getChallenges();
        const userChallengesData = await dbService.getUserChallenges(userSession.id);
        const rewardsData = await dbService.getRewards();
        const redeemedData = await dbService.getRedeemedRewards(userSession.id);
        const leaderboardData = await dbService.getLeaderboard();

        setChallenges(challengesData);
        setUserChallenges(userChallengesData);
        setRewards(rewardsData);
        setRedeemedRewards(redeemedData);
        setLeaderboard(leaderboardData);

        // Fetch rankings for active employee challenges (P10)
        const rankingsMap = {};
        for (const uc of userChallengesData) {
          if (uc.status === 'active') {
            try {
              const rList = await dbService.getChallengeRanking(uc.challenge_id);
              rankingsMap[uc.challenge_id] = rList;
            } catch(e) {
              console.error("Error loading ranking for challenge " + uc.challenge_id, e);
            }
          }
        }
        setChallengeRankings(rankingsMap);
      }
    } catch (error) {
      console.error("Error cargando información de la vista:", error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const active = await dbService.getCurrentUser();

      if (active) {
        setCurrentUser(active);
        setLandingView(false);
        await loadViewData(active);
        // Verificar si ya tiene token guardado válido
        const connected = dbService.isGoogleFitConnected();
        setGFitConnected(connected);
        if (connected && active.role === 'employee') {
          const lastSync = dbService.getLastSync(active.id);
          setGFitLastSync(lastSync);
        }
      } else {
        setLandingView(true);
      }
    } catch (err) {
      console.error("Error al cargar sesión activa:", err);
    } finally {
      setLoadingSession(false);
    }
  };

  // Load initial session on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // --- ACTIONS: AUTENTICACIÓN ---
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginCompanyCode.trim() || !loginPassword.trim()) {
      showToastMessage("Por favor completa el email, el código de empresa y la contraseña.", "error");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await dbService.loginWithCompanyCode(loginEmail, loginCompanyCode, loginPassword);
      
      if (!res) {
        setLoginError("No se recibió respuesta del servidor de base de datos.");
        showToastMessage("No se recibió respuesta del servidor de base de datos.", "error");
        return;
      }

      if (res.error) {
        setLoginError(res.error);
        showToastMessage(res.error, "error");
        return;
      }

      if (res.needsMigration) {
        setMigrateUserRef(res.user);
        setMigratePassword('');
        setMigratePasswordConfirm('');
        setShowMigratePasswordModal(true);
        return;
      }

      if (res.success && res.user) {
        setCurrentUser(res.user);
        setLandingView(false);
        setActiveTab('dashboard');
        showToastMessage(`¡Acceso correcto! Bienvenido, ${res.user.name} ${res.user.lastname || ''} 🌟`);
        loadViewData(res.user);
        setLoginEmail('');
        setLoginCompanyCode('');
        setLoginPassword('');
      }
    } catch (err) {
      console.error("Error crítico en login:", err);
      setLoginError(`Error de red o conexión: ${err.message || err}`);
      showToastMessage(`Error de red o conexión: ${err.message || err}`, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMigratePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!migratePassword || migratePassword.length < 6) {
      showToastMessage("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }
    if (migratePassword !== migratePasswordConfirm) {
      showToastMessage("Las contraseñas no coinciden.", "error");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await dbService.setUserPassword(migrateUserRef.id, migratePassword);
      if (res.error) {
        showToastMessage(res.error, "error");
        return;
      }

      // Attempt login with the newly created password to establish session
      const logged = await dbService.loginWithCompanyCode(migrateUserRef.email, migrateUserRef.company_code, migratePassword);
      if (logged.success && logged.user) {
        setCurrentUser(logged.user);
        setLandingView(false);
        setActiveTab('dashboard');
        setShowMigratePasswordModal(false);
        setMigrateUserRef(null);
        showToastMessage("🔑 ¡Contraseña establecida con éxito! Tu cuenta ahora está protegida.");
        loadViewData(logged.user);
        
        setLoginEmail('');
        setLoginCompanyCode('');
        setLoginPassword('');
        setMigratePassword('');
        setMigratePasswordConfirm('');
      } else {
        showToastMessage("Error al iniciar sesión tras establecer contraseña.", "error");
      }
    } catch (err) {
      console.error("Error crítico al migrar contraseña:", err);
      showToastMessage(`Error al guardar contraseña: ${err.message || err}`, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };



  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regLastname.trim() || !regEmail.trim() || !regCompanyCode.trim() || !regPassword.trim()) {
      showToastMessage("Por favor rellena todos los campos requeridos.", "error");
      return;
    }

    if (regPassword.length < 6) {
      showToastMessage("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      showToastMessage("Las contraseñas no coinciden.", "error");
      return;
    }

    if (!acceptedTerms) {
      showToastMessage("Debes aceptar los Términos y Condiciones para continuar.", "error");
      return;
    }

    const registered = await dbService.registerUser(
      regName,
      regLastname,
      regEmail,
      regCompanyCode,
      regDept,
      regPassword
    );

    if (registered) {
      setCurrentUser(registered);
      setLandingView(false);
      setActiveTab('dashboard');
      setShowRegisterForm(false);
      
      // Clear registration inputs
      setRegName('');
      setRegLastname('');
      setRegEmail('');
      setRegCompanyCode('');
      setRegPassword('');
      setRegPasswordConfirm('');
      setAcceptedTerms(false);
      
      showToastMessage("🎉 ¡Perfil de bienestar creado con éxito! Te regalamos 100 puntos de bienvenida.");
      loadViewData(registered);
    } else {
      showToastMessage("Ocurrió un error al registrar el usuario.", "error");
    }
  };

  const handleApproveUser = async (userId, userName) => {
    try {
      await dbService.approveUser(userId);
      showToastMessage(`🎉 ¡${userName} ha sido aprobado correctamente! Ahora tiene acceso total.`);
      // Actualizar estados locales de pendientes
      const pending = await dbService.getPendingUsers();
      setPendingUsers(pending);
      
      // Actualizar stats corporativas
      const stats = await dbService.getCompanyStats();
      setCompanyStats(stats);
    } catch (err) {
      console.error(err);
      showToastMessage("Error al aprobar al colaborador.", "error");
    }
  };

  const handleRejectUser = async (userId, userName) => {
    try {
      await dbService.rejectUser(userId);
      showToastMessage(`🚫 Se ha rechazado el acceso de ${userName}.`, "error");
      
      // Actualizar estados locales
      const pending = await dbService.getPendingUsers();
      setPendingUsers(pending);
      
      const stats = await dbService.getCompanyStats();
      setCompanyStats(stats);
    } catch (err) {
      console.error(err);
      showToastMessage("Error al rechazar al colaborador.", "error");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditPoints(user.points || 0);
    setEditDept(user.department || '');
  };

  const handleSaveUserChanges = async () => {
    if (!editingUser) return;
    try {
      if (editingUser.points !== parseInt(editPoints)) {
        await dbService.updateUserPointsDirectly(editingUser.id, editPoints);
      }
      if (editingUser.department !== editDept) {
        await dbService.updateUserDepartmentDirectly(editingUser.id, editDept);
      }
      showToastMessage(`💾 Datos de ${editingUser.name} actualizados correctamente.`);
      setEditingUser(null);
      
      // Actualizar lista local de colaboradores activos
      const activeUsrs = await dbService.getActiveUsers();
      setActiveUsers(activeUsrs);
      
      // Actualizar estadísticas de la empresa
      const stats = await dbService.getCompanyStats();
      setCompanyStats(stats);
    } catch(err) {
      console.error(err);
      showToastMessage("Error al guardar los cambios del colaborador.", "error");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (confirm(`⚠️ ¿Estás completamente seguro de que deseas dar de baja a ${userName}? Esta acción eliminará su cuenta y todo su progreso de forma permanente.`)) {
      try {
        await dbService.deleteUser(userId);
        showToastMessage(`🚫 Se ha dado de baja la cuenta de ${userName} correctamente.`, "error");
        
        // Actualizar lista local de colaboradores activos
        const activeUsrs = await dbService.getActiveUsers();
        setActiveUsers(activeUsrs);
        
        // Actualizar estadísticas de la empresa
        const stats = await dbService.getCompanyStats();
        setCompanyStats(stats);
      } catch(err) {
        console.error(err);
        showToastMessage("Error al dar de baja al colaborador.", "error");
      }
    }
  };

  const handleLogout = async () => {
    await dbService.logout();
    setCurrentUser(null);
    setLandingView(true);
    showToastMessage("Sesión cerrada. ¡Vuelve pronto!");
  };

  // --- ACTIONS: GOOGLE FIT INTEGRATION ---

  // Iniciar el flujo OAuth de Google (redirige a Google para autorización)
  const handleConnectGoogleFit = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      showToastMessage('✅ Token obtenido de Google. Consultando pasos...');
      setGFitSyncing(true);
      try {
        const token = tokenResponse.access_token;
        const fitData = await dbService.fetchWeeklyStepsFromGoogleFit(token);
        dbService.saveGoogleFitToken(token, 3600);
        setGFitConnected(true);
        await performGFitSync(currentUser, fitData);
      } catch(err) {
        console.error("Error connecting Google Fit:", err);
        showToastMessage('⚠️ No se pudieron leer los pasos de Google Fit.', 'error');
      } finally {
        setGFitSyncing(false);
      }
    },
    onError: error => {
      console.error(error);
      showToastMessage('Error al autorizar con Google.', 'error');
    },
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
  });

  // Sincronizar manualmente (ya conectado)
  const handleGFitResync = async () => {
    const token = dbService.getGoogleFitToken();
    if (!token) {
      setGFitConnected(false);
      showToastMessage('La sesión de Google Fit expiró. Vuelve a conectar.', 'error');
      return;
    }

    setGFitSyncing(true);
    try {
      const fitData = await dbService.fetchWeeklyStepsFromGoogleFit(token);
      await performGFitSync(currentUser, fitData);
    } catch(err) {
      console.error(err);
      showToastMessage('⚠️ No se pudieron sincronizar los pasos.', 'error');
      setGFitSyncing(false);
    }
  };

  // Desconectar Google Fit
  const handleDisconnectGoogleFit = () => {
    googleLogout();
    dbService.clearGoogleFitToken();
    setGFitConnected(false);
    setGFitLastSync(null);
    showToastMessage('Google Fit desconectado.');
  };

  // Lógica central: tomar los pasos y actualizar todo
  const performGFitSync = async (user, fitData) => {
    const result = await dbService.syncGoogleFitSteps(user.id, fitData, gFitSyncDays);
    const totalSteps = fitData.totalSteps || 0;
    dbService.saveLastSync(user.id, totalSteps);

    const syncInfo = { steps: totalSteps, syncedAt: new Date().toISOString() };
    setGFitLastSync(syncInfo);
    setGFitSyncing(false);

    // Refrescar datos de la vista
    await loadViewData(user);

    const kmText = result.kmEquivalent ? ` (≈ ${result.kmEquivalent} km)` : '';
    
    if (result.syncedChallenges && result.syncedChallenges.length > 0) {
      const challengeTitles = result.syncedChallenges.map(sc => `"${sc.title}"`).join(', ');
      if (result.completed) {
        showToastMessage(`🏆 ¡Google Fit sincronizado! Retos completados (+${result.pointsAwarded} pts). Se actualizaron: ${challengeTitles}.`);
      } else {
        showToastMessage(`📲 ¡Sincronizado! Se actualizó tu progreso en: ${challengeTitles}${kmText}.`);
      }
    } else {
      showToastMessage(`🌱 ¡Sincronizado! ${totalSteps.toLocaleString()} pasos${kmText} importados en tu historial.`);
    }
  };

  const handleEnroll = async (challengeId) => {
    const res = await dbService.enrollInChallenge(currentUser.id, challengeId);
    if (res && res.error) {
      showToastMessage(res.error, "error");
      return;
    }
    setUserChallenges(res);
    
    const challengesData = await dbService.getChallenges();
    setChallenges(challengesData);
    
    const challenge = challengesData.find(c => c.id === challengeId);
    showToastMessage(`¡Te has anotado con éxito al reto "${challenge.title}"! 🌱`);
  };

  const openLogActivityModal = (challenge) => {
    setSelectedChallenge(challenge);
    setLogAmount('');
    setScreenshot(null);
    setScreenshotPreview('');
    setShowLogModal(true);
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!logAmount || isNaN(logAmount) || parseFloat(logAmount) <= 0) {
      showToastMessage("Por favor ingresa una cantidad válida de actividad.", "error");
      return;
    }

    if (!screenshot && !screenshotPreview) {
      showToastMessage("Por favor adjunta una captura de pantalla como evidencia de tu actividad para evitar registros duplicados o incorrectos.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dbService.logChallengeProgress(
        currentUser.id,
        selectedChallenge.id,
        parseFloat(logAmount),
        screenshot,
        screenshotPreview
      );

      if (res.error) {
        showToastMessage(res.error, "error");
        setIsSubmitting(false);
        return;
      }

      setShowLogModal(false);
      setLogAmount('');
      setScreenshot(null);
      setScreenshotPreview('');
      await loadViewData(currentUser);

      if (res.pendingApproval) {
        showToastMessage(res.message, "success");
      } else if (res.completed) {
        showToastMessage(`🎉 ¡Felicidades! Has completado el reto y ganado +${res.pointsAwarded} puntos.`);
      } else {
        showToastMessage(`💪 Progreso registrado correctamente para el reto.`);
      }
    } catch (err) {
      console.error(err);
      showToastMessage("Error al enviar el progreso.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    const res = await dbService.redeemReward(currentUser.id, rewardId);
    
    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    await loadViewData(currentUser);
    showToastMessage(`🎁 ¡Premio canjeado! Revisa tu cupón en la sección "Mi Perfil".`);
  };

  // --- ACTIONS: EMPRESA (ADMIN) ---

  const handleApproveEvidence = async (evidenceId) => {
    const res = await dbService.approveEvidence(evidenceId);
    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }
    
    showToastMessage("Evidencia aprobada con éxito. ¡Puntos y kilómetros acreditados al empleado! ✅");
    loadViewData(currentUser);
  };

  const handleRejectEvidence = async (evidenceId) => {
    const res = await dbService.rejectEvidence(evidenceId);
    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }
    
    showToastMessage("Evidencia rechazada. Se ha quitado de la lista de revisión.", "error");
    loadViewData(currentUser);
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!cTitle || !cDesc || !cPoints || !cTarget) {
      showToastMessage("Por favor rellena todos los campos requeridos.", "error");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let finalStartDate = '';
    let finalEndDate = '';
    let finalEnrollmentDeadline = '';

    if (cModality === 'scheduled') {
      if (!cStartDate || !cEndDate) {
        showToastMessage("Para la modalidad programada, debes definir fecha de inicio y finalización.", "error");
        return;
      }
      if (new Date(cStartDate) > new Date(cEndDate)) {
        showToastMessage("La fecha de inicio no puede ser posterior a la fecha de finalización.", "error");
        return;
      }
      finalStartDate = cStartDate;
      finalEndDate = cEndDate;
      finalEnrollmentDeadline = cStartDate;
    } else {
      // Immediate
      if (!cEnrollmentDeadline) {
        showToastMessage("Para inicio inmediato, debes definir una fecha límite de inscripción.", "error");
        return;
      }
      if (cEnrollmentDeadline < todayStr) {
        showToastMessage("La fecha límite de inscripción no puede ser anterior a hoy.", "error");
        return;
      }
      if (cEndDate && cEndDate < todayStr) {
        showToastMessage("La fecha de finalización no puede ser en el pasado.", "error");
        return;
      }
      if (cEndDate && cEndDate < cEnrollmentDeadline) {
        showToastMessage("La fecha de finalización no puede ser anterior al límite de inscripción.", "error");
        return;
      }
      finalStartDate = todayStr;
      finalEndDate = cEndDate || ''; // Optional end date
      finalEnrollmentDeadline = cEnrollmentDeadline;
    }

    const newChallenge = await dbService.createChallenge(
      cTitle,
      cDesc,
      cPoints,
      cCategory,
      cTarget,
      cUnit,
      cDuration,
      cIcon,
      finalStartDate,
      finalEndDate,
      cModality,
      finalEnrollmentDeadline
    );

    showToastMessage(`🚀 ¡Reto "${newChallenge.title}" publicado con éxito! Ya se encuentra en la biblioteca.`);
    
    setCTitle('');
    setCDesc('');
    setCPoints('');
    setCTarget('');
    setCStartDate('');
    setCEndDate('');
    setCEnrollmentDeadline('');
    setCModality('scheduled');
    
    loadViewData(currentUser);
    setActiveTab('dashboard');
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este reto? Los colaboradores inscritos ya no podrán ver su progreso en él.")) {
      return;
    }

    const res = await dbService.deleteChallenge(challengeId);
    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    showToastMessage("🗑️ ¡Reto eliminado con éxito de la plataforma!");
    loadViewData(currentUser);
  };

  const handleSaveChallengeDates = async (e) => {
    e.preventDefault();
    if (!editStartDate || !editEndDate) {
      showToastMessage("Por favor ingresa ambas fechas.", "error");
      return;
    }
    if (editEndDate < editStartDate) {
      showToastMessage("La fecha de finalización no puede ser anterior a la fecha de inicio.", "error");
      return;
    }

    setIsSavingDates(true);
    const res = await dbService.updateChallengeDates(adminSelectedChallenge.id, editStartDate, editEndDate);
    setIsSavingDates(false);

    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    showToastMessage("📅 Rango de vigencia actualizado correctamente.");
    
    // Update local state to reflect new dates
    const updated = { 
      ...adminSelectedChallenge, 
      start_date: editStartDate, 
      end_date: editEndDate 
    };
    setAdminSelectedChallenge(updated);
    
    // Also reload overall challenges list in parent state
    loadViewData(currentUser);
    setShowEditDatesModal(false);
  };

  const handleSaveParticipantProgress = async (e) => {
    e.preventDefault();
    if (editProgressValue === '' || isNaN(parseFloat(editProgressValue)) || parseFloat(editProgressValue) < 0) {
      showToastMessage("Por favor ingresa un número de progreso válido y mayor o igual a 0.", "error");
      return;
    }

    setIsSavingProgress(true);
    const res = await dbService.updateParticipantProgress(
      editingParticipant.user_id, 
      adminSelectedChallenge.id, 
      parseFloat(editProgressValue)
    );
    setIsSavingProgress(false);

    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    showToastMessage(`✏️ Progreso de ${editingParticipant.user_name} modificado con éxito.`);
    
    // Reload ranking/participants list
    setLoadingAdminRanking(true);
    try {
      const pList = await dbService.getChallengeRanking(adminSelectedChallenge.id);
      setAdminChallengeParticipants(pList);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingAdminRanking(false);
    }
    
    setShowEditProgressModal(false);
    setEditingParticipant(null);
  };

  const handleViewChallengeDetail = async (challenge) => {
    setAdminSelectedChallenge(challenge);
    setLoadingAdminRanking(true);
    setActiveTab('challenge_detail');
    try {
      const pList = await dbService.getChallengeRanking(challenge.id);
      setAdminChallengeParticipants(pList);
    } catch (e) {
      console.error("Error loading challenge participants:", e);
      showToastMessage("Error al cargar la lista de participantes.", "error");
    } finally {
      setLoadingAdminRanking(false);
    }
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!rTitle || !rDesc || !rPoints || !rStock) {
      showToastMessage("Por favor rellena todos los campos requeridos.", "error");
      return;
    }

    const newReward = await dbService.createReward(
      rTitle,
      rDesc,
      rPoints,
      rCategory,
      rIcon,
      rStock
    );

    showToastMessage(`🎁 ¡Premio "${newReward.title}" añadido con éxito a la tienda!`);
    
    setRTitle('');
    setRDesc('');
    setRPoints('');
    setRStock('10');
    
    loadViewData(currentUser);
    setActiveTab('dashboard');
  };

  const handleOpenEditReward = (reward) => {
    setEditingReward(reward);
    setEditRTitle(reward.title || '');
    setEditRDesc(reward.description || '');
    setEditRPoints(reward.points_cost || '');
    setEditRCategory(reward.category || 'Alimentación');
    setEditRIcon(reward.icon || '🥑');
    setEditRStock(reward.stock || '10');
    setShowEditRewardModal(true);
  };

  const handleUpdateReward = async (e) => {
    e.preventDefault();
    if (!editRTitle || !editRDesc || !editRPoints || !editRStock) {
      showToastMessage("Por favor rellena todos los campos requeridos.", "error");
      return;
    }

    setIsSavingReward(true);
    const res = await dbService.updateReward(
      editingReward.id,
      editRTitle,
      editRDesc,
      editRPoints,
      editRCategory,
      editRIcon,
      editRStock
    );
    setIsSavingReward(false);

    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    showToastMessage("🏆 Premio modificado con éxito en la tienda.");
    loadViewData(currentUser);
    setShowEditRewardModal(false);
    setEditingReward(null);
  };

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este premio de la tienda? Se quitará del catálogo disponible para los colaboradores.")) {
      return;
    }

    const res = await dbService.deleteReward(rewardId);
    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    showToastMessage("🗑️ ¡Premio eliminado de la tienda con éxito!");
    loadViewData(currentUser);
  };

  const handleViewUserDetail = async (user) => {
    setSelectedDetailUser(user);
    setLoadingUserDetail(true);
    setActiveTab('user_detail');
    try {
      const uChalls = await dbService.getUserChallenges(user.id);
      const challengesList = await dbService.getChallenges();
      
      const enriched = [];
      for (const uc of uChalls) {
        const challengeObj = challengesList.find(c => c.id === uc.challenge_id);
        if (challengeObj) {
          // Get rank in this challenge
          const ranking = await dbService.getChallengeRanking(uc.challenge_id);
          const rankIdx = ranking.findIndex(item => item.user_id === user.id);
          const rank = rankIdx !== -1 ? rankIdx + 1 : '-';
          
          enriched.push({
            ...uc,
            challenge_title: challengeObj.title,
            challenge_icon: challengeObj.image || '🏆',
            challenge_target: challengeObj.target,
            challenge_unit: challengeObj.unit,
            rank: rank
          });
        }
      }
      setUserDetailChallenges(enriched);
    } catch (e) {
      console.error("Error loading user challenges/ranking:", e);
      showToastMessage("Error al cargar la actividad del colaborador.", "error");
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm("¿Estás seguro de que deseas blanquear la contraseña de este colaborador? El colaborador deberá crear una nueva contraseña en su próximo inicio de sesión.")) {
      return;
    }
    
    setIsResettingPassword(true);
    const res = await dbService.resetUserPasswordDirectly(userId);
    setIsResettingPassword(false);
    
    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }
    
    showToastMessage("🔓 ¡Contraseña blanqueada con éxito! Se le solicitará una nueva clave al ingresar.");
    // Reload user data to make sure local state is updated
    const updatedUsers = await dbService.getPresetUsers();
    setActiveUsers(updatedUsers);
    
    // Update selectedDetailUser password_hash to null locally
    if (selectedDetailUser && selectedDetailUser.id === userId) {
      setSelectedDetailUser(prev => ({ ...prev, password_hash: null }));
    }
  };

  // --- RENDERS ---

  if (loadingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="spin-animation" size={42} style={{ color: 'var(--sky-accent)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontFamily: 'Outfit', fontWeight: 600 }}>Cargando portal de bienestar...</p>
        </div>
      </div>
    );
  }

  // A. PANTALLA DE AUTENTICACIÓN ACTUALIZADA CON CÓDIGO DE EMPRESA Y PRESETS CLICKEABLES
  if (!currentUser || landingView) {
    if (landingView) {
      // 1. PÁGINA DE INICIO / BIENVENIDA (LANDING PAGE CORPORATIVA DE BIENESTAR)
      return (
        <div 
          style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #F3F8F5 0%, #EBF3FA 100%)', 
            fontFamily: 'Inter, sans-serif',
            color: 'var(--text-main)',
            padding: '3rem 2rem'
          }}
        >
          {/* Header de la Landing */}
          <header 
            style={{ 
              maxWidth: '1100px', 
              margin: '0 auto 4rem', 
              display: 'flex', 
              justifyContent: 'between', 
              alignItems: 'center' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, var(--mint-accent), var(--sky-accent))', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 8px 16px rgba(28,188,140,0.15)'
                }}
              >
                <HeartHandshake size={22} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--mint-dark), var(--sky-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Reto Activo 2.0
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', alignItems: 'center' }}>
              {currentUser ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                    <img src={currentUser.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--mint-accent)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser.name} {currentUser.lastname || ''}</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                    onClick={() => setLandingView(false)}
                  >
                    Ir a mi Panel 🚀
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.88rem', borderRadius: '12px' }}
                  onClick={() => { setLandingView(false); setShowRegisterForm(false); }}
                >
                  Acceder a mi Portal 🔑
                </button>
              )}
            </div>
          </header>

          {/* Hero Section */}
          <section style={{ maxWidth: '900px', margin: '0 auto 5rem', textAlign: 'center' }}>
            <span 
              style={{ 
                backgroundColor: 'var(--mint-bg)', 
                color: 'var(--mint-dark)', 
                padding: '0.4rem 1rem', 
                borderRadius: '30px', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                display: 'inline-block',
                marginBottom: '1.5rem',
                border: '1px solid rgba(28,188,140,0.12)'
              }}
            >
              🌱 Bienestar Corporativo Activo
            </span>
            <h1 
              style={{ 
                fontFamily: 'Outfit', 
                fontSize: '3.6rem', 
                fontWeight: 800, 
                letterSpacing: '-1.5px', 
                lineHeight: 1.15,
                color: 'var(--text-main)',
                marginBottom: '1.5rem'
              }}
            >
              Tu empresa en movimiento, <br />
              <span style={{ background: 'linear-gradient(135deg, var(--mint-accent), var(--sky-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>saludable y feliz</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.5, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
              Desafía a tus equipos a adoptar hábitos saludables cotidianos. Fomenta la movilidad activa, registra tus pasos y recompensa el esfuerzo diario con increíbles premios.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {currentUser ? (
                <button 
                  className="btn btn-primary" 
                  style={{ width: 'auto', padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: '14px' }}
                  onClick={() => setLandingView(false)}
                >
                  Ir a mi Panel de Control 🚀
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: 'auto', padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: '14px' }}
                  onClick={() => { setLandingView(false); setShowRegisterForm(false); }}
                >
                  Comenzar mis Retos 🚀
                </button>
              )}
            </div>
          </section>

          {/* Características Clave con Hover Animado (landing-feature-card) */}
          <section style={{ maxWidth: '1100px', margin: '0 auto 6rem' }}>
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2rem' 
              }}
            >
              <div className="landing-feature-card" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🚴‍♂️</span>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Retos de Movilidad</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45 }}>
                  Campañas corporativas personalizables (km en bici, running o 10k pasos diarios) donde los empleados participan de forma divertida e interactiva.
                </p>
              </div>

              <div className="landing-feature-card" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🥑</span>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Premios Increíbles</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45 }}>
                  Canjea tus puntos acumulados por desayunos saludables en la oficina, kits deportivos premium o incluso tu merecida tarde libre del viernes.
                </p>
              </div>

              <div className="landing-feature-card" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📲</span>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Enlace de Salud Seguro</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45 }}>
                  Sincroniza tus pasos de forma automática con Apple Health o Google Fit con un solo clic. Genera evidencias seguras auditables por RRHH.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Reto Activo 2.0 - © 2026. Todos los derechos reservados. Diseñado para potenciar el bienestar y salud laboral de tus equipos.
          </footer>
        </div>
      );
    }

    // 2. FORMULARIOS DE AUTENTICACIÓN (LOGIN/REGISTRO) CON BOTÓN "VOLVER AL INICIO"
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #F0F7F4 0%, #E6EEF8 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Botón flotante para regresar al inicio */}
        <button 
          className="btn btn-secondary"
          onClick={() => setLandingView(true)}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            width: 'auto',
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          ← Volver al inicio
        </button>

        <div 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '28px', 
            boxShadow: '0 20px 50px rgba(28,41,33,0.08)', 
            border: '1px solid rgba(0,0,0,0.03)',
            padding: '3rem', 
            width: '100%', 
            maxWidth: '520px',
            textAlign: 'left'
          }}
        >
          {/* Formulario de Login o Registro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '14px', 
                  background: 'linear-gradient(135deg, var(--mint-accent), var(--sky-accent))', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <HeartHandshake size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Reto Activo 2.0
                </h1>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>BIENESTAR CORPORATIVO</span>
              </div>
            </div>

            {!showRegisterForm ? (
              // FORMULARIO DE ACCESO CON CÓDIGO
              <form onSubmit={handleLoginSubmit}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                  🔑 Acceso al Portal
                </h2>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} /> Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    placeholder="Ej: sofia.martinez@acme.com" 
                    className="form-input"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); if (loginError) setLoginError(null); }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <KeyRound size={14} /> Código de Empresa
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: ACME2026" 
                    className="form-input"
                    value={loginCompanyCode}
                    onChange={(e) => { setLoginCompanyCode(e.target.value); if (loginError) setLoginError(null); }}
                    style={{ textTransform: 'uppercase' }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Lock size={14} /> Contraseña
                  </label>
                  <div className="password-input-container">
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="Ingresa tu contraseña" 
                      className="form-input"
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); if (loginError) setLoginError(null); }}
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.3' }}>
                    💡 <em>Si usabas una cuenta anterior sin contraseña, escribe cualquier palabra o tu clave deseada aquí arriba para iniciar el asistente de creación de tu contraseña.</em>
                  </span>
                  
                  {loginError && (
                    <div 
                      className="animate-shake"
                      style={{ 
                        color: 'var(--coral-dark)', 
                        fontSize: '0.82rem', 
                        fontWeight: 600, 
                        marginTop: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        backgroundColor: 'rgba(252,139,114,0.05)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(252,139,114,0.15)'
                      }}
                    >
                      <AlertCircle size={14} /> {loginError}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoggingIn}
                  style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: isLoggingIn ? 0.7 : 1, cursor: isLoggingIn ? 'not-allowed' : 'pointer' }}
                >
                  <ShieldCheck size={18} /> {isLoggingIn ? "Iniciando Sesión..." : "Iniciar Sesión"}
                </button>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>¿No tienes una cuenta aún?</span>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: 'auto', display: 'inline-flex', marginLeft: '0.5rem' }}
                    onClick={() => setShowRegisterForm(true)}
                  >
                    Registrarme
                  </button>
                </div>

              </form>
            ) : (
              // FORMULARIO DE REGISTRO COMPLETO
              <form onSubmit={handleRegister}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                  📝 Registro de Empleado
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Mateo" 
                      className="form-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Rinaldi" 
                      className="form-input"
                      value={regLastname}
                      onChange={(e) => setRegLastname(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="Ej: mateo.rinaldi@empresa.com" 
                    className="form-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Código de Empresa</label>
                    <input 
                      type="text" 
                      placeholder="Ej: ACME2026" 
                      className="form-input"
                      value={regCompanyCode}
                      onChange={(e) => setRegCompanyCode(e.target.value)}
                      style={{ textTransform: 'uppercase' }}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departamento</label>
                    <select 
                      className="form-input" 
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                    >
                      <option value="Tecnología">Tecnología</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Diseño">Diseño</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <div className="password-input-container">
                      <input 
                        type={showRegPassword ? "text" : "password"} 
                        placeholder="Mínimo 6 caracteres" 
                        className="form-input"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        title={showRegPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar Contraseña</label>
                    <div className="password-input-container">
                      <input 
                        type={showRegPasswordConfirm ? "text" : "password"} 
                        placeholder="Repite la contraseña" 
                        className="form-input"
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
                        title={showRegPasswordConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showRegPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.5rem', 
                    marginTop: '1.25rem',
                    backgroundColor: 'rgba(28,188,140,0.04)',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(28,188,140,0.1)'
                  }}
                >
                  <input 
                    type="checkbox" 
                    id="terms-checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="terms-checkbox" style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.4, cursor: 'pointer' }}>
                    Acepto los <span 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                      style={{ color: 'var(--mint-accent)', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      Términos y Condiciones de Uso
                    </span> y la Política de Privacidad de Reto Activo 2.0.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterForm(false)}>
                    Atrás
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear Perfil
                  </button>
                </div>
              </form>
            )}
          </div>
          


          {/* MODAL: MIGRAR / CREAR CONTRASEÑA PARA CUENTAS ANTERIORES (P2) */}
          {showMigratePasswordModal && migrateUserRef && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🔐</span>
                  <h3 className="modal-title">Crea tu Contraseña</h3>
                  <p className="modal-subtitle">Hola <strong>{migrateUserRef.name}</strong>, para mayor seguridad ahora debes proteger tu cuenta con una contraseña.</p>
                </div>

                <form onSubmit={handleMigratePasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nueva Contraseña</label>
                    <div className="password-input-container">
                      <input 
                        type={showMigratePassword ? "text" : "password"} 
                        placeholder="Mínimo 6 caracteres" 
                        className="form-input"
                        value={migratePassword}
                        onChange={(e) => setMigratePassword(e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowMigratePassword(!showMigratePassword)}
                        title={showMigratePassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showMigratePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmar Contraseña</label>
                    <div className="password-input-container">
                      <input 
                        type={showMigratePasswordConfirm ? "text" : "password"} 
                        placeholder="Repite tu contraseña" 
                        className="form-input"
                        value={migratePasswordConfirm}
                        onChange={(e) => setMigratePasswordConfirm(e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowMigratePasswordConfirm(!showMigratePasswordConfirm)}
                        title={showMigratePasswordConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showMigratePasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowMigratePasswordModal(false);
                        setMigrateUserRef(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoggingIn}
                      style={{ opacity: isLoggingIn ? 0.7 : 1, cursor: isLoggingIn ? 'not-allowed' : 'pointer' }}
                    >
                      {isLoggingIn ? "Guardando..." : "Guardar y Acceder"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: TÉRMINOS Y CONDICIONES (P3) */}
          {showTermsModal && (
            <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <button className="modal-close" onClick={() => setShowTermsModal(false)}>
                  <X size={20} />
                </button>
                <div className="modal-header">
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📄</span>
                  <h3 className="modal-title">Términos y Condiciones de Uso</h3>
                  <p className="modal-subtitle">Reto Activo 2.0 - Plataforma de Bienestar Corporativo</p>
                </div>
                <div 
                  style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.5,
                    paddingRight: '0.5rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    textAlign: 'left'
                  }}
                >
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>1. Objeto y Alcance</h4>
                  <p style={{ margin: '0 0 1rem 0' }}>
                    Reto Activo 2.0 es una plataforma corporativa diseñada para promover hábitos saludables, la actividad física y el bienestar general entre los colaboradores. El uso de la plataforma está supeditado a las condiciones aquí indicadas.
                  </p>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>2. Integración y Privacidad de Datos</h4>
                  <p style={{ margin: '0 0 1rem 0' }}>
                    Al sincronizar sus aplicaciones de salud (como Google Fit o Apple Health), usted autoriza la lectura exclusiva de métricas de movilidad diaria (pasos, distancia). Estos datos serán procesados únicamente con fines internos de participación en los retos de la empresa. Bajo ninguna circunstancia se venderán o compartirán datos sensibles de salud con terceros.
                  </p>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>3. Veracidad de la Información</h4>
                  <p style={{ margin: '0 0 1rem 0' }}>
                    El usuario se compromete a no adulterar la carga de evidencias manuales ni simular fraudulentamente actividades físicas. El comportamiento deshonesto o la carga repetida de información duplicada podrá ser causal de suspensión de la cuenta.
                  </p>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>4. Cambios en las Condiciones</h4>
                  <p style={{ margin: '0' }}>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento para adaptarnos a nuevas exigencias legales o mejoras en el servicio de bienestar.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={() => setShowTermsModal(false)}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Interceptar si el usuario es empleado pero su cuenta está pendiente de aprobación (visto bueno)
  if (currentUser && currentUser.role === 'employee' && currentUser.status === 'pending') {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #F0F7F4 0%, #E6EEF8 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--text-main)',
          padding: '2rem'
        }}
      >
        <div 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '24px', 
            padding: '3rem 2.5rem', 
            maxWidth: '520px', 
            width: '100%', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)', 
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}
        >
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--sky-bg)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              color: 'var(--sky-accent)'
            }}
          >
            <Lock size={40} />
          </div>
          
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Cuenta en Espera de Visto Bueno
          </h2>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            ¡Hola, <strong style={{ color: 'var(--text-main)' }}>{currentUser.name}</strong>! Tu perfil de bienestar ha sido creado y guardado con éxito.
            <br /><br />
            Por seguridad, tu cuenta se encuentra en revisión. El **Administrador (RRHH)** debe otorgarte el visto bueno para que puedas acceder al portal, unirte a retos y sincronizar tus pasos de Google Fit.
          </p>

          <div style={{ backgroundColor: 'var(--sky-bg)', border: '1px solid rgba(66, 133, 244, 0.12)', borderRadius: '16px', padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
            <span style={{ fontSize: '1.3rem' }}>🌱</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--sky-dark)', fontWeight: 600, lineHeight: 1.4 }}>
              ¡Ya te acreditamos tus 100 puntos de bienvenida! Estarán disponibles apenas tu administrador apruebe tu acceso.
            </span>
          </div>

          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700 }}>
            Cerrar Sesión y Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Helpers for calculations
  const totalUserSteps = (currentUser?.role === 'employee' && currentUser?.daily_steps_history) 
    ? currentUser.daily_steps_history.reduce((a, b) => a + b, 0) 
    : 0;
  const activeChallengesCount = userChallenges.filter(uc => uc.status === 'active').length;
  const completedChallengesCount = userChallenges.filter(uc => uc.status === 'completed').length;
  
  // Weekly steps maximum for chart rendering
  const maxWeeklySteps = (currentUser?.role === 'employee' && currentUser?.daily_steps_history) 
    ? Math.max(...currentUser.daily_steps_history, 10000) 
    : 10000;
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/D';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'mobility':
        return { bg: 'var(--mint-bg)', text: 'var(--mint-dark)', accent: 'var(--mint-accent)' };
      case 'lavender':
        return { bg: 'var(--lavender-bg)', text: 'var(--lavender-dark)', accent: 'var(--lavender-accent)' };
      case 'coral':
        return { bg: 'var(--coral-bg)', text: 'var(--coral-dark)', accent: 'var(--coral-accent)' };
      default:
        return { bg: 'var(--sky-bg)', text: 'var(--sky-dark)', accent: 'var(--sky-accent)' };
    }
  };

  const varColorForDept = (dept) => {
    switch (dept) {
      case 'Tecnología':
        return 'var(--mint-dark)';
      case 'Ventas':
        return 'var(--sky-dark)';
      case 'Recursos Humanos':
        return 'var(--lavender-dark)';
      case 'Finanzas':
        return 'var(--coral-dark)';
      case 'Diseño':
        return 'var(--lavender-dark)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-brand" onClick={() => setLandingView(true)} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <HeartHandshake size={22} />
            </div>
            <span className="logo-text">Reto Activo 2.0</span>
          </div>

          {/* Perfil visible únicamente en móviles */}
          <div className="mobile-header-profile">
            <div className="mobile-profile-avatar-wrapper">
              <img src={currentUser.avatar} alt={currentUser.name} className="mobile-profile-avatar" />
              {currentUser.role === 'employee' && (
                <span className="mobile-profile-pts-badge">
                  {currentUser.points} pts
                </span>
              )}
            </div>
            <button 
              className="btn btn-secondary mobile-logout-btn" 
              onClick={handleLogout}
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {currentUser.role === 'employee' ? (
          <nav className="nav-menu">
            <div 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              <Activity />
              <span>Retos y Desafíos</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              <Gift />
              <span>Premios Wellness</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy />
              <span>Ranking</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User />
              <span>Mi Perfil</span>
            </div>

            <div 
              className="nav-item return-nav-item" 
              onClick={() => setLandingView(true)}
              style={{ 
                borderTop: '1px dashed var(--border-color)', 
                marginTop: '0.75rem', 
                paddingTop: '0.75rem',
                color: 'var(--mint-dark)'
              }}
            >
              <HeartHandshake size={20} />
              <span style={{ fontWeight: 600 }}>← Ir a Portada</span>
            </div>
          </nav>
        ) : (
          <nav className="nav-menu">
            <div 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Building size={20} />
              <span>Dashboard RRHH</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'evidence' ? 'active' : ''}`}
              onClick={() => setActiveTab('evidence')}
            >
              <ClipboardCheck size={20} />
              <span>Evidencias</span>
              {pendingEvidences.length > 0 && (
                <span 
                  style={{ 
                    marginLeft: 'auto', 
                    backgroundColor: 'var(--coral-accent)', 
                    color: 'white', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '0.15rem 0.45rem', 
                    borderRadius: '10px' 
                  }}
                >
                  {pendingEvidences.length}
                </span>
              )}
            </div>

            <div 
              className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <ShieldCheck size={20} />
              <span>Aprobaciones</span>
              {pendingUsers.length > 0 && (
                <span 
                  style={{ 
                    marginLeft: 'auto', 
                    backgroundColor: 'var(--sky-accent)', 
                    color: 'white', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '0.15rem 0.45rem', 
                    borderRadius: '10px' 
                  }}
                >
                  {pendingUsers.length}
                </span>
              )}
            </div>

            <div 
              className={`nav-item ${activeTab === 'manage_users' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage_users')}
            >
              <Users size={20} />
              <span>Colaboradores</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'create_challenge' ? 'active' : ''}`}
              onClick={() => setActiveTab('create_challenge')}
            >
              <PlusCircle size={20} />
              <span>Lanzar Reto</span>
            </div>

            <div 
              className={`nav-item ${activeTab === 'create_reward' ? 'active' : ''}`}
              onClick={() => setActiveTab('create_reward')}
            >
              <Gift size={20} />
              <span>Agregar Premio</span>
            </div>

            <div 
              className="nav-item return-nav-item" 
              onClick={() => setLandingView(true)}
              style={{ 
                borderTop: '1px dashed var(--border-color)', 
                marginTop: '0.75rem', 
                paddingTop: '0.75rem',
                color: 'var(--lavender-dark)'
              }}
            >
              <HeartHandshake size={20} />
              <span style={{ fontWeight: 600 }}>← Ir a Portada</span>
            </div>
          </nav>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-profile" style={{ marginBottom: '0.75rem' }}>
            <img src={currentUser.avatar} alt={currentUser.name} className="profile-avatar" />
            <div className="profile-info">
              <span className="profile-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
              <span className="profile-points">
                {currentUser.role === 'employee' ? (
                  <>
                    <Sparkles size={13} style={{ fill: 'var(--mint-accent)' }} /> 
                    {currentUser.points} pts
                  </>
                ) : (
                  <span>Administrador</span>
                )}
              </span>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem', fontSize: '0.82rem', display: 'flex', gap: '0.4rem', justifyContent: 'center' }}
            onClick={handleLogout}
          >
            <LogOut size={14} /> Salir del perfil
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content">
        
        {/* =============================================================== */}
        {/* SECCIÓN DEL EMPLEADO (VIEWS)                                    */}
        {/* =============================================================== */}
        {currentUser.role === 'employee' && (
          <>
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <h1>Hola, {currentUser.name} 👋</h1>
                    <p>¡Qué lindo día para moverse! Revisa tus estadísticas de bienestar hoy.</p>
                  </div>
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setActiveTab('challenges')}>
                    <Plus size={18} /> Explorar Retos
                  </button>
                </header>

                <section className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Pasos Semanales</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--sky-bg)', color: 'var(--sky-accent)' }}>
                        <Footprints size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{totalUserSteps.toLocaleString()}</div>
                    <div className="stat-footer">Meta semanal: <span>70k pasos</span></div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Puntos Wellness</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--mint-bg)', color: 'var(--mint-accent)' }}>
                        <Sparkles size={20} style={{ fill: 'var(--mint-accent)' }} />
                      </div>
                    </div>
                    <div className="stat-value">{currentUser.points}</div>
                    <div className="stat-footer">¡Canjeables por <span>premios</span>!</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Racha Activa</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--coral-bg)', color: 'var(--coral-accent)' }}>
                        <Flame size={20} style={{ fill: 'var(--coral-accent)' }} />
                      </div>
                    </div>
                    <div className="stat-value">{currentUser.streak} días</div>
                    <div className="stat-footer">¡Sigue así de constante!</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Retos Completados</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--lavender-bg)', color: 'var(--lavender-accent)' }}>
                        <Trophy size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{completedChallengesCount}</div>
                    <div className="stat-footer">¡Desafíos conquistados!</div>
                  </div>
                </section>

                <section className="activity-section">
                  <div className="activity-header">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Registro de Movilidad Semanal</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Tus pasos registrados día a día durante la última semana.</p>
                    </div>
                  </div>

                  <div className="activity-chart-container">
                    {(currentUser.daily_steps_history || [0, 0, 0, 0, 0, 0, 0]).map((steps, index) => {
                      const percent = Math.min((steps / maxWeeklySteps) * 100, 100);
                      const isToday = index === 6;
                      return (
                        <div className="chart-bar-container" key={index}>
                          <div className="chart-bar-bg">
                            <div 
                              className="chart-bar-fill" 
                              style={{ 
                                height: `${percent}%`, 
                                backgroundColor: isToday ? 'var(--mint-accent)' : 'var(--sky-accent)'
                              }}
                            />
                            <span className="chart-value-tooltip" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                              {steps.toLocaleString()}
                            </span>
                          </div>
                          <span className="chart-day-label" style={isToday ? { color: 'var(--mint-dark)', fontWeight: 800 } : {}}>
                            {weekDays[index]} {isToday && '(Hoy)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total de Pasos Semanal - Pie de Gráfica Estético */}
                  <div 
                    style={{ 
                      marginTop: '1.25rem', 
                      backgroundColor: 'var(--sky-bg)', 
                      border: '1px solid rgba(56,189,248,0.12)', 
                      borderRadius: '12px', 
                      padding: '0.85rem 1.25rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Footprints size={18} style={{ color: 'var(--sky-accent)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--sky-dark)' }}>
                        Total Acumulado Semanal:
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--sky-dark)' }}>
                        {totalUserSteps.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--sky-dark)', fontWeight: 600 }}> pasos</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 500 }}>
                        ({(totalUserSteps / 1312).toFixed(1)} km)
                      </span>
                    </div>
                  </div>

                  {/* Detalle Diario Colapsable (P10) */}
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <button 
                      type="button"
                      className="collapsible-breakdown-btn"
                      onClick={() => setShowFitBreakdown(!showFitBreakdown)}
                      title="Haz clic para ver el desglose por día"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} style={{ color: 'var(--mint-accent)' }} />
                        <span style={{ fontFamily: 'Outfit', fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Desglose Diario de Movilidad
                        </span>
                      </div>
                      {showFitBreakdown ? <ChevronUp size={18} className="chevron-rotate open" /> : <ChevronDown size={18} className="chevron-rotate" />}
                    </button>

                    <div className={`collapsible-content ${showFitBreakdown ? 'open' : ''}`}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.25rem 0.1rem' }}>
                        {(currentUser.daily_steps_history || [0, 0, 0, 0, 0, 0, 0]).map((steps, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - index));
                          const dateStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                          const isToday = index === 6;
                          const km = (steps / 1312).toFixed(1);
                          const goalMet = steps >= 10000;

                          return (
                            <div 
                              key={index}
                              className={`daily-breakdown-row ${isToday ? 'is-today' : ''}`}
                            >
                              <div className="row-left">
                                <span className="day-name">
                                  {weekDays[index]} {isToday && '(Hoy)'}
                                </span>
                                <span className="day-date">
                                  ({dateStr})
                                </span>
                              </div>
                              
                              <div className="row-right">
                                <div className="steps-metric">
                                  <span className="steps-count">{steps.toLocaleString()}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> pasos</span>
                                  <span className="steps-km">({km} km)</span>
                                </div>
                                
                                <span className={`status-badge ${goalMet ? 'met' : 'active'}`}>
                                  {goalMet ? '🎯 Cumplida' : '🚶 Activo'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ===== PANEL GOOGLE FIT ===== */}
                <section style={{ marginBottom: '2rem' }}>
                  <div style={{
                    background: gFitConnected
                      ? 'linear-gradient(135deg, #F0FBF6, #EAF5FF)'
                      : 'linear-gradient(135deg, #F8F9FF, #F0F7FF)',
                    border: gFitConnected
                      ? '1px solid rgba(28,188,140,0.2)'
                      : '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1.75rem 2rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {/* Decoración de fondo */}
                    <div style={{
                      position: 'absolute', right: '-20px', top: '-20px',
                      width: '160px', height: '160px',
                      borderRadius: '50%',
                      background: gFitConnected
                        ? 'radial-gradient(circle, rgba(28,188,140,0.07), transparent 70%)'
                        : 'radial-gradient(circle, rgba(82,130,255,0.06), transparent 70%)',
                      pointerEvents: 'none'
                    }} />

                    {/* Ícono principal */}
                    <div style={{
                      width: '54px', height: '54px', borderRadius: '16px', flexShrink: 0,
                      background: gFitConnected
                        ? 'linear-gradient(135deg, #34C97B, #1CBC8C)'
                        : 'linear-gradient(135deg, #4285F4, #34A853)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      boxShadow: gFitConnected
                        ? '0 8px 20px rgba(28,188,140,0.25)'
                        : '0 8px 20px rgba(66,133,244,0.25)',
                      fontSize: '1.5rem'
                    }}>
                      {gFitConnected ? <CheckCircle2 size={26} /> : <Activity size={26} />}
                    </div>

                    {/* Texto de estado */}
                    <div style={{ flexGrow: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700 }}>
                          Google Fit
                        </h3>
                        {gFitConnected && (
                          <span style={{
                            backgroundColor: 'var(--mint-bg)',
                            color: 'var(--mint-dark)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(28,188,140,0.15)'
                          }}>● CONECTADO</span>
                        )}
                      </div>

                      {gFitConnected ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {gFitLastSync
                            ? `Última sincronización: ${gFitLastSync.steps?.toLocaleString()} pasos · ${new Date(gFitLastSync.syncedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Cuenta conectada · Presiona "Sincronizar" para importar tus pasos de hoy.'}
                        </p>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Conecta tu cuenta de Google Fit para importar tus pasos automáticamente. Los datos se aprueban solos, ¡sin captura manual!
                        </p>
                      )}
                    </div>

                    {/* Selector de Rango de Días (P7) */}
                    {gFitConnected && (
                      <div style={{ minWidth: '220px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                          📅 Rango de Sincronización:
                        </label>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Hoy', value: 1 },
                            { label: '2d', value: 2 },
                            { label: '3d', value: 3 },
                            { label: '4d', value: 4 },
                            { label: '5d', value: 5 },
                            { label: 'Semana', value: 7 }
                          ].map(pill => (
                            <button
                              key={pill.value}
                              type="button"
                              onClick={() => setGFitSyncDays(pill.value)}
                              style={{
                                border: '1px solid ' + (gFitSyncDays === pill.value ? 'var(--mint-accent)' : 'var(--border-color)'),
                                backgroundColor: gFitSyncDays === pill.value ? 'var(--mint-bg)' : 'white',
                                color: gFitSyncDays === pill.value ? 'var(--mint-dark)' : 'var(--text-main)',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: gFitSyncDays === pill.value ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                              }}
                            >
                              {pill.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      {gFitConnected ? (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ width: 'auto', padding: '0.6rem 1.4rem', fontSize: '0.88rem' }}
                            onClick={handleGFitResync}
                            disabled={gFitSyncing}
                          >
                            {gFitSyncing ? (
                              <><span className="spin-animation" style={{ display: 'inline-block' }}>🔄</span> Sincronizando...</>
                            ) : (
                              <><RefreshCw size={15} /> Sincronizar Ahora</>
                            )}
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '0.6rem 1rem', fontSize: '0.82rem' }}
                            onClick={handleDisconnectGoogleFit}
                          >
                            Desconectar
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{
                            width: 'auto', padding: '0.7rem 1.5rem', fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #4285F4, #34A853)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                          }}
                          onClick={handleConnectGoogleFit}
                          disabled={gFitSyncing}
                        >
                          {gFitSyncing ? (
                            <><span className="spin-animation">🔄</span> Conectando...</>
                          ) : (
                            <>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              Conectar Google Fit
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Mis Retos en Progreso</h3>

                  {userChallenges.filter(uc => uc.status === 'active').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>No tienes retos activos en este momento. ¡Anotate a uno y empieza a sumar!</p>
                      <button className="btn btn-secondary" style={{ width: 'auto', margin: '0 auto' }} onClick={() => setActiveTab('challenges')}>
                        Ver Retos Disponibles
                      </button>
                    </div>
                  ) : (
                    <div className="challenges-grid">
                      {userChallenges
                        .filter(uc => uc.status === 'active')
                        .map(uc => {
                          const challenge = challenges.find(c => c.id === uc.challenge_id);
                          if (!challenge) return null;
                          const progressPercent = Math.min((uc.progress / challenge.target) * 100, 100);
                          const theme = getCategoryTheme(challenge.category);
                          
                          const rankings = challengeRankings[challenge.id] || [];
                          const myIndex = rankings.findIndex(r => r.user_id === currentUser.id);
                          const myRank = myIndex !== -1 ? myIndex + 1 : null;

                          const todayStr = new Date().toISOString().split('T')[0];
                          const isNotStarted = challenge.start_date && todayStr < challenge.start_date;
                          const isEnded = challenge.end_date && todayStr > challenge.end_date;
                          
                          return (
                            <div className="challenge-card" key={uc.challenge_id}>
                              <div className="challenge-image-container">
                                <span style={{ fontSize: '3rem' }}>{challenge.image}</span>
                                <div style={{ display: 'flex', gap: '0.35rem', position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 2 }}>
                                  <span className="challenge-badge" style={{ backgroundColor: theme.bg, color: theme.text }}>
                                    En Curso
                                  </span>
                                  {myRank && (
                                    <span className="challenge-badge" style={{ backgroundColor: '#FFF9E6', color: '#B38F00', border: '1px solid rgba(255,215,0,0.25)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                      🏆 #{myRank}
                                    </span>
                                  )}
                                </div>
                                <span className="challenge-points-badge">
                                  🪙 +{challenge.points} pts
                                </span>
                              </div>
                              
                              <div className="challenge-content">
                                <h4 className="challenge-title">{challenge.title}</h4>
                                <p className="challenge-desc" style={{ marginBottom: '0.5rem' }}>{challenge.description}</p>
                                
                                {challenge.start_date && (
                                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 500 }}>
                                    🗓️ Vigencia: <strong>{formatDate(challenge.start_date)} al {formatDate(challenge.end_date)}</strong>
                                  </span>
                                )}
                                
                                <div className="challenge-progress-bar">
                                  <div className="challenge-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: theme.accent }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Progreso actual:</span>
                                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>
                                    {uc.progress} / {challenge.target} {challenge.unit} ({Math.round(progressPercent)}%)
                                  </span>
                                </div>

                                {isNotStarted ? (
                                  <button className="btn btn-secondary" style={{ cursor: 'not-allowed', opacity: 0.6 }} disabled>
                                    ⏳ Inicia el {formatDate(challenge.start_date)}
                                  </button>
                                ) : isEnded ? (
                                  <button className="btn btn-disabled" disabled>
                                    🏁 Reto Finalizado el {formatDate(challenge.end_date)}
                                  </button>
                                ) : (
                                  <button className="btn btn-primary" onClick={() => openLogActivityModal(challenge)}>
                                    Registrar Actividad
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* VIEW: RETOS */}
            {activeTab === 'challenges' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Retos de Bienestar Corporativo</h1>
                    <p>Únete a las iniciativas activas de la empresa, acumula actividad y desbloquea recompensas saludables.</p>
                  </div>
                </header>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {['all', 'available', 'active', 'completed'].map(f => (
                    <button 
                      key={f}
                      className={`btn ${challengesFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
                      onClick={() => setChallengesFilter(f)}
                    >
                      {f === 'all' ? 'Todos los retos' : f === 'available' ? 'Disponibles' : f === 'active' ? 'Participando' : 'Completados'}
                    </button>
                  ))}
                </div>

                <div className="challenges-grid">
                  {challenges
                    .filter(c => {
                      const enrollment = userChallenges.find(uc => uc.challenge_id === c.id);
                      if (challengesFilter === 'available') return !enrollment;
                      if (challengesFilter === 'active') return enrollment && enrollment.status === 'active';
                      if (challengesFilter === 'completed') return enrollment && enrollment.status === 'completed';
                      return true;
                    })
                    .map(c => {
                      const enrollment = userChallenges.find(uc => uc.challenge_id === c.id);
                      const theme = getCategoryTheme(c.category);
                      const progressPercent = enrollment ? Math.min((enrollment.progress / c.target) * 100, 100) : 0;

                      const todayStr = new Date().toISOString().split('T')[0];
                      const isNotStarted = c.modality !== 'immediate' && c.start_date && todayStr < c.start_date;
                      const isEnded = c.end_date && todayStr > c.end_date;
                      const isEnrollmentClosed = c.modality === 'immediate'
                        ? (c.enrollment_deadline && todayStr > c.enrollment_deadline)
                        : (c.start_date && todayStr >= c.start_date);

                      return (
                        <div className="challenge-card" key={c.id}>
                          <div className="challenge-image-container">
                            <span style={{ fontSize: '3.2rem' }}>{c.image}</span>
                            {enrollment ? (
                              enrollment.status === 'completed' ? (
                                <span className="challenge-badge" style={{ backgroundColor: 'var(--mint-bg)', color: 'var(--mint-dark)' }}>
                                  ✓ Completado
                                </span>
                              ) : (
                                <span className="challenge-badge" style={{ backgroundColor: 'var(--sky-bg)', color: 'var(--sky-dark)' }}>
                                  Participando
                                </span>
                              )
                            ) : isEnrollmentClosed ? (
                              <span className="challenge-badge" style={{ backgroundColor: '#FDF1ED', color: 'var(--coral-dark)', border: '1px solid rgba(252,139,114,0.18)' }}>
                                Inscripción Cerrada
                              </span>
                            ) : (
                              <span className="challenge-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--text-main)' }}>
                                Disponible
                              </span>
                            )}

                            <span className="challenge-points-badge">
                              🪙 +{c.points} pts
                            </span>
                          </div>

                          <div className="challenge-content">
                            <h3 className="challenge-title">{c.title}</h3>
                            <p className="challenge-desc">{c.description}</p>

                            <div className="challenge-stats">
                              <div className="challenge-stat-item">
                                <span className="challenge-stat-label">Objetivo</span>
                                <span className="challenge-stat-value">{c.target} {c.unit}</span>
                              </div>
                              <div className="challenge-stat-item" style={{ minWidth: '120px' }}>
                                <span className="challenge-stat-label">Vigencia</span>
                                <span className="challenge-stat-value" style={{ fontSize: '0.78rem' }}>
                                  {c.modality === 'immediate' ? (
                                    <>⚡ Inicia hoy {c.enrollment_deadline && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Límite anotarse: {formatDate(c.enrollment_deadline)}</div>}</>
                                  ) : c.start_date ? (
                                    `${formatDate(c.start_date)} al ${formatDate(c.end_date)}`
                                  ) : (
                                    'Permanente'
                                  )}
                                </span>
                              </div>
                              <div className="challenge-stat-item">
                                <span className="challenge-stat-label">Participantes</span>
                                <span className="challenge-stat-value">{c.participantsCount} personas</span>
                              </div>
                            </div>

                            {enrollment && (
                              <div style={{ marginBottom: '1.25rem' }}>
                                <div className="challenge-progress-bar" style={{ marginBottom: '0.5rem' }}>
                                  <div className="challenge-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: theme.accent }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.8rem', fontWeight: 600 }}>
                                  <span>Progreso:</span>
                                  <span style={{ marginLeft: 'auto' }}>
                                    {enrollment.progress} / {c.target} {c.unit}
                                  </span>
                                </div>
                              </div>
                            )}

                            {!enrollment ? (
                              isEnrollmentClosed ? (
                                <button className="btn btn-disabled" style={{ cursor: 'not-allowed' }} disabled>
                                  Inscripción Cerrada (Pasó la fecha límite)
                                </button>
                              ) : (
                                <button className="btn btn-primary" onClick={() => handleEnroll(c.id)}>
                                  Anotarse al Reto
                                </button>
                              )
                            ) : enrollment.status === 'active' ? (
                              isNotStarted ? (
                                <button className="btn btn-secondary" style={{ cursor: 'not-allowed', opacity: 0.6 }} disabled>
                                  ⏳ Inicia el {formatDate(c.start_date)}
                                </button>
                              ) : isEnded ? (
                                <button className="btn btn-disabled" disabled>
                                  🏁 Reto Finalizado el {formatDate(c.end_date)}
                                </button>
                              ) : (
                                <button className="btn btn-lavender" onClick={() => openLogActivityModal(c)}>
                                  Registrar Actividad
                                </button>
                              )
                            ) : (
                              <button className="btn btn-disabled" disabled>
                                ¡Reto Completado! 🎉
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* VIEW: REWARDS */}
            {activeTab === 'rewards' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Tienda de Recompensas y Canjes</h1>
                    <p>Canjea tus puntos wellness acumulados por desayunos saludables, días libres y equipamiento deportivo.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: 'var(--mint-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(28,188,140,0.12)', fontSize: '1rem', fontWeight: 700, color: 'var(--mint-dark)' }}>
                    <Sparkles size={18} style={{ fill: 'var(--mint-accent)' }} /> Mi Saldo: {currentUser.points} pts
                  </div>
                </header>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                  {['Todos', 'Alimentación', 'Bienestar', 'Tiempo Libre'].map(cat => (
                    <button
                      className={`btn ${rewardsFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
                      onClick={() => setRewardsFilter(cat)}
                      key={cat}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="rewards-grid">
                  {rewards
                    .filter(r => rewardsFilter === 'Todos' || r.category === rewardsFilter)
                    .map(r => {
                      const canAfford = currentUser.points >= r.points_cost;
                      const isOutOfStock = r.stock <= 0;

                      return (
                        <div className="reward-card" key={r.id}>
                          <div className="reward-icon-container">
                            <span>{r.icon}</span>
                            <span className="reward-tag">{r.category}</span>
                            <span className="reward-price">🪙 {r.points_cost} pts</span>
                          </div>

                          <div className="reward-content">
                            <h3 className="reward-title">{r.title}</h3>
                            <p className="reward-desc">{r.description}</p>

                            <div className="reward-footer">
                              <span className="reward-stock">Disponibles: <span>{isOutOfStock ? 'Agotado' : `${r.stock} unidades`}</span></span>
                            </div>

                            {isOutOfStock ? (
                              <button className="btn btn-disabled" disabled>Agotado</button>
                            ) : canAfford ? (
                              <button className="btn btn-coral" onClick={() => handleRedeem(r.id)}>
                                Canjear Premio
                              </button>
                            ) : (
                              <button className="btn btn-disabled" disabled>
                                Faltan {r.points_cost - currentUser.points} puntos
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* VIEW: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Tabla de Posiciones Wellness</h1>
                    <p>Conoce a los colaboradores más activos del mes. ¡Suma puntos participando en retos para escalar puestos!</p>
                  </div>
                </header>

                <div className="podium-container">
                  {leaderboard[1] && (
                    <div className="podium-item podium-2nd">
                      <div className="podium-avatar-wrapper">
                        <img src={leaderboard[1].avatar} alt={leaderboard[1].name} className="podium-avatar" />
                        <span className="podium-badge">2</span>
                      </div>
                      <span className="podium-name">{leaderboard[1].name.split(' ')[0]}</span>
                      <span className="podium-pts">{leaderboard[1].points} pts</span>
                      <div className="podium-column"></div>
                    </div>
                  )}

                  {leaderboard[0] && (
                    <div className="podium-item podium-1st">
                      <div className="podium-avatar-wrapper">
                        <img src={leaderboard[0].avatar} alt={leaderboard[0].name} className="podium-avatar" />
                        <span className="podium-badge">1</span>
                      </div>
                      <span className="podium-name" style={{ fontSize: '1rem', fontWeight: 800 }}>{leaderboard[0].name.split(' ')[0]} 👑</span>
                      <span className="podium-pts" style={{ color: 'var(--coral-dark)', fontWeight: 700 }}>{leaderboard[0].points} pts</span>
                      <div className="podium-column"></div>
                    </div>
                  )}

                  {leaderboard[2] && (
                    <div className="podium-item podium-3rd">
                      <div className="podium-avatar-wrapper">
                        <img src={leaderboard[2].avatar} alt={leaderboard[2].name} className="podium-avatar" />
                        <span className="podium-badge">3</span>
                      </div>
                      <span className="podium-name">{leaderboard[2].name.split(' ')[0]}</span>
                      <span className="podium-pts">{leaderboard[2].points} pts</span>
                      <div className="podium-column"></div>
                    </div>
                  )}
                </div>

                <div className="leaderboard-table-container">
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white' }}>
                    <Search size={18} style={{ color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Buscar colaborador..." 
                      className="form-input" 
                      style={{ padding: '0.5rem 0.75rem', width: '320px', border: '1px solid var(--border-color)' }}
                      value={leaderboardSearch}
                      onChange={(e) => setLeaderboardSearch(e.target.value)}
                    />
                  </div>

                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th className="leaderboard-th">Posición</th>
                        <th className="leaderboard-th">Colaborador</th>
                        <th className="leaderboard-th">Departamento</th>
                        <th className="leaderboard-th">Puntos Acumulados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard
                        .filter(p => p.name.toLowerCase().includes(leaderboardSearch.toLowerCase()))
                        .map(p => {
                          const isCurrentUser = p.id === currentUser.id;
                          
                          return (
                            <tr className="leaderboard-tr" key={p.id} style={isCurrentUser ? { backgroundColor: 'var(--mint-bg)' } : {}}>
                              <td className="leaderboard-td leaderboard-td-rank">
                                {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                              </td>
                              <td className="leaderboard-td">
                                <div className="leaderboard-user-cell">
                                  <img src={p.avatar} alt={p.name} className="leaderboard-avatar" />
                                  <span style={isCurrentUser ? { fontWeight: 700, color: 'var(--mint-dark)' } : { fontWeight: 600 }}>
                                    {p.name} {isCurrentUser && '(Tú)'}
                                  </span>
                                </div>
                              </td>
                              <td className="leaderboard-td">
                                <span 
                                  className="leaderboard-dept"
                                  style={{
                                    backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'var(--bg-app)',
                                    color: varColorForDept(p.department)
                                  }}
                                >
                                  {p.department}
                                </span>
                              </td>
                              <td className="leaderboard-td" style={{ fontWeight: 700 }}>{p.points} pts</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW: PROFILE */}
            {activeTab === 'profile' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Mi Perfil de Bienestar</h1>
                    <p>Revisa tus estadísticas globales, logros desbloqueados y cupones de premios canjeados.</p>
                  </div>
                </header>

                <div className="profile-hero">
                  <img src={currentUser.avatar} alt={currentUser.name} className="profile-hero-avatar" />
                  <div className="profile-hero-details">
                    <h2>{currentUser.name} {currentUser.lastname || ''}</h2>
                    <p style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span>🏢 {currentUser.department}</span>
                      <span>•</span>
                      <span>🏆 {currentUser.level}</span>
                    </p>
                    <div className="badge-row">
                      <span className="badge-pill" style={{ backgroundColor: 'var(--mint-bg)', color: 'var(--mint-dark)' }}>
                        🔥 {currentUser.streak} días seguidos
                      </span>
                      <span className="badge-pill" style={{ backgroundColor: 'var(--sky-bg)', color: 'var(--sky-dark)' }}>
                        🪙 {currentUser.points} puntos totales
                      </span>
                    </div>
                  </div>
                </div>

                <section className="achievements-section">
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Mis Logros y Medallas</h3>
                  <div className="achievements-grid">
                    <div className="achievement-card">
                      <div className="achievement-icon">🌱</div>
                      <h4 className="achievement-title">Primer Paso</h4>
                      <p className="achievement-desc">Te anotaste a tu primer reto de bienestar corporativo.</p>
                    </div>

                    <div className="achievement-card">
                      <div className="achievement-icon">🚴‍♂️</div>
                      <h4 className="achievement-title">Eco-Movilidad</h4>
                      <p className="achievement-desc">Completaste un reto de la categoría movilidad activa.</p>
                    </div>

                    <div className="achievement-card">
                      <div className="achievement-icon">💧</div>
                      <h4 className="achievement-title">Súper Hidratado</h4>
                      <p className="achievement-desc">Registraste al menos 10 litros de agua acumulados.</p>
                    </div>

                    <div className={`achievement-card ${currentUser.points < 1000 ? 'achievement-locked' : ''}`}>
                      <div className="achievement-icon">
                        {currentUser.points < 1000 ? <Lock size={20} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} /> : '🌟'}
                      </div>
                      <h4 className="achievement-title">Líder Activo</h4>
                      <p className="achievement-desc">Alcanzaste un total de 1,000 puntos acumulados.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Mis Cupones y Premios Canjeados</h3>
                  {redeemedRewards.length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      Aún no has canjeado ningún premio. ¡Sigue moviéndote para ganar puntos!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {redeemedRewards.map(ticket => (
                        <div 
                          key={ticket.id} 
                          style={{ 
                            backgroundColor: 'white', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-xl)', 
                            padding: '1.25rem', 
                            boxShadow: 'var(--shadow-sm)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', backgroundColor: 'var(--bg-app)', borderRadius: '50%' }}></div>
                          <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', backgroundColor: 'var(--bg-app)', borderRadius: '50%' }}></div>
                          
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2.2rem' }}>{ticket.reward_icon}</span>
                            <div>
                              <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{ticket.reward_title}</h4>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Canjeado el {new Date(ticket.redeemed_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Código: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>{ticket.id.toUpperCase()}</span></span>
                            <span 
                              style={{ 
                                marginLeft: 'auto', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '10px', 
                                fontWeight: 700,
                                backgroundColor: 'var(--mint-bg)',
                                color: 'var(--mint-dark)'
                              }}
                            >
                              Listo para retirar
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}

        {/* =============================================================== */}
        {/* SECCIÓN DE LA EMPRESA / ADMINISTRACIÓN (VIEWS)                 */}
        {/* =============================================================== */}
        {currentUser.role === 'company' && companyStats && (
          <>
            {/* VIEW: DASHBOARD ADMINISTRATIVO RRHH */}
            {activeTab === 'dashboard' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <h1>Portal de Administración RRHH 🏢</h1>
                    <p>Monitorea la actividad global, impulsa la salud corporativa y gestiona las iniciativas de bienestar.</p>
                  </div>
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setActiveTab('create_challenge')}>
                    <Plus size={18} /> Proponer Nuevo Reto
                  </button>
                </header>

                <section className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Movilidad Total Acme</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--sky-bg)', color: 'var(--sky-accent)' }}>
                        <Footprints size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{companyStats.totalCompanySteps.toLocaleString()}</div>
                    <div className="stat-footer">Pasos acumulados por empleados</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Índice de Participación</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--mint-bg)', color: 'var(--mint-accent)' }}>
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{companyStats.participationPercentage}%</div>
                    <div className="stat-footer">Colaboradores con retos activos</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Puntos Otorgados</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--lavender-bg)', color: 'var(--lavender-accent)' }}>
                        <Sparkles size={20} style={{ fill: 'var(--lavender-accent)' }} />
                      </div>
                    </div>
                    <div className="stat-value">{companyStats.totalPointsAwarded} pts</div>
                    <div className="stat-footer">Premio al esfuerzo acumulado</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Plantilla Registrada</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--coral-bg)', color: 'var(--coral-accent)' }}>
                        <User size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{companyStats.totalEmployeesCount}</div>
                    <div className="stat-footer">Colaboradores activos</div>
                  </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2.5rem', alignItems: 'start' }}>
                  
                  {/* Left/Main Block: Retos y Iniciativas Creadas */}
                  <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                          🏆 Campañas y Retos de Bienestar
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                          Administra y monitorea las iniciativas vigentes para toda la plantilla.
                        </p>
                      </div>
                      <select 
                        className="form-input" 
                        style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 1rem', fontSize: '0.82rem', borderRadius: '20px', height: 'auto', margin: 0 }}
                        value={adminChallengesFilter}
                        onChange={(e) => setAdminChallengesFilter(e.target.value)}
                      >
                        <option value="all">Filtro: Todos los Retos</option>
                        <option value="active">🟢 En Curso / Activos</option>
                        <option value="scheduled">⏳ Programados</option>
                        <option value="ended">🏁 Finalizados</option>
                      </select>
                    </div>

                    {challenges.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🎯</span>
                        No hay retos publicados en este momento. ¡Crea uno nuevo usando el botón de arriba!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {challenges
                          .filter(c => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            const isNotStarted = c.modality !== 'immediate' && c.start_date && todayStr < c.start_date;
                            const isEnded = c.end_date && todayStr > c.end_date;
                            const isActive = !isNotStarted && !isEnded;
                            
                            if (adminChallengesFilter === 'active') return isActive;
                            if (adminChallengesFilter === 'scheduled') return isNotStarted;
                            if (adminChallengesFilter === 'ended') return isEnded;
                            return true;
                          })
                          .map(c => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            const isNotStarted = c.modality !== 'immediate' && c.start_date && todayStr < c.start_date;
                            const isEnded = c.end_date && todayStr > c.end_date;
                            
                            let statusLabel = "🟢 Activo";
                            let statusBg = "var(--mint-bg)";
                            let statusColor = "var(--mint-dark)";
                            
                            if (isNotStarted) {
                              statusLabel = "⏳ Programado";
                              statusBg = "#FFF9E6";
                              statusColor = "#B38F00";
                            } else if (isEnded) {
                              statusLabel = "🏁 Finalizado";
                              statusBg = "var(--sky-bg)";
                              statusColor = "var(--sky-accent)";
                            }

                            return (
                              <div 
                                key={c.id} 
                                onClick={() => handleViewChallengeDetail(c)}
                                style={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  backgroundColor: 'var(--bg-main)', 
                                  padding: '1rem 1.25rem', 
                                  borderRadius: 'var(--radius-lg)', 
                                  border: '1px solid var(--border-color)', 
                                  gap: '1rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                className="admin-challenge-item-hover"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span style={{ fontSize: '2rem' }}>{c.image || '🏆'}</span>
                                  <div>
                                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>{c.title}</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      <span>🎯 {c.target} {c.unit}</span>
                                      <span>🪙 +{c.points} pts</span>
                                      <span>👥 {c.participantsCount || 0} personas</span>
                                      {c.modality === 'immediate' ? (
                                        <span>⚡ Inicio Inmediato (Inscripción hasta {c.enrollment_deadline ? formatDate(c.enrollment_deadline) : 'Sin límite'})</span>
                                      ) : c.start_date && (
                                        <span>🗓️ {formatDate(c.start_date)} al {formatDate(c.end_date)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                                  <span style={{ backgroundColor: statusBg, color: statusColor, fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                    {statusLabel}
                                  </span>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '0.35rem 0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(252,139,114,0.3)', color: 'var(--coral-accent)' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChallenge(c.id);
                                    }}
                                  >
                                    <Trash2 size={14} /> Eliminar
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Right Block: Tareas Administrativas */}
                  <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      📋 Pendientes de Gestión
                    </h3>
                    
                    <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <ClipboardCheck size={18} style={{ color: 'var(--mint-accent)' }} /> Evidencias Pendientes
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                        Tienes <strong>{pendingEvidences.length}</strong> capturas de pantalla de colaboradores esperando revisión y aprobación de puntos.
                      </p>
                      <button className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }} onClick={() => setActiveTab('evidence')}>
                        Verificar Evidencias
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW: DETALLE DE PROGRESO DE RETO */}
            {activeTab === 'challenge_detail' && adminSelectedChallenge && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => { setActiveTab('dashboard'); setAdminSelectedChallenge(null); }}>
                      ← Volver al Dashboard
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                      <span style={{ fontSize: '3rem' }}>{adminSelectedChallenge.image || '🏆'}</span>
                      <div>
                        <h1>{adminSelectedChallenge.title}</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                          {adminSelectedChallenge.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Challenge Info and Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Objetivo del Reto</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--sky-bg)', color: 'var(--sky-accent)' }}>
                        <Trophy size={20} />
                      </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.8rem' }}>
                      {adminSelectedChallenge.target} {adminSelectedChallenge.unit}
                    </div>
                    <div className="stat-footer">
                      Recompensa: 🪙 +{adminSelectedChallenge.points} pts
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Participantes Inscritos</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--mint-bg)', color: 'var(--mint-accent)' }}>
                        <Users size={20} />
                      </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.8rem' }}>
                      {adminChallengeParticipants.length}
                    </div>
                    <div className="stat-footer">
                      {adminChallengeParticipants.filter(p => p.status === 'completed').length} han completado el reto
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-title">Periodo de Vigencia</span>
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--lavender-bg)', color: 'var(--lavender-accent)' }}>
                        <Activity size={20} />
                      </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.0rem', fontWeight: 700, padding: '0.5rem 0' }}>
                      {adminSelectedChallenge.modality === 'immediate' ? (
                        <>⚡ Inicio Inmediato {adminSelectedChallenge.enrollment_deadline && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Límite anotarse: {formatDate(adminSelectedChallenge.enrollment_deadline)}</div>}</>
                      ) : adminSelectedChallenge.start_date ? (
                        `${formatDate(adminSelectedChallenge.start_date)} al ${formatDate(adminSelectedChallenge.end_date)}`
                      ) : (
                        'Campaña Permanente'
                      )}
                    </div>
                    <div className="stat-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>Duración estimada: {adminSelectedChallenge.duration || 'N/A'}</span>
                      <button 
                        onClick={() => {
                          setEditStartDate(adminSelectedChallenge.start_date || '');
                          setEditEndDate(adminSelectedChallenge.end_date || '');
                          setShowEditDatesModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        title="Modificar fechas de vigencia"
                      >
                        <Edit2 size={12} /> Modificar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Participants Progress List */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👥 Progreso Detallado de Colaboradores
                  </h3>

                  {loadingAdminRanking ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <RefreshCw size={24} style={{ display: 'block', margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }} />
                      Cargando lista de participantes y progresos actualizados...
                    </div>
                  ) : adminChallengeParticipants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>👥</span>
                      Aún no hay colaboradores anotados en esta campaña.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Puesto</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Colaborador</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Área / Depto</th>
                            <th style={{ padding: '0.75rem 1rem', width: '35%' }}>Progreso</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminChallengeParticipants.map((p, idx) => {
                            const percent = Math.min((p.progress / adminSelectedChallenge.target) * 100, 100);
                            const isCompleted = p.status === 'completed' || percent >= 100;
                            
                            const todayStr = new Date().toISOString().split('T')[0];
                            const isNotStarted = adminSelectedChallenge.modality !== 'immediate' && adminSelectedChallenge.start_date && todayStr < adminSelectedChallenge.start_date;
                            const isEnded = adminSelectedChallenge.end_date && todayStr > adminSelectedChallenge.end_date;

                            let statusText = "🟢 En Curso";
                            let statusBg = "var(--sky-bg)";
                            let statusColor = "var(--sky-accent)";

                            if (isCompleted) {
                              statusText = "🏆 Completado";
                              statusBg = "var(--mint-bg)";
                              statusColor = "var(--mint-dark)";
                            } else if (isNotStarted) {
                              statusText = "⏳ No Iniciado";
                              statusBg = "#FFF9E6";
                              statusColor = "#B38F00";
                            } else if (isEnded) {
                              statusText = "🏁 Finalizado";
                              statusBg = "var(--bg-main)";
                              statusColor = "var(--text-muted)";
                            }

                            let rankBadge = `#${idx + 1}`;
                            if (idx === 0) rankBadge = '🥇 #1';
                            else if (idx === 1) rankBadge = '🥈 #2';
                            else if (idx === 2) rankBadge = '🥉 #3';

                            return (
                              <tr key={p.user_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }} className="table-row-hover">
                                <td style={{ padding: '1rem', fontWeight: 700, color: idx < 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                  {rankBadge}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                      {p.avatar ? (
                                        <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                      ) : (
                                        p.user_name.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    {p.user_name}
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                  {p.department || 'Sin área'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>{p.progress.toLocaleString()} / {adminSelectedChallenge.target.toLocaleString()} {adminSelectedChallenge.unit}</span>
                                        <button 
                                          onClick={() => {
                                            setEditingParticipant(p);
                                            setEditProgressValue(p.progress);
                                            setShowEditProgressModal(true);
                                          }}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-color)',
                                            cursor: 'pointer',
                                            padding: '0.1rem 0.25rem',
                                            borderRadius: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            transition: 'background-color 0.2s',
                                            fontSize: '0.72rem'
                                          }}
                                          title="Ajustar progreso"
                                        >
                                          <Edit2 size={11} />
                                        </button>
                                      </div>
                                      <span>{Math.round(percent)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: isCompleted ? 'var(--mint-accent)' : 'var(--sky-accent)', borderRadius: '10px' }} />
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                  <span style={{ 
                                    padding: '0.25rem 0.6rem', 
                                    borderRadius: '20px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700,
                                    backgroundColor: statusBg,
                                    color: statusColor
                                  }}>
                                    {statusText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: BANDEJA DE APROBACIÓN */}
            {activeTab === 'evidence' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Verificación y Aprobación de Evidencias</h1>
                    <p>Revisa y valida las capturas de pantalla de actividades que los empleados suben o sincronizan para desbloquear sus puntos.</p>
                  </div>
                </header>

                {pendingEvidences.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>¡Todo al día!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>No hay evidencias esperando validación en este momento.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {pendingEvidences.map(ev => (
                      <div 
                        key={ev.id}
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-xl)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '220px' }}>
                          <img src={ev.user_avatar} alt={ev.user_name} style={{ width: '46px', height: '46px', borderRadius: '50%' }} />
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{ev.user_name}</h4>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                              🏢 {ev.user_department}
                            </span>
                          </div>
                        </div>

                        <div style={{ flexGrow: 1, minWidth: '200px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                            Reto Corporativo
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            {ev.challenge_title}
                          </h4>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mint-dark)' }}>
                            Actividad declarada: {ev.amount} {ev.unit}
                          </span>
                        </div>

                        <div style={{ width: '120px' }}>
                          <div 
                            onClick={() => setPreviewEvidenceImage(ev.screenshot_preview)}
                            style={{ 
                              height: '70px', 
                              borderRadius: 'var(--radius-md)', 
                              border: '1px solid var(--border-color)', 
                              overflow: 'hidden', 
                              cursor: 'pointer',
                              position: 'relative',
                              backgroundColor: 'var(--bg-app)'
                            }}
                          >
                            <img src={ev.screenshot_preview} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.62rem', textAlign: 'center', padding: '2px 0' }}>
                              Ver Evidencia
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', width: '220px', marginLeft: 'auto' }}>
                          <button className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} onClick={() => handleApproveEvidence(ev.id)}>
                            Aprobar
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--coral-dark)' }} onClick={() => handleRejectEvidence(ev.id)}>
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: CREAR NUEVO RETO */}
            {activeTab === 'create_challenge' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Lanzar Nuevo Reto de Bienestar</h1>
                    <p>Propón una nueva campaña de hábitos saludables o movilidad para que los empleados se anoten desde su dashboard.</p>
                  </div>
                </header>

                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', maxWidth: '650px' }}>
                  <form onSubmit={handleCreateChallenge}>
                    <div className="form-group">
                      <label className="form-label">Título del Reto</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Desafío Bici-Oficina Primavera" 
                        className="form-input" 
                        value={cTitle}
                        onChange={(e) => setCTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Descripción / Instrucciones</label>
                      <textarea 
                        rows="3"
                        placeholder="Explica a los empleados en qué consiste el reto..." 
                        className="form-input"
                        value={cDesc}
                        onChange={(e) => setCDesc(e.target.value)}
                        style={{ resize: 'vertical' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Objetivo Numérico</label>
                        <input 
                          type="number" 
                          placeholder="Ej: 30" 
                          className="form-input" 
                          value={cTarget}
                          onChange={(e) => setCTarget(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Unidad de Medida</label>
                        <select 
                          className="form-input" 
                          value={cUnit}
                          onChange={(e) => setCUnit(e.target.value)}
                        >
                          <option value="km">Kilómetros (km)</option>
                          <option value="pasos">Pasos</option>
                          <option value="sesiones">Sesiones</option>
                          <option value="litros">Litros</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Puntos a Otorgar</label>
                        <input 
                          type="number" 
                          placeholder="Ej: 300" 
                          className="form-input" 
                          value={cPoints}
                          onChange={(e) => setCPoints(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Icono / Emoji</label>
                        <input 
                          type="text" 
                          placeholder="Ej: 🚴‍♀️" 
                          className="form-input" 
                          value={cIcon}
                          onChange={(e) => setCIcon(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>🎯 Modalidad de Programación</label>
                      <div style={{ display: 'flex', gap: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          <input 
                            type="radio" 
                            name="c_modality" 
                            value="scheduled" 
                            checked={cModality === 'scheduled'} 
                            onChange={() => setCModality('scheduled')}
                            style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                          />
                          Programado (Fechas pactadas)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          <input 
                            type="radio" 
                            name="c_modality" 
                            value="immediate" 
                            checked={cModality === 'immediate'} 
                            onChange={() => setCModality('immediate')}
                            style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                          />
                          Inicio Inmediato (Se activa hoy)
                        </label>
                      </div>
                    </div>

                    {cModality === 'scheduled' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">📅 Fecha de Inicio (Apertura)</label>
                          <input 
                            type="date" 
                            className="form-input" 
                            value={cStartDate}
                            onChange={(e) => setCStartDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">🏁 Fecha de Finalización</label>
                          <input 
                            type="date" 
                            className="form-input" 
                            value={cEndDate}
                            onChange={(e) => setCEndDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">⏳ Límite de Inscripción</label>
                          <input 
                            type="date" 
                            className="form-input" 
                            value={cEnrollmentDeadline}
                            onChange={(e) => setCEnrollmentDeadline(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">🏁 Fecha de Finalización (Opcional)</label>
                          <input 
                            type="date" 
                            className="form-input" 
                            value={cEndDate}
                            onChange={(e) => setCEndDate(e.target.value)}
                            placeholder="Ej: dd/mm/aaaa"
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Duración Estimada</label>
                      <input 
                        type="text" 
                        placeholder="Ej: 15 días" 
                        className="form-input" 
                        value={cDuration}
                        onChange={(e) => setCDuration(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                      Lanzar Reto a la Empresa
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* VIEW: AGREGAR PREMIO */}
            {activeTab === 'create_reward' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Agregar Nuevo Premio a la Tienda</h1>
                    <p>Incorpora más premios para incentivar la participación y motivar a tus empleados con cupones especiales.</p>
                  </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start', maxWidth: '1200px', width: '100%' }}>
                  {/* COLUMNA IZQUIERDA: FORMULARIO DE CREACIÓN */}
                  <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                      <span>✨</span> Crear Nuevo Premio
                    </h3>
                    <form onSubmit={handleCreateReward}>
                      <div className="form-group">
                        <label className="form-label">Nombre del Premio</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Kit de Snacks Saludables" 
                          className="form-input" 
                          value={rTitle}
                          onChange={(e) => setRTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Descripción del Premio</label>
                        <textarea 
                          rows="3"
                          placeholder="Describe el premio y cómo se retira..." 
                          className="form-input"
                          value={rDesc}
                          onChange={(e) => setRDesc(e.target.value)}
                          style={{ resize: 'vertical' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Costo en Puntos</label>
                          <input 
                            type="number" 
                            placeholder="Ej: 450" 
                            className="form-input" 
                            value={rPoints}
                            onChange={(e) => setRPoints(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Stock de Unidades</label>
                          <input 
                            type="number" 
                            placeholder="Ej: 5" 
                            className="form-input" 
                            value={rStock}
                            onChange={(e) => setRStock(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Categoría</label>
                          <select 
                            className="form-input" 
                            value={rCategory}
                            onChange={(e) => setRCategory(e.target.value)}
                          >
                            <option value="Alimentación">Alimentación</option>
                            <option value="Bienestar">Bienestar</option>
                            <option value="Tiempo Libre">Tiempo Libre</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Emoji / Icono</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 🥑" 
                            className="form-input" 
                            value={rIcon}
                            onChange={(e) => setRIcon(e.target.value)}
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                        Publicar Premio en la Tienda
                      </button>
                    </form>
                  </div>

                  {/* COLUMNA DERECHA: CATÁLOGO DE PREMIOS PUBLICADOS */}
                  <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                      <span>🏆</span> Premios Cargados
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {rewards.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>No hay premios cargados aún.</p>
                      ) : (
                        rewards.map(r => (
                          <div 
                            key={r.id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '1.25rem', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: 'var(--radius-lg)', 
                              backgroundColor: 'var(--bg-app)', 
                              gap: '1rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '2.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                {r.icon || '🎁'}
                              </span>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{r.title}</h4>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', fontWeight: 500 }}>
                                  <span style={{ color: 'var(--mint-dark)', backgroundColor: 'var(--mint-bg)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                                    ⚡ {r.points_cost} pts
                                  </span>
                                  <span style={{ color: 'var(--sky-dark)', backgroundColor: 'var(--sky-bg)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                                    📦 Stock: {r.stock}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleOpenEditReward(r)}
                                className="btn btn-secondary" 
                                style={{ padding: '0.5rem', minWidth: '38px', height: '38px', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer' }}
                                title="Editar Premio"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteReward(r.id)}
                                className="btn btn-danger" 
                                style={{ padding: '0.5rem', minWidth: '38px', height: '38px', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', backgroundColor: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5', cursor: 'pointer' }}
                                title="Eliminar Premio"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: APROBACIÓN DE COLABORADORES */}
            {activeTab === 'approvals' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Aprobación de Colaboradores</h1>
                    <p>Gestiona los accesos de tus amigos y colaboradores a Reto Activo 2.0. Otorga el visto bueno para habilitar sus cuentas.</p>
                  </div>
                </header>

                <div className="activity-section">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                    🛡️ Registros Pendientes de Visto Bueno ({pendingUsers.length})
                  </h3>

                  {pendingUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>¡Todo al día!</p>
                      <p style={{ fontSize: '0.88rem' }}>No hay solicitudes de registro pendientes de aprobación.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {pendingUsers.map(user => (
                        <div 
                          key={user.id} 
                          style={{ 
                            backgroundColor: 'var(--bg-app)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '16px', 
                            padding: '1.5rem', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '1rem',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--sky-accent)' }} />
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }} 
                            />
                            <div>
                              <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                                {user.name} {user.lastname || ''}
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--sky-dark)', fontWeight: 700 }}>
                                💼 {user.department || 'Sin Área'}
                              </span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span>Email:</span>
                              <strong style={{ color: 'var(--text-main)', wordBreak: 'break-all', marginLeft: '0.5rem' }}>{user.email}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Código:</span>
                              <strong style={{ color: 'var(--text-main)' }}>{user.company_code}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleApproveUser(user.id, `${user.name} ${user.lastname || ''}`)}
                              style={{ flexGrow: 1, padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            >
                              <Check size={14} /> Aprobar
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => handleRejectUser(user.id, `${user.name} ${user.lastname || ''}`)}
                              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', color: 'var(--coral-accent)', borderColor: 'rgba(252,139,114,0.3)' }}
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: GESTIÓN DE COLABORADORES ACTIVOS */}
            {activeTab === 'manage_users' && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('dashboard')}>
                      ← Volver al Dashboard
                    </button>
                    <h1>Gestión de Colaboradores</h1>
                    <p>Administra las cuentas de tus colaboradores activos. Modifica sus puntos acumulados, áreas de trabajo o dalos de baja si ya no forman parte de las campañas.</p>
                  </div>
                </header>

                <div className="activity-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                      👥 Colaboradores Activos ({activeUsers.length})
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', width: '320px', boxShadow: 'var(--shadow-sm)' }}>
                      <Search size={18} style={{ color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Buscar colaborador por nombre..." 
                        className="form-input" 
                        style={{ border: 'none', padding: 0, fontSize: '0.88rem', width: '100%', outline: 'none' }}
                        value={activeUsersSearch}
                        onChange={(e) => setActiveUsersSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {activeUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👥</span>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>No hay colaboradores activos</p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Ve a la sección de Aprobaciones para habilitar nuevos colaboradores.</p>
                    </div>
                  ) : activeUsers.filter(u => `${u.name} ${u.lastname || ''}`.toLowerCase().includes(activeUsersSearch.toLowerCase())).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      No se encontraron colaboradores que coincidan con la búsqueda.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {activeUsers
                        .filter(u => `${u.name} ${u.lastname || ''}`.toLowerCase().includes(activeUsersSearch.toLowerCase()))
                        .map(user => (
                          <div 
                            key={user.id} 
                            style={{ 
                              backgroundColor: 'white', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '16px', 
                              padding: '1.5rem', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '1rem',
                              boxShadow: 'var(--shadow-sm)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }} 
                              />
                              <div>
                                <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                                  {user.name} {user.lastname || ''}
                                </h4>
                                <span 
                                  className="leaderboard-dept"
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '8px',
                                    display: 'inline-block',
                                    marginTop: '0.2rem',
                                    backgroundColor: 'var(--bg-app)',
                                    color: varColorForDept(user.department)
                                  }}
                                >
                                  {user.department || 'Sin Área'}
                                </span>
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '0.75rem 0', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Email:</span>
                                <strong style={{ color: 'var(--text-main)', wordBreak: 'break-all' }}>{user.email}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Saldo Puntos:</span>
                                <strong style={{ color: 'var(--mint-dark)' }}>🪙 {user.points || 0} pts</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Racha:</span>
                                <strong style={{ color: 'var(--coral-dark)' }}>🔥 {user.streak || 0} días</strong>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%', marginTop: 'auto' }}>
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleViewUserDetail(user)}
                                style={{ gridColumn: 'span 2', padding: '0.55rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer' }}
                              >
                                🔍 Ver Ficha Completa
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => handleEditUser(user)}
                                style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Editar Datos
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => handleDeleteUser(user.id, `${user.name} ${user.lastname || ''}`)}
                                style={{ padding: '0.45rem 0.5rem', fontSize: '0.78rem', color: 'var(--coral-accent)', borderColor: 'rgba(252,139,114,0.3)', cursor: 'pointer' }}
                              >
                                Dar de Baja
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: FICHA DETALLADA DEL COLABORADOR */}
            {activeTab === 'user_detail' && selectedDetailUser && (
              <div className="view-container">
                <header className="view-header">
                  <div className="view-title-group">
                    <button className="btn btn-secondary view-back-btn" onClick={() => setActiveTab('manage_users')} style={{ cursor: 'pointer' }}>
                      ← Volver a Colaboradores
                    </button>
                    <h1>Ficha del Colaborador</h1>
                    <p>Monitorea y administra la actividad física, racha, sincronizaciones de salud y el desempeño en retos en tiempo real para <strong>{selectedDetailUser.name} {selectedDetailUser.lastname || ''}</strong>.</p>
                  </div>
                </header>

                {loadingUserDetail ? (
                  <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                    <RefreshCw className="spin-animation" size={36} style={{ color: 'var(--mint-accent)' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando actividad y rankings del colaborador...</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'start', maxWidth: '1200px', width: '100%' }}>
                    
                    {/* COLUMNA IZQUIERDA: PERFIL Y ACCIONES */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Card Perfil Principal */}
                      <div style={{ backgroundColor: 'white', padding: '2.5rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem', borderRadius: '50%', border: '4px solid white', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                          <img 
                            src={selectedDetailUser.avatar || 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120'} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                          {selectedDetailUser.name} {selectedDetailUser.lastname || ''}
                        </h2>
                        
                        <span 
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            display: 'inline-block',
                            backgroundColor: 'var(--bg-app)',
                            color: varColorForDept(selectedDetailUser.department),
                            marginBottom: '1rem'
                          }}
                        >
                          {selectedDetailUser.department || 'Sin Área'}
                        </span>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0', fontWeight: 500 }}>
                          🏆 Nivel: <strong style={{ color: 'var(--mint-dark)' }}>{selectedDetailUser.level || 'Wellness Principiante 🌱'}</strong>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0', marginBottom: '1.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Saldo Acumulado</span>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--mint-dark)' }}>🪙 {selectedDetailUser.points || 0} pts</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Racha de Bienestar</span>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--coral-dark)' }}>🔥 {selectedDetailUser.streak || 0} días</strong>
                          </div>
                        </div>

                        {/* Datos de contacto y registro */}
                        <div style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Correo Electrónico:</span>
                            <strong style={{ color: 'var(--text-main)', wordBreak: 'break-all' }}>{selectedDetailUser.email}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Código de Empresa:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{selectedDetailUser.company_code}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Estado de Cuenta:</span>
                            <strong style={{ color: selectedDetailUser.status === 'approved' ? 'var(--mint-accent)' : 'orange' }}>
                              {selectedDetailUser.status === 'approved' ? '🟢 Activa' : '⏳ Pendiente'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Card de Gestión y Blanqueo */}
                      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>⚙️</span> Acciones Administrativas
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                          Si el colaborador olvidó sus credenciales de acceso, puedes blanquear su contraseña. Esto removerá su clave actual y se le obligará a definir una contraseña nueva la próxima vez que intente iniciar sesión.
                        </p>

                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleResetPassword(selectedDetailUser.id)}
                          disabled={isResettingPassword}
                          style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', backgroundColor: '#F0F9FF', color: 'var(--sky-dark)', border: '1px solid rgba(91,166,224,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                        >
                          🔓 {isResettingPassword ? 'Blanqueando...' : 'Blanquear Contraseña'}
                        </button>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: ACTIVIDAD FÍSICA Y RETOS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Historial de Actividad Semanal */}
                      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🚶‍♂️</span> Historial de Pasos (Últimos 7 días)
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, backgroundColor: 'var(--bg-app)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                            Sincronización Fit
                          </span>
                        </div>

                        {/* Indicador de Última Sincronización */}
                        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Última sincronización en la nube:</span>
                          <strong style={{ color: 'var(--text-main)' }}>
                            {selectedDetailUser.last_sync 
                              ? new Date(selectedDetailUser.last_sync).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) 
                              : 'Sin registros de sincronización de salud'
                            }
                          </strong>
                        </div>

                        {/* Gráfico Estilo Barras de Pasos */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', padding: '1rem 0.5rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', gap: '0.75rem' }}>
                          {(selectedDetailUser.daily_steps_history || [0, 0, 0, 0, 0, 0, 0]).map((steps, idx) => {
                            const maxSteps = Math.max(...(selectedDetailUser.daily_steps_history || [10000]), 10000);
                            const heightPct = Math.min((steps / maxSteps) * 100, 100);
                            
                            // Get calendar days labels
                            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - idx));
                            const label = dayNames[d.getDay()];

                            return (
                              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                  {steps > 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
                                </div>
                                <div 
                                  style={{ 
                                    width: '100%', 
                                    backgroundColor: steps >= 10000 ? 'var(--mint-accent)' : 'var(--sky-accent)', 
                                    height: `${heightPct}%`, 
                                    borderRadius: '4px 4px 0 0', 
                                    minHeight: '4px',
                                    transition: 'var(--transition-smooth)',
                                    opacity: 0.85
                                  }}
                                  title={`${steps} pasos`}
                                />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
                                  {label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Retos y Rankings */}
                      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🏆</span> Campañas y Puestos en el Ranking
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {userDetailChallenges.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>El colaborador no está inscrito en ningún reto activo en este momento.</p>
                          ) : (
                            userDetailChallenges.map(uc => {
                              const pct = Math.min((uc.progress / (uc.challenge_target || 1)) * 100, 100);
                              
                              // Stylized ranking badge
                              let rankBadge = '';
                              let rankColor = 'var(--text-muted)';
                              let rankBg = 'var(--bg-app)';
                              
                              if (uc.rank === 1) {
                                rankBadge = '🥇 1º Puesto';
                                rankColor = '#B27A00';
                                rankBg = '#FFFBEB';
                              } else if (uc.rank === 2) {
                                rankBadge = '🥈 2º Puesto';
                                rankColor = '#4B5563';
                                rankBg = '#F3F4F6';
                              } else if (uc.rank === 3) {
                                rankBadge = '🥉 3º Puesto';
                                rankColor = '#9A3412';
                                rankBg = '#FFF7ED';
                              } else if (uc.rank !== '-') {
                                rankBadge = `🏅 ${uc.rank}º Puesto`;
                                rankColor = 'var(--sky-dark)';
                                rankBg = 'var(--sky-bg)';
                              } else {
                                rankBadge = 'Sin Ranking';
                              }

                              return (
                                <div 
                                  key={uc.challenge_id} 
                                  style={{ 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: 'var(--radius-lg)', 
                                    padding: '1.25rem', 
                                    backgroundColor: 'var(--bg-app)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ fontSize: '1.75rem' }}>{uc.challenge_icon}</span>
                                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{uc.challenge_title}</h4>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '10px', color: rankColor, backgroundColor: rankBg }}>
                                      {rankBadge}
                                    </span>
                                  </div>

                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 500 }}>
                                      <span>Progreso: <strong>{uc.progress} / {uc.challenge_target} {uc.challenge_unit}</strong></span>
                                      <span>{Math.round(pct)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                      <div 
                                        style={{ 
                                          width: `${pct}%`, 
                                          height: '100%', 
                                          backgroundColor: uc.status === 'completed' ? 'var(--mint-accent)' : 'var(--sky-accent)', 
                                          borderRadius: '4px',
                                          transition: 'var(--transition-smooth)'
                                        }} 
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* =============================================================== */}
      {/* MODALES Y TOAST                                                 */}
      {/* =============================================================== */}

      {/* MODAL: EDITAR COLABORADOR ACTIVO (ADMIN) */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setEditingUser(null)}>
              <X size={20} />
            </button>
            
            <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
              <img 
                src={editingUser.avatar} 
                alt={editingUser.name} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: 'var(--shadow-md)', margin: '0 auto 0.75rem' }} 
              />
              <h3 className="modal-title">Editar Colaborador</h3>
              <p className="modal-subtitle">Personalizando datos de: <strong>{editingUser.name} {editingUser.lastname || ''}</strong></p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Saldo de Puntos Wellness</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ej: 500" 
                  value={editPoints} 
                  onChange={(e) => setEditPoints(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  El valor actual es: <strong>{editingUser.points || 0} pts</strong>.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Departamento / Área de Trabajo</label>
                <select 
                  className="form-input" 
                  value={editDept} 
                  onChange={(e) => setEditDept(e.target.value)}
                  required
                >
                  <option value="Ventas">Ventas</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Administración">Administración</option>
                  <option value="Diseño">Diseño</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveUserChanges}
                  style={{ flexGrow: 1 }}
                >
                  Guardar Cambios
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setEditingUser(null)}
                  style={{ flexGrow: 1 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR PROGRESO CON INTEGRACIÓN DE APP DE SALUD */}
      {showLogModal && selectedChallenge && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowLogModal(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header">
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>{selectedChallenge.image}</span>
              <h3 className="modal-title">Registrar Actividad</h3>
              <p className="modal-subtitle">Reto: <strong>{selectedChallenge.title}</strong></p>
            </div>

            <form onSubmit={handleSubmitProgress}>
              <div className="form-group">
                <label className="form-label">Cantidad a Registrar ({selectedChallenge.unit})</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder={`Ej: ${selectedChallenge.target / 10}`} 
                  className="form-input"
                  required
                  value={logAmount}
                  onChange={(e) => setLogAmount(e.target.value)}
                />
              </div>

              {/* Uploader / Visualizador de Evidencia */}
              <div className="form-group">
                <label className="form-label">Evidencia de Actividad (Captura de pantalla)</label>
                
                {!screenshotPreview ? (
                  <div 
                    className="file-upload-zone" 
                    onClick={() => document.getElementById('evidence-file-input')?.click()}
                    style={{ position: 'relative', padding: '1.5rem 1rem' }}
                  >
                    <input 
                      id="evidence-file-input"
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setScreenshot(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setScreenshotPreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--mint-accent)' }} />
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Selecciona o toma una foto desde tu celular
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Formatos: PNG, JPG (Se abrirá tu fototeca o cámara)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div className="file-preview" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <img 
                        src={screenshotPreview} 
                        alt="Preview Evidence" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: screenshotPreview.startsWith('data:image/svg+xml') ? 'contain' : 'cover',
                          maxHeight: '140px'
                        }} 
                      />
                    </div>
                    {/* Visual badge of synchronization type */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '0.5rem', 
                        left: '0.5rem', 
                        backgroundColor: !screenshot ? 'var(--sky-accent)' : 'var(--mint-accent)', 
                        color: 'white', 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {!screenshot ? (
                        <>
                          <Check size={10} /> Evidencia de Salud Certificada
                        </>
                      ) : (
                        <>
                          <Check size={10} /> Evidencia Manual Subida
                        </>
                      )}
                    </div>
                    <button 
                      type="button" 
                      style={{ 
                        position: 'absolute', 
                        top: '0.5rem', 
                        right: '0.5rem', 
                        backgroundColor: 'rgba(0,0,0,0.6)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        zIndex: 3
                      }}
                      onClick={() => { setScreenshot(null); setScreenshotPreview(''); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Actividad para Aprobación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR FECHAS DE VIGENCIA DE RETO */}
      {showEditDatesModal && adminSelectedChallenge && (
        <div className="modal-overlay" onClick={() => setShowEditDatesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>📅 Editar Rango de Vigencia</h3>
              <button className="close-btn" onClick={() => setShowEditDatesModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveChallengeDates} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Ajusta la vigencia del reto <strong>"{adminSelectedChallenge.title}"</strong>. Los colaboradores solo pueden participar e inscribirse dentro de este rango temporal.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Fecha de Inicio</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={editStartDate} 
                    onChange={(e) => setEditStartDate(e.target.value)} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Fecha de Finalización</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={editEndDate} 
                    onChange={(e) => setEditEndDate(e.target.value)} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditDatesModal(false)} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingDates} style={{ flex: 1 }}>
                  {isSavingDates ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTAR PROGRESO DE COLABORADOR */}
      {showEditProgressModal && editingParticipant && adminSelectedChallenge && (
        <div className="modal-overlay" onClick={() => { setShowEditProgressModal(false); setEditingParticipant(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
            <div className="modal-header">
              <h3>✏️ Ajustar Progreso de Colaborador</h3>
              <button className="close-btn" onClick={() => { setShowEditProgressModal(false); setEditingParticipant(null); }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveParticipantProgress} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {editingParticipant.avatar ? (
                    <img src={editingParticipant.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    editingParticipant.user_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{editingParticipant.user_name}</h4>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Reto: {adminSelectedChallenge.title}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Progreso Actual Registrado
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={editProgressValue} 
                    onChange={(e) => setEditProgressValue(e.target.value)} 
                    required 
                    min="0"
                    step="any"
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    / {adminSelectedChallenge.target} {adminSelectedChallenge.unit}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ingresa el valor total acumulado para este participante. Si supera la meta ({adminSelectedChallenge.target} {adminSelectedChallenge.unit}), el reto se marcará automáticamente como completado.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditProgressModal(false); setEditingParticipant(null); }} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingProgress} style={{ flex: 1 }}>
                  {isSavingProgress ? 'Guardando...' : 'Actualizar Progreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DETALLES DE PREMIO */}
      {showEditRewardModal && editingReward && (
        <div className="modal-overlay" onClick={() => { setShowEditRewardModal(false); setEditingReward(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', width: '90%' }}>
            <div className="modal-header">
              <h3>✏️ Editar Premio Publicado</h3>
              <button className="close-btn" onClick={() => { setShowEditRewardModal(false); setEditingReward(null); }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateReward} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Nombre del Premio</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editRTitle} 
                  onChange={(e) => setEditRTitle(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Descripción del Premio</label>
                <textarea 
                  rows="3"
                  className="form-input"
                  value={editRDesc}
                  onChange={(e) => setEditRDesc(e.target.value)}
                  style={{ resize: 'vertical', width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Costo en Puntos</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editRPoints} 
                    onChange={(e) => setEditRPoints(e.target.value)} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Stock de Unidades</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editRStock} 
                    onChange={(e) => setEditRStock(e.target.value)} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Categoría</label>
                  <select 
                    className="form-input" 
                    value={editRCategory}
                    onChange={(e) => setEditRCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Alimentación">Alimentación</option>
                    <option value="Bienestar">Bienestar</option>
                    <option value="Tiempo Libre">Tiempo Libre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Emoji / Icono</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editRIcon} 
                    onChange={(e) => setEditRIcon(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditRewardModal(false); setEditingReward(null); }} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingReward} style={{ flex: 1 }}>
                  {isSavingReward ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW */}
      {previewEvidenceImage && (
        <div className="modal-overlay" onClick={() => setPreviewEvidenceImage(null)}>
          <div 
            style={{ 
              position: 'relative', 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: 'var(--radius-xl)', 
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '90%',
              maxHeight: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
              onClick={() => setPreviewEvidenceImage(null)}
            >
              <X size={16} />
            </button>
            <img 
              src={previewEvidenceImage} 
              alt="Evidencia Full Preview" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 'var(--radius-md)', display: 'block', objectFit: 'contain' }} 
            />
          </div>
        </div>
      )}





      {/* TOAST */}
      {toast && (
        <div className="alert-popup">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: toast.type === 'success' ? '#1CBC8C' : '#FC8B72', color: 'white' }}>
            {toast.type === 'success' ? <Check size={14} /> : <X size={14} />}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* Botón flotante para regresar a la portada principal */}
      {currentUser && !landingView && (
        <button
          onClick={() => setLandingView(true)}
          className="floating-back-button"
          title="Volver a la Portada principal"
        >
          <span className="arrow">←</span> Volver a Portada
        </button>
      )}

    </div>
  );
}

// Helpers for color styles
function varColorForDept(dept) {
  switch (dept) {
    case 'Tecnología': return 'var(--sky-dark)';
    case 'Ventas': return 'var(--coral-dark)';
    case 'Recursos Humanos': return 'var(--lavender-dark)';
    case 'Finanzas': return 'var(--mint-dark)';
    default: return 'var(--text-muted)';
  }
}

export default App;
