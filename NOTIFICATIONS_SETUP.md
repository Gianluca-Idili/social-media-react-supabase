# 🔔 Setup Notifiche Push - Task.level

## Prerequisiti completati ✅
- [x] Tabella `push_subscriptions` creata su Supabase
- [x] Service Worker con gestione push
- [x] Hook `useNotifications` per gestire sottoscrizioni
- [x] Componente `NotificationSettings` nella pagina profilo
- [x] Chiavi VAPID generate

## Passo 1: Configura i Secrets su Supabase

Vai su **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**

Aggiungi questo secret:
```
Nome: VAPID_PRIVATE_KEY
Valore: B5hEqqMGM51POySLoJqNsRt-wMDY4bygbMYoIlv0gOo
```

## Passo 2: Deploy della Edge Function

### Opzione A: Via CLI (consigliato)

1. Installa Supabase CLI se non l'hai già:
```bash
npm install -g supabase
```

2. Login:
```bash
supabase login
```

3. Linka il progetto (trova il project ref su Supabase Dashboard → Settings → General):
```bash
supabase link --project-ref IL_TUO_PROJECT_REF
```

4. Deploy della funzione:
```bash
supabase functions deploy send-notification
```

### Opzione B: Via Dashboard Supabase

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca **New Function**
3. Nome: `send-notification`
4. Copia il contenuto di `supabase/functions/send-notification/index.ts`
5. Deploy

## Passo 3: Testa le Notifiche

1. Vai sul tuo sito (in produzione su Vercel)
2. Fai login
3. Vai su **Profile**
4. Trova la sezione **Notifiche Push**
5. Clicca **Attiva Notifiche** (il browser chiederà il permesso)
6. Clicca **🧪 Test** per inviare una notifica di prova

## Come funziona

### Flusso di attivazione:
1. Utente clicca "Attiva Notifiche"
2. Browser chiede permesso
3. Browser crea una subscription push
4. La subscription viene salvata nella tabella `push_subscriptions`

### Flusso di invio notifica:
1. Un evento accade (like, commento, scadenza...)
2. Il codice chiama `sendPushNotification(userId, payload)`
3. La Edge Function recupera le subscription dell'utente
4. Invia la notifica tramite Web Push Protocol
5. Il Service Worker riceve la push e mostra la notifica

## Esempi di utilizzo nel codice

```typescript
import { notifyUser } from '../utils/notifications';

// Quando qualcuno mette like
await notifyUser.like(authorId, 'Mario', 'Lista della spesa');

// Quando una lista sta per scadere
await notifyUser.expiring(userId, 'Workout', 2); // 2 ore

// Quando una lista viene completata
await notifyUser.completed(userId, 'Obiettivi Mensili');
```

## Troubleshooting

### La notifica non arriva?
1. Controlla che le notifiche siano attive nel browser
2. Verifica che la subscription sia salvata nel database
3. Controlla i log della Edge Function su Supabase Dashboard

### Errore "VAPID_PRIVATE_KEY non configurata"?
Aggiungi il secret come descritto nel Passo 1

### Errore 410 Gone?
La subscription non è più valida. L'utente deve riattivare le notifiche.
