// Supabase Edge Function per inviare notifiche push
// Deploy: supabase functions deploy send-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// VAPID keys - la chiave privata deve essere in Supabase Secrets
const VAPID_PUBLIC_KEY = 'BFVf_9584fDN7rEM1jbqd_EsHgaVO20J3rtMd3y4QoT8cb0xi0YMmrgmaomO3TiPRRWLawgxKRfo0tWM5AA4c10'

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  url?: string
}

interface NotificationRequest {
  userId?: string      // Invia a un utente specifico
  userIds?: string[]   // Invia a più utenti
  payload: PushPayload
}

// Funzione per convertire base64 URL-safe in Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Funzione per inviare notifica push usando Web Push Protocol
async function sendPushNotification(
  subscription: { endpoint: string; p256dh_key: string; auth_key: string },
  payload: PushPayload,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // Importa la libreria web-push per Deno
    const webPush = await import('https://esm.sh/web-push@3.6.7')
    
    webPush.setVapidDetails(
      'mailto:noreply@tasklevel.app',
      VAPID_PUBLIC_KEY,
      vapidPrivateKey
    )

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key
      }
    }

    await webPush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    )

    return true
  } catch (error) {
    console.error('Errore invio notifica:', error)
    
    // Se la subscription non è più valida (410 Gone), la rimuoviamo
    if (error.statusCode === 410 || error.statusCode === 404) {
      return false // Segnala che la subscription è invalida
    }
    
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ottieni la chiave privata VAPID dai secrets
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    if (!vapidPrivateKey) {
      throw new Error('VAPID_PRIVATE_KEY non configurata')
    }

    // Crea client Supabase con service role per accedere a tutte le subscriptions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { userId, userIds, payload }: NotificationRequest = await req.json()

    if (!payload || !payload.title) {
      return new Response(
        JSON.stringify({ error: 'Payload con title richiesto' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determina gli utenti target
    let targetUserIds: string[] = []
    if (userId) {
      targetUserIds = [userId]
    } else if (userIds && userIds.length > 0) {
      targetUserIds = userIds
    } else {
      return new Response(
        JSON.stringify({ error: 'userId o userIds richiesto' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ottieni le subscriptions attive per gli utenti
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds)
      .eq('is_active', true)

    if (fetchError) {
      throw fetchError
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'Nessuna subscription attiva' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Invia notifiche a tutte le subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const success = await sendPushNotification(sub, payload, vapidPrivateKey)
        
        // Se la subscription non è più valida, disattivala
        if (!success) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id)
        }
        
        return { subscriptionId: sub.id, success }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - sent

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent, 
        failed,
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
