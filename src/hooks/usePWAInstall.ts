import { useState, useEffect } from 'react';

// Extend Window interface for PWA install prompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if PWA is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as Navigator & { standalone?: boolean })?.standalone;
      
      setIsInstalled(isStandalone || (isIOS && Boolean(isInStandaloneMode)));
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('✅ PWA Install Event ricevuto!', e);
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      console.log('✅ PWA installata!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    checkIfInstalled();

    // Debug: forza unregister del service worker per test
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          console.log('🔧 Service Workers:', registrations.length > 0 ? '✅ Attivo' : '❌ Nessuno');
          // Forza refresh del service worker
          registrations.forEach(registration => {
            registration.update();
          });
        });
    }

    // Debug: verifica manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('📄 Manifest:', manifestLink ? '✅ Trovato' : '❌ Mancante');

    // Debug: verifica HTTPS
    console.log('🔐 HTTPS:', window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? '✅ OK' : '❌ Richiesto');

    // Debug avanzato: controlla il manifest
    fetch('/manifest.json')
      .then(res => res.json())
      .then(manifest => {
        console.log('📋 Manifest caricato:', manifest);
        console.log('📋 Icons:', manifest.icons?.length || 0, 'icone trovate');
        
        // Verifica icone
        if (manifest.icons) {
          manifest.icons.forEach((icon: { src: string; sizes: string }) => {
            fetch(icon.src)
              .then(res => {
                console.log(`  🖼️ ${icon.src} (${icon.sizes}):`, res.ok ? '✅ OK' : '❌ Non trovata');
              })
              .catch(() => console.log(`  🖼️ ${icon.src}: ❌ Errore`));
          });
        }
      })
      .catch(err => console.log('📋 Manifest error:', err));

    // Verifica se il browser supporta getInstalledRelatedApps
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as Navigator & { getInstalledRelatedApps: () => Promise<unknown[]> })
        .getInstalledRelatedApps()
        .then((apps: unknown[]) => {
          console.log('📱 App correlate installate:', apps.length > 0 ? apps : 'Nessuna');
        });
    }

    // Timeout per debug - se dopo 3 secondi non c'è ancora il prompt
    const debugTimeout = setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⚠️ beforeinstallprompt non ricevuto dopo 3s');
        console.log('💡 Possibili cause:');
        console.log('   1. PWA già installata o rifiutata di recente');
        console.log('   2. Chrome richiede più interazione utente');
        console.log('   3. Apri DevTools → Application → Manifest per vedere i dettagli');
      }
    }, 3000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(debugTimeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt for next time
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isInstalled,
    handleInstallClick
  };
};