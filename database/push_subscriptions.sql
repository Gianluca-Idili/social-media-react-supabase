-- SQL per creare la tabella push_subscriptions in Supabase

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraint per evitare duplicati
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Index per performance
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;

-- Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- Trigger per update automatico di updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commenti per documentazione
COMMENT ON TABLE push_subscriptions IS 'Stores push notification subscriptions for users';
COMMENT ON COLUMN push_subscriptions.subscription IS 'JSON object containing endpoint, keys (auth, p256dh)';
COMMENT ON COLUMN push_subscriptions.is_active IS 'Flag to enable/disable notifications without deleting subscription';