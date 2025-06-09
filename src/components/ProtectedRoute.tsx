// ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SupabaseCilent';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/'); // redirect to login
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (error || !profile?.role) {
        navigate('/profile'); // profile incomplete
        return;
      }

      setLoading(false);
    };

    checkUserProfile();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return <>{children}</>;
};

export default ProtectedRoute;
