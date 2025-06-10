import { useEffect, useState } from "react";
import Header from "../Header";
import { Users } from "lucide-react";
import { supabase } from "../../SupabaseCilent";

const Volunteer = () => {
  const [volunteerProfile, setVolunteerProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Get volunteer profile + organization
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

      if (volError || !volunteerData) {
        setLoading(false);
        return;
      }

      setVolunteerProfile(volunteerData);
      setOrganization(volunteerData.organizations);

      // Get all donors and their assigned volunteer (if any)
      const { data: donorsData, error: donorsError } = await supabase
        .from("donors")
        .select(`
          id,
          volunteer_id,
          blood_group,
          profiles(full_name),
          volunteers(profiles(full_name))
        `);

      if (!donorsError && donorsData) {
        setDonors(donorsData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Header />
      <div className="max-w-6xl py-20 mx-auto px-4 mt-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, <span className="text-red-600">{volunteerProfile?.profiles?.full_name}</span>
        </h1>

        {/* Organization Info */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-700">Organization</h2>
          </div>
          <p className="text-gray-700">
            {organization ? organization.name : "No organization assigned"}
          </p>
        </div>

        {/* All Donors */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-700">All Donors</h2>
          </div>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {donors.length === 0 ? (
              <li>No donors found.</li>
            ) : (
              donors.map(donor => (
                <li key={donor.id}>
                  {donor.profiles?.full_name} — Blood Group: {donor.blood_group || "N/A"} —{" "}
                  {donor.volunteer_id ? (
                    <span className="text-blue-600">
                      Assigned to {donor.volunteers?.profiles?.full_name || donor.volunteer_id}
                    </span>
                  ) : (
                    <span className="text-gray-500">Unassigned</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
