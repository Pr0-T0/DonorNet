import { useEffect, useState } from "react";
import Header from "../Header";
import { Calendar, Building2 } from "lucide-react";
import { supabase } from "../../SupabaseCilent";

const Organization = () => {
  const [orgProfile, setOrgProfile] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const userId = user.id;

      // Get organization profile (from profiles table)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      setOrgProfile({ ...profile, id: userId });

      // Get volunteers linked to this organization
      const { data: orgVolunteers } = await supabase
        .from("volunteers")
        .select("id, profiles(full_name)")
        .eq("organization_id", userId);

      setVolunteers(orgVolunteers || []);

      // Get donation camps by this organization
      const { data: orgCamps } = await supabase
        .from("donation_camps")
        .select("name, location, date")
        .eq("organization_id", userId)
        .order("date", { ascending: true });

      setCamps(orgCamps || []);
      setLoading(false);
    };

    fetchOrganizationData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Header />
      <div className="max-w-6xl py-20 mx-auto px-4 mt-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, <span className="text-red-600">{orgProfile?.full_name}</span>
        </h1>
        <p className="text-sm text-gray-500 select-all">Organization ID: {orgProfile?.id}</p>

        {/* Organization Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-700">Volunteers</h2>
            </div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {volunteers.length === 0 ? (
                <li>No volunteers assigned yet.</li>
              ) : (
                volunteers.map((vol) => (
                  <li key={vol.id}>{vol.profiles.full_name}</li>
                ))
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-700">Upcoming Camps</h2>
            </div>
            <ul className="list-none text-gray-700 space-y-2">
              {camps.length === 0 ? (
                <li>No upcoming camps.</li>
              ) : (
                camps.map((camp, i) => (
                  <li key={i} className="border-b py-2">
                    <div className="font-semibold">{camp.name}</div>
                    <div className="text-sm text-gray-500">{camp.location} — {camp.date}</div>
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

export default Organization;
