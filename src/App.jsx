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
  Smartphone,
  RefreshCw,
  Mail,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { dbService } from './services/db';
import './App.css';

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [landingView, setLandingView] = useState(() => {
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

  // Navigation
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return (hash && hash !== 'landing') ? hash : 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'landing') {
        setLandingView(true);
      } else {
        setLandingView(false);
        if (hash !== activeTab) {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

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
  
  // Forms - Employee Log
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [logAmount, setLogAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  
  // Health App Sync Simulation State
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0); // 0 -> 1 -> 2 -> 3 (completed)

  // Forms - Admin Create Challenge
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPoints, setCPoints] = useState('');
  const [cCategory, setCCategory] = useState('mobility');
  const [cTarget, setCTarget] = useState('');
  const [cUnit, setCUnit] = useState('km');
  const [cDuration, setCDuration] = useState('7 días');
  const [cIcon, setCIcon] = useState('🚴‍♀️');

  // Forms - Admin Create Reward
  const [rTitle, setRTitle] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rPoints, setRPoints] = useState('');
  const [rCategory, setRCategory] = useState('Alimentación');
  const [rIcon, setRIcon] = useState('🥑');
  const [rStock, setRStock] = useState('10');

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
  const [gFitSelectedChallenge, setGFitSelectedChallenge] = useState(null);

  const loadViewData = async (userSession) => {
    if (!userSession) return;
    
    try {
      if (userSession.role === 'company') {
        const pending = await dbService.getPendingEvidences();
        const pendingUsrs = await dbService.getPendingUsers();
        const stats = await dbService.getCompanyStats();
        setPendingEvidences(pending);
        setPendingUsers(pendingUsrs);
        setCompanyStats(stats);
        
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
    if (!loginEmail.trim() || !loginCompanyCode.trim()) {
      showToastMessage("Por favor completa el email y el código de empresa.", "error");
      return;
    }

    const loggedUser = await dbService.loginWithCompanyCode(loginEmail, loginCompanyCode);
    if (loggedUser) {
      setCurrentUser(loggedUser);
      setLandingView(false);
      setActiveTab('dashboard');
      showToastMessage(`¡Acceso correcto! Bienvenido, ${loggedUser.name} ${loggedUser.lastname || ''} 🌟`);
      loadViewData(loggedUser);
      setLoginEmail('');
      setLoginCompanyCode('');
    } else {
      showToastMessage("Credenciales incorrectas. Verifica tu email y el código de empresa.", "error");
    }
  };



  const autoFillAdmin = () => {
    setLoginEmail('admin@acme.com');
    setLoginCompanyCode('ACME2026');
    showToastMessage(`Credenciales de administrador cargadas. ¡Presiona "Iniciar Sesión"!`);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regLastname.trim() || !regEmail.trim() || !regCompanyCode.trim()) {
      showToastMessage("Por favor rellena todos los campos requeridos.", "error");
      return;
    }

    const registered = await dbService.registerUser(
      regName,
      regLastname,
      regEmail,
      regCompanyCode,
      regDept
    );

    setCurrentUser(registered);
    setLandingView(false);
    setActiveTab('dashboard');
    setShowRegisterForm(false);
    
    // Clear registration inputs
    setRegName('');
    setRegLastname('');
    setRegEmail('');
    setRegCompanyCode('');
    
    showToastMessage("🎉 ¡Perfil de bienestar creado con éxito! Te regalamos 100 puntos de bienvenida.");
    loadViewData(registered);
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
      if (showLogModal) {
        setIsSyncingHealth(true);
        setSyncProgress(1);
      } else {
        setGFitSyncing(true);
      }
      try {
        const token = tokenResponse.access_token;
        const fitData = await dbService.fetchWeeklyStepsFromGoogleFit(token);
        dbService.saveGoogleFitToken(token, 3600);
        setGFitConnected(true);

        if (showLogModal) {
          setSyncProgress(2);
          setTimeout(() => {
            setIsSyncingHealth(false);
            let amountToLog = fitData.totalSteps;
            if (selectedChallenge.unit === 'km') {
              amountToLog = parseFloat((fitData.totalSteps / 1312).toFixed(2));
            }
            setLogAmount(amountToLog.toString());
            setScreenshot(null);
            setScreenshotPreview('https://images.unsplash.com/photo-1510017808632-95f08e030633?auto=format&fit=crop&q=80&w=300');
            showToastMessage(`📲 ¡Sincronizado! Se han importado ${amountToLog.toLocaleString()} ${selectedChallenge.unit} reales desde Google Fit.`);
          }, 800);
        } else {
          await performGFitSync(currentUser, fitData);
        }
      } catch(err) {
        console.error("Error connecting Google Fit:", err);
        showToastMessage('⚠️ No se pudieron leer los pasos de Google Fit.', 'error');
      } finally {
        setGFitSyncing(false);
        setIsSyncingHealth(false);
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
    const challengeId = gFitSelectedChallenge || null;
    const result = await dbService.syncGoogleFitSteps(user.id, challengeId, fitData);
    const totalSteps = fitData.totalSteps || 0;
    dbService.saveLastSync(user.id, totalSteps);

    const syncInfo = { steps: totalSteps, syncedAt: new Date().toISOString() };
    setGFitLastSync(syncInfo);
    setGFitSyncing(false);

    // Refrescar datos de la vista
    await loadViewData(user);

    const kmText = result.kmEquivalent ? ` (≈ ${result.kmEquivalent} km)` : '';
    if (result.completed) {
      showToastMessage(`🏆 ¡Sincronizado y reto completado! +${result.pointsAwarded} puntos ganados desde Google Fit.`);
    } else {
      showToastMessage(`🌱 ¡Sincronizado! ${totalSteps.toLocaleString()} pasos${kmText} importados desde Google Fit.`);
    }
  };

  // --- ACTIONS: EMPLEADO (HEALTH APP INTEGRATION) ---

  // Sincronización oficial con Google Fit desde el modal
  const handleCallHealthApp = async () => {
    if (selectedChallenge.unit === 'pasos' || selectedChallenge.unit === 'km') {
      if (gFitConnected) {
        // Sincronizar usando el token real guardado
        const token = dbService.getGoogleFitToken();
        if (!token) {
          setGFitConnected(false);
          showToastMessage('La sesión de Google Fit expiró. Vuelve a conectar.', 'error');
          return;
        }
        setIsSyncingHealth(true);
        setSyncProgress(0);
        try {
          setSyncProgress(1);
          const fitData = await dbService.fetchWeeklyStepsFromGoogleFit(token);
          setSyncProgress(2);
          setTimeout(() => {
            setIsSyncingHealth(false);
            let amountToLog = fitData.totalSteps;
            if (selectedChallenge.unit === 'km') {
              amountToLog = parseFloat((fitData.totalSteps / 1312).toFixed(2));
            }
            setLogAmount(amountToLog.toString());
            setScreenshot(null);
            setScreenshotPreview('https://images.unsplash.com/photo-1510017808632-95f08e030633?auto=format&fit=crop&q=80&w=300');
            showToastMessage(`📲 ¡Sincronizado! Se han importado ${amountToLog.toLocaleString()} ${selectedChallenge.unit} reales desde tu Google Fit.`);
          }, 800);
        } catch(err) {
          console.error(err);
          showToastMessage('⚠️ No se pudieron leer los pasos de Google Fit.', 'error');
          setIsSyncingHealth(false);
        }
      } else {
        // Si no está conectado, disparar la conexión oficial
        handleConnectGoogleFit();
      }
    } else {
      // Para retos que no son de movilidad (ej: alimentación), mantener simulación básica como alternativa
      setIsSyncingHealth(true);
      setSyncProgress(0);
      const stepsInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 2) {
            clearInterval(stepsInterval);
            setTimeout(() => {
              setIsSyncingHealth(false);
              const generatedAmount = 1;
              const mockUrl = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300';
              setLogAmount(generatedAmount.toString());
              setScreenshot(null);
              setScreenshotPreview(mockUrl);
              showToastMessage(`📲 ¡Sincronizado! Se han importado ${generatedAmount} ${selectedChallenge.unit} de Apple Health.`);
            }, 800);
            return 3;
          }
          return prev + 1;
        });
      }, 1200);
    }
  };

  const handleEnroll = async (challengeId) => {
    const updated = await dbService.enrollInChallenge(currentUser.id, challengeId);
    setUserChallenges(updated);
    
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
    setIsSyncingHealth(false);
    setSyncProgress(0);
    setShowLogModal(true);
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!logAmount || isNaN(logAmount) || parseFloat(logAmount) <= 0) {
      showToastMessage("Por favor ingresa una cantidad válida de actividad.", "error");
      return;
    }

    const res = await dbService.logChallengeProgress(
      currentUser.id,
      selectedChallenge.id,
      parseFloat(logAmount),
      screenshot,
      screenshotPreview
    );

    if (res.error) {
      showToastMessage(res.error, "error");
      return;
    }

    setShowLogModal(false);
    await loadViewData(currentUser);

    if (res.pendingApproval) {
      showToastMessage(res.message, "success");
    } else if (res.completed) {
      showToastMessage(`🎉 ¡Felicidades! Has completado el reto y ganado +${res.pointsAwarded} puntos.`);
    } else {
      showToastMessage(`💪 Progreso registrado correctamente para el reto.`);
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

    const newChallenge = await dbService.createChallenge(
      cTitle,
      cDesc,
      cPoints,
      cCategory,
      cTarget,
      cUnit,
      cDuration,
      cIcon
    );

    showToastMessage(`🚀 ¡Reto "${newChallenge.title}" publicado con éxito! Ya se encuentra en la biblioteca.`);
    
    setCTitle('');
    setCDesc('');
    setCPoints('');
    setCTarget('');
    
    loadViewData(currentUser);
    setActiveTab('dashboard');
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
                <>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
                    onClick={() => { setLandingView(false); setShowRegisterForm(false); }}
                  >
                    Acceso Empleados
                  </button>
                  <button 
                    className="btn btn-lavender" 
                    style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
                    onClick={() => { setLandingView(false); autoFillAdmin(); }}
                  >
                    Portal Empresa
                  </button>
                </>
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
                  style={{ width: 'auto', padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: '14px' }}
                  onClick={() => { setLandingView(false); setShowRegisterForm(false); }}
                >
                  Comenzar mis Retos 🚀
                </button>
              )}
              <a 
                href="#accesos"
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: '14px', textDecoration: 'none' }}
              >
                Ver Portales de Acceso
              </a>
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

          {/* Seccion de accesos dividida */}
          <section id="accesos" style={{ maxWidth: '1000px', margin: '0 auto', borderTop: '1px solid var(--border-color)', paddingTop: '5rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', textAlign: 'center', marginBottom: '3rem' }}>
              🔑 Acceso a los Portales
            </h2>

            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '2.5rem' 
              }}
            >
              {/* Acceso Empleados */}
              <div 
                style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '24px', 
                  padding: '2.5rem', 
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>🚶‍♂️</span>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem' }}>Portal del Colaborador</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mint-dark)', fontWeight: 700 }}>EMPLEADOS</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45, flexGrow: 1 }}>
                  Anotate a retos corporativos activos, sincroniza tus pasos diarios de forma automática, sube capturas de evidencias y canjea tus puntos acumulados por increíbles premios.
                </p>
                
                {currentUser && currentUser.role === 'employee' ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setLandingView(false)}
                  >
                    Ir a mi Panel de Retos 🚀
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setLandingView(false); setShowRegisterForm(false); }}
                    disabled={currentUser && currentUser.role !== 'employee'}
                  >
                    Ingresar a mis Retos
                  </button>
                )}
              </div>

              {/* Acceso Empresas */}
              <div 
                style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '24px', 
                  padding: '2.5rem', 
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2.2rem' }}>🏢</span>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem' }}>Portal de la Empresa</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--lavender-dark)', fontWeight: 700 }}>ADMINISTRACIÓN RRHH</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45, flexGrow: 1 }}>
                  Lanza retos y campañas activas corporativas en tiempo real, gestiona el stock de la tienda, audita y aprueba las evidencias cargadas y analiza las métricas de bienestar generales.
                </p>
                
                {currentUser && currentUser.role === 'company' ? (
                  <button 
                    className="btn btn-lavender" 
                    onClick={() => setLandingView(false)}
                  >
                    Ir a mi Panel de RRHH 🚀
                  </button>
                ) : (
                  <button 
                    className="btn btn-lavender" 
                    onClick={() => { setLandingView(false); autoFillAdmin(); }}
                    disabled={currentUser && currentUser.role !== 'company'}
                  >
                    Ingresar al Panel Corporativo
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ marginTop: '6rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
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
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                    onChange={(e) => setLoginCompanyCode(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <ShieldCheck size={18} /> Iniciar Sesión
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
                    <div className="stat-footer"><span>{activeChallengesCount} activos</span> actualmente</div>
                  </div>
                </section>

                <section className="activity-section">
                  <div className="activity-header">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Registro de Movilidad Semanal</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Tus pasos registrados día a día durante la última semana.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sky-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Total: {totalUserSteps.toLocaleString()} pasos
                      </span>
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

                    {/* Selector de reto (cuando está conectado) */}
                    {gFitConnected && (
                      <div style={{ minWidth: '200px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                          Aplicar pasos a reto:
                        </label>
                        <select
                          value={gFitSelectedChallenge || ''}
                          onChange={e => setGFitSelectedChallenge(e.target.value || null)}
                          style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.85rem',
                            backgroundColor: 'white',
                            color: 'var(--text-main)',
                            width: '100%',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Solo actualizar pasos del día</option>
                          {userChallenges.filter(uc => uc.status === 'active').map(uc => {
                            const ch = challenges.find(c => c.id === uc.challenge_id);
                            return ch ? (
                              <option key={uc.challenge_id} value={uc.challenge_id}>
                                {ch.image} {ch.title}
                              </option>
                            ) : null;
                          })}
                        </select>
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
                          
                          return (
                            <div className="challenge-card" key={uc.challenge_id}>
                              <div className="challenge-image-container">
                                <span style={{ fontSize: '3rem' }}>{challenge.image}</span>
                                <span className="challenge-badge" style={{ backgroundColor: theme.bg, color: theme.text }}>
                                  En Curso
                                </span>
                                <span className="challenge-points-badge">
                                  🪙 +{challenge.points} pts
                                </span>
                              </div>
                              
                              <div className="challenge-content">
                                <h4 className="challenge-title">{challenge.title}</h4>
                                <p className="challenge-desc">{challenge.description}</p>
                                
                                <div className="challenge-progress-bar">
                                  <div className="challenge-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: theme.accent }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Progreso actual:</span>
                                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>
                                    {uc.progress} / {challenge.target} {challenge.unit} ({Math.round(progressPercent)}%)
                                  </span>
                                </div>

                                <button className="btn btn-primary" onClick={() => openLogActivityModal(challenge)}>
                                  Registrar Actividad
                                </button>
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
                              <div className="challenge-stat-item">
                                <span className="challenge-stat-label">Duración</span>
                                <span className="challenge-stat-value">{c.duration}</span>
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
                              <button className="btn btn-primary" onClick={() => handleEnroll(c.id)}>
                                Anotarse al Reto
                              </button>
                            ) : enrollment.status === 'active' ? (
                              <button className="btn btn-lavender" onClick={() => openLogActivityModal(c)}>
                                Registrar Actividad
                              </button>
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

                <section className="activity-section" style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>📊 Rendimiento Medio por Departamento</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {companyStats.deptChartData.map((dept, idx) => {
                      const maxStepsVal = Math.max(...companyStats.deptChartData.map(d=>d.avgSteps), 1000);
                      const barPercent = Math.min((dept.avgSteps / maxStepsVal) * 100, 100);
                      const colors = [
                        { from: '#4285F4', to: '#1CBC8C' },
                        { from: '#FC8B72', to: '#F7C59F' },
                        { from: '#9B8EFF', to: '#C3B9FF' },
                        { from: '#1CBC8C', to: '#70D9BF' },
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={idx} className="dept-bar-row">
                          <span style={{ width: '160px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', flexShrink: 0 }}>
                            {dept.name}
                          </span>
                          <div className="dept-bar-track">
                            <div 
                              className="dept-bar-fill"
                              style={{ 
                                width: `${barPercent}%`,
                                background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                              }}
                            />
                            <span className="dept-bar-label">
                              {dept.avgSteps.toLocaleString()} pasos prom.
                            </span>
                          </div>
                          <span className="dept-bar-pts">
                            🪙 {dept.points} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                  <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ClipboardCheck size={20} style={{ color: 'var(--mint-accent)' }} /> Evidencias Pendientes
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                      Tienes {pendingEvidences.length} capturas de pantalla de empleados esperando aprobación.
                    </p>
                    <button className="btn btn-secondary" onClick={() => setActiveTab('evidence')}>
                      Ir a Verificar Evidencias
                    </button>
                  </div>

                  <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={20} style={{ color: 'var(--coral-accent)' }} /> Estadísticas Generales
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                      El departamento de **{companyStats.deptChartData.sort((a,b)=>b.avgSteps - a.avgSteps)[0]?.name || 'Tecnología'}** lidera la tabla de movilidad corporativa.
                    </p>
                    <button className="btn btn-secondary" onClick={() => setActiveTab('create_challenge')}>
                      Lanzar Nueva Campaña
                    </button>
                  </div>
                </section>
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
                        <label className="form-label">Categoría / Temática</label>
                        <select 
                          className="form-input" 
                          value={cCategory}
                          onChange={(e) => setCCategory(e.target.value)}
                        >
                          <option value="mobility">Movilidad / Deporte (Verde Menta)</option>
                          <option value="sky">Pasos / Hidratación (Celeste)</option>
                          <option value="lavender">Pausas / Meditación (Violeta)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', maxWidth: '650px' }}>
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

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                      Publicar Premio en la Tienda
                    </button>
                  </form>
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
          </>
        )}

      </main>

      {/* =============================================================== */}
      {/* MODALES Y TOAST                                                 */}
      {/* =============================================================== */}

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

            {/* INTEGRACIÓN CON APLICACIONES DE SALUD */}
            <div 
              style={{ 
                backgroundColor: 'var(--sky-bg)', 
                border: '1px solid rgba(91,166,224,0.15)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-lg)', 
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}
            >
              <Smartphone size={28} style={{ color: 'var(--sky-accent)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--sky-dark)', marginBottom: '0.25rem' }}>
                🔗 Sincronización Automática con Salud
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.35 }}>
                Conéctate directamente con tu app de salud (Apple Health, Google Fit o Strava) para extraer tu actividad hoy y generar tu evidencia certificada.
              </p>
              
              {!isSyncingHealth ? (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ 
                    backgroundColor: 'white', 
                    color: 'var(--sky-dark)', 
                    width: 'auto', 
                    margin: '0 auto', 
                    fontSize: '0.85rem',
                    border: '1px solid rgba(91,166,224,0.2)' 
                  }}
                  onClick={handleCallHealthApp}
                >
                  <RefreshCw size={14} /> Sincronizar App de Salud
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={18} className="spin-animation" style={{ color: 'var(--sky-accent)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sky-dark)' }}>
                    {syncProgress === 0 && "Iniciando enlace con Apple Health/Google Fit..."}
                    {syncProgress === 1 && "Extrayendo métricas de actividad..."}
                    {syncProgress === 2 && "Generando previsualización de evidencia..."}
                  </span>
                </div>
              )}
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
                <label className="form-label">Evidencia de Actividad (Captura de pantalla o Enlace de Salud)</label>
                
                {!screenshotPreview ? (
                  <label className="file-upload-zone">
                    <input 
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
                    <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--mint-accent)' }} />
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Selecciona o arrastra una imagen manual</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Formatos: PNG, JPG</span>
                  </label>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div className="file-preview" style={{ height: '140px' }}>
                      <img src={screenshotPreview} alt="Preview Evidence" />
                    </div>
                    {/* Visual badge of synchronization */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '0.5rem', 
                        left: '0.5rem', 
                        backgroundColor: 'var(--mint-accent)', 
                        color: 'white', 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Check size={10} /> Evidencia de Salud Importada
                    </div>
                    <button 
                      type="button" 
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer' }}
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
                <button type="submit" className="btn btn-primary">
                  Enviar Actividad para Aprobación
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
