-- Tabella per memorizzare le sottoscrizioni push degli utenti
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraint per evitare duplicati per lo stesso user
  UNIQUE(user_id, endpoint)
);

-- Indici per migliorare le performance
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active);

-- RLS (Row Level Security)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di gestire solo le proprie sottoscrizioni
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- Trigger per aggiornare automatically updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commenti per documentazione
COMMENT ON TABLE public.push_subscriptions IS 'Memorizza le sottoscrizioni push notification degli utenti';
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'URL endpoint del push service';
COMMENT ON COLUMN public.push_subscriptions.p256dh_key IS 'Chiave pubblica per crittografia P-256 ECDH';
COMMENT ON COLUMN public.push_subscriptions.auth_key IS 'Chiave di autenticazione per il push service';
COMMENT ON COLUMN public.push_subscriptions.user_agent IS 'User agent del browser per debugging';
COMMENT ON COLUMN public.push_subscriptions.is_active IS 'Se la sottoscrizione è ancora valida';