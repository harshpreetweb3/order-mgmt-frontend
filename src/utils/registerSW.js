let deferredPrompt = null;

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt event captured');
    // Dispatch custom event for UI component listeners
    window.dispatchEvent(new Event('pwa-installable'));
  });
};

export const promptPWAInstall = async () => {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`[PWA] Install prompt outcome: ${outcome}`);
  deferredPrompt = null;
  return outcome === 'accepted';
};
