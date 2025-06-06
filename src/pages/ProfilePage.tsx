import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../supabase-client';
import { useEffect, useState } from 'react';
import { ProfileDetail } from '../components/profile/ProfileDetail';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading'|'valid'|'invalid'>('loading');

  useEffect(() => {
    const verify = async () => {
      
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      
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