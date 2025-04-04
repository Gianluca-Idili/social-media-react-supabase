import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../supabase-client';
import { useEffect, useState } from 'react';
import { ProfileDetail } from '../components/ProfileDetail';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading'|'valid'|'invalid'>('loading');

  useEffect(() => {
    const verify = async () => {
      // Doppio controllo: sia da AuthContext che direttamente da Supabase
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      
      console.log("Debug:", {
        paramId: id,
        authContextUserId: user?.id,
        supabaseUserId: currentUser?.id
      });

      if (currentUser?.id === id) {
        setStatus('valid');
      } else {
        setStatus('invalid');
      }
    };

    verify();
  }, [id, user]);

  if (status === 'loading') {
    return <div>Verifica accesso in corso...</div>;
  }

  if (status === 'invalid') {
    return <Navigate to="/" replace />;
  }

  return <ProfileDetail profileId={id!} />;
};