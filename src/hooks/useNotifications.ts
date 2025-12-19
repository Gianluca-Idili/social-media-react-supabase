import { useState, useEffect } from 'react';
import { supabase } from '../supabase-client';

export const useNotifications = (userId?: string) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications and service worker
    const checkSupport = () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
    
    // Restore subscription from Service Worker if exists
    if (userId && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
        }
      }).catch(console.error);
    }
  }, [userId]);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('❌ Notifiche non supportate su questo browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        console.log('✅ Permesso notifiche concesso');
        return true;
      } else {
        console.log('❌ Permesso notifiche negato');
        return false;
      }
    } catch (error) {
      console.error('Errore richiesta permessi:', error);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!userId) {
      console.log('❌ User ID richiesto per subscription');
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        await saveSubscriptionToDatabase(existingSubscription, userId);
        return true;
      }

      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVAPIDPublicKey())
      });

      setSubscription(newSubscription);
      await saveSubscriptionToDatabase(newSubscription, userId);
      
      console.log('✅ Push subscription creata:', newSubscription);
      return true;
    } catch (error) {
      console.error('Errore subscription push:', error);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription || !userId) return false;

    try {
      await subscription.unsubscribe();
      await removeSubscriptionFromDatabase(userId);
      setSubscription(null);
      
      console.log('✅ Push subscription rimossa');
      return true;
    } catch (error) {
      console.error('Errore unsubscribe:', error);
      return false;
    }
  };

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe
  };
};

// Helper function to convert VAPID key
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// VAPID public key (da generare)
const getVAPIDPublicKey = (): string => {
  // Chiave VAPID pubblica reale
  return 'BFVf_9584fDN7rEM1jbqd_EsHgaVO20J3rtMd3y4QoT8cb0xi0YMmrgmaomO3TiPRRWLawgxKRfo0tWM5AA4c10';
};

// Save subscription to Supabase
const saveSubscriptionToDatabase = async (
  subscription: PushSubscription, 
  userId: string
): Promise<void> => {
  const endpoint = subscription.endpoint;
  const p256dh_key = arrayBufferToBase64(subscription.getKey('p256dh')!);
  const auth_key = arrayBufferToBase64(subscription.getKey('auth')!);

  console.log('💾 Saving subscription for user:', userId);

  // First delete any existing subscription for this user
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId);

  // Then insert new subscription with correct column names
  const { error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: userId,
      endpoint: endpoint,
      p256dh_key: p256dh_key,
      auth_key: auth_key,
      is_active: true
    });

  if (error) {
    console.error('💾 Errore salvataggio subscription:', error);
    throw error;
  }
  
  console.log('✅ Subscription salvata con successo!');
};

// Remove subscription from database
const removeSubscriptionFromDatabase = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Errore rimozione subscription:', error);
    throw error;
  }
};

// Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};