'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  isAppInstalled,
  isOnline as checkOnline,
  BeforeInstallPromptEvent
} from '@/lib/pwa';

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if app is installed
    setIsInstalled(isAppInstalled());

    // Check online status
    setIsOnline(checkOnline());

    // Register service worker
    registerServiceWorker().then(setRegistration);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      return false;
    }

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      return true;
    }
    
    return false;
  }, [installPrompt]);

  const enableNotifications = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);

    if (permission === 'granted' && registration) {
      // Subscribe to push notifications
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      if (vapidKey) {
        await subscribeToPushNotifications(registration, vapidKey);
      }
    }

    return permission === 'granted';
  }, [registration]);

  return {
    isInstalled,
    isOnline,
    canInstall: !!installPrompt,
    notificationPermission,
    registration,
    promptInstall,
    enableNotifications
  };
}
