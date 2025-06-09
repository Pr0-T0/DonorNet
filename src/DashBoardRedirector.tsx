// DashboardRedirector.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseCilent';


const DashboardRedirector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/'); // Not logged in
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile?.role) {
        navigate('/profile'); // Redirect here if no role
        return;
      }

      switch (profile.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'donor':
          navigate('/donor-profile');
          break;
        case 'volunteer':
          navigate('/volunteer-tools');
          break;
        case 'organization':
          navigate('/organization-panel');
          break;
        default:
          // Redirect to profile for any unknown role instead of unauthorized
          navigate('/profile');
          break;
      }
    };

    redirectBasedOnRole();
  }, [navigate]);

  return <div className="text-center mt-10">Redirecting...</div>;
};

export default DashboardRedirector;
