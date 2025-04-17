import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../supabase-client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MyLists } from '../components/personalLists/MyLists';

export const UserListsPage = () => {
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

  return <MyLists profileId={id!} />;
};