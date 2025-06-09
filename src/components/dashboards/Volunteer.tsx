import { useEffect, useState } from "react";
import Header from "../Header";
import { User, Users } from "lucide-react"; // Icons for UI
import { supabase } from "../../SupabaseCilent";

const Volunteer = () => {
  const [volunteerProfile, setVolunteerProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteerData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Fetch volunteer profile with org details
      const { data: volunteerData, error: volError } = await supabase
        .from("volunteers")
        .select(`
          id,
          profiles(full_name),
          organization_id,
          organizations(name) 
        `)
        .eq("id", userId)
        .single();

      if (volError) {
        setLoading(false);
        return;
      }

      setVolunteerProfile(volunteerData);

      if (volunteerData.organization_id) {
        
        setOrganization(volunteerData.organizations);
      }

      // Fetch donors assigned to this volunteer
      const { data: donorsData, error: donorsError } = await supabase
        .from("donors")
        .select(`
          id,
          blood_group,
          profiles(full_name)
        `)
        .eq("volunteer_id", userId);

      if (!donorsError) {
        setDonors(donorsData);
      }

      setLoading(false);
    };

    fetchVolunteerData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Header />
      <div className="max-w-6xl py-20 mx-auto px-4 mt-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, <span className="text-red-600">{volunteerProfile?.profiles.full_name}</span>
        </h1>

        {/* Volunteer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-700">Organization</h2>
            </div>
            <p className="text-gray-700">
              {organization ? organization.name : "No organization assigned"}
            </p>
          </div>

          {/* Donors */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-700">Your Donors</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {donors.length === 0 ? (
                <li>No donors assigned yet.</li>
              ) : (
                donors.map(({ id, profiles }) => (
                  <li key={id}>
                    {profiles.full_name} — Blood Group: {profiles.blood_group || "N/A"}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
