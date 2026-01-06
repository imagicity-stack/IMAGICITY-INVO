'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          await navigator.serviceWorker.register('/service-worker.js');
        } catch (error) {
          console.error('Service worker registration failed', error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  return null;
}
