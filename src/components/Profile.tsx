import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SupabaseCilent';
import Header from './Header';

const Profile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

  // Common fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  // Donor-specific
  const [bloodGroup, setBloodGroup] = useState('');

  // Volunteer-specific
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState('');

  // Organization-specific (can edit organization name here)
  const [orgNameEditable, setOrgNameEditable] = useState('');

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        navigate('/');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || '');

      // Fetch profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // No profile found, redirect to profile page to fill
        setLoading(false);
        return;
      }

      setName(profile.full_name || '');
      setRole(profile.role || '');

      if (profile.role === 'donor') {
        // fetch donor details
        const { data: donor, error: donorError } = await supabase
          .from('donors')
          .select('blood_group')
          .eq('id', user.id)
          .single();

        if (!donorError && donor) {
          setBloodGroup(donor.blood_group || '');
        }
      } else if (profile.role === 'volunteer') {
        // fetch volunteer details including organization
        const { data: volunteer, error: volunteerError } = await supabase
          .from('volunteers')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!volunteerError && volunteer) {
          setOrganizationId(volunteer.organization_id);
          if (volunteer.organization_id) {
            // Fetch organization name for display
            const { data: org, error: orgError } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', volunteer.organization_id)
              .single();
            if (!orgError && org) {
              setOrganizationName(org.name);
            }
          }
        }
      } else if (profile.role === 'organization') {
        // fetch organization info by matching org with userId
        // assuming organization.id = user.id or you have mapping logic
        // For demo, let's try user.id directly

        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', user.id)
          .single();

        if (!orgError && org) {
          setOrgNameEditable(org.name || '');
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async () => {
    if (!name || !role) {
      alert('Please fill in all required fields: Name and Role.');
      return;
    }

    setLoading(true);

    // Upsert profile (common info)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: name,
      role,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      alert('Failed to update profile: ' + profileError.message);
      setLoading(false);
      return;
    }

    // Update role specific tables
    if (role === 'donor') {
      const { error: donorError } = await supabase.from('donors').upsert({
        id: userId,
        blood_group: bloodGroup,
        updated_at: new Date().toISOString(),
      });

      if (donorError) {
        alert('Failed to update donor info: ' + donorError.message);
        setLoading(false);
        return;
      }
    } else if (role === 'volunteer') {
      const { error: volunteerError } = await supabase.from('volunteers').upsert({
        id: userId,
        organization_id: organizationId,
        updated_at: new Date().toISOString(),
      });

      if (volunteerError) {
        alert('Failed to update volunteer info: ' + volunteerError.message);
        setLoading(false);
        return;
      }
    } else if (role === 'organization') {
      // Update organization info
      const { error: orgError } = await supabase.from('organizations').upsert({
        id: userId,
        name: orgNameEditable,
        updated_at: new Date().toISOString(),
      });

      if (orgError) {
        alert('Failed to update organization info: ' + orgError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-20 py-10">
      <Header />

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={userEmail}
              disabled
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-gray-800"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2"
              placeholder="Enter your name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2"
            >
              <option value="">Select Role</option>
              <option value="donor">Donor</option>
              <option value="volunteer">Volunteer</option>
              <option value="organization">Organization</option>
              {/* Admin role not editable here */}
            </select>
          </div>

          {/* Donor fields */}
          {role === 'donor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Volunteer fields */}
          {role === 'volunteer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization ID</label>
              <input
                type="text"
                value={organizationId || ''}
                onChange={e => setOrganizationId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder="Enter organization ID"
              />
              <small className="text-gray-500">Current Organization: {organizationName || 'None'}</small>
            </div>
          )}

          {/* Organization fields */}
          {role === 'organization' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                value={orgNameEditable}
                onChange={e => setOrgNameEditable(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2"
                placeholder="Enter organization name"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
            onClick={handleLogout}
          >
            Sign Out
          </button>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
            onClick={handleUpdate}
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
