import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mock.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)

// =============================================
// PWA Service Worker Registration
// The VitePWA plugin generates the SW automatically.
// Here we handle the "update available" lifecycle.
// =============================================
if ('serviceWorker' in navigator) {
  // vite-plugin-pwa injects the virtual module; in production the SW is at /sw.js
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      // Called when a new SW version is waiting to activate
      onNeedRefresh() {
        // Show a non-intrusive toast so the user can update at their convenience
        const toast = document.createElement('div');
        toast.id = 'pwa-update-toast';
        toast.innerHTML = `
          <div style="
            position:fixed; bottom:1rem; left:50%; transform:translateX(-50%);
            z-index:99999; background:linear-gradient(135deg,#1a1a2e,#0F2027);
            color:white; padding:0.9rem 1.25rem; border-radius:14px;
            display:flex; align-items:center; gap:0.75rem;
            box-shadow:0 12px 40px rgba(0,0,0,0.4);
            font-family:'Inter',sans-serif; font-size:0.85rem; max-width:360px;
            width:calc(100% - 2rem);
          ">
            <span style="font-size:1.2rem">🔄</span>
            <span style="flex:1">Nueva versión disponible</span>
            <button onclick="window.location.reload()" style="
              background:#1CBC8C; color:white; border:none; border-radius:8px;
              padding:0.4rem 0.8rem; font-weight:700; cursor:pointer; font-size:0.8rem;
              font-family:'Outfit',sans-serif;
            ">Actualizar</button>
            <button onclick="document.getElementById('pwa-update-toast').remove()" style="
              background:rgba(255,255,255,0.1); color:white; border:none;
              border-radius:8px; padding:0.4rem 0.6rem; cursor:pointer;
            ">✕</button>
          </div>`;
        document.body.appendChild(toast);
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline');
      },
    });
  }).catch(() => {
    // Not in a PWA context (dev mode) — silently ignore
  });
}
