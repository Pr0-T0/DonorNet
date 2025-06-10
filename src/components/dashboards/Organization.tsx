import { useEffect, useState } from "react";
import Header from "../Header";
import { Calendar, Building2 } from "lucide-react";
import { supabase } from "../../SupabaseCilent";

const Organization = () => {
  const [orgProfile, setOrgProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      console.log("Starting to fetch organization data...");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Failed to fetch user:", userError);
        return;
      }

      const userId = user.id;
      console.log("Authenticated User ID:", userId);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Failed to fetch profile:", profileError);
      } else {
        console.log("Fetched profile:", profile);
        setOrgProfile({ ...profile, id: userId });
      }

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", userId)
        .single();

      if (orgError || !orgData) {
        console.warn("No organization record found for ID:", userId);
        setLoading(false);
        return;
      }

      console.log("Organization found:", orgData);
      setOrganization(orgData);

      const { data: orgVolunteers, error: volError } = await supabase
        .from("volunteers")
        .select("id, profile:profiles!volunteers_id_fkey(full_name)")
        .eq("organization_id", orgData.id);

      if (volError) {
        console.error("Error fetching volunteers:", volError);
      } else {
        console.log(`Found ${orgVolunteers?.length ?? 0} volunteer(s):`, orgVolunteers);
      }

      setVolunteers(orgVolunteers || []);

      const { data: orgCamps, error: campsError } = await supabase
        .from("donation_camps")
        .select("name, location, date")
        .eq("organization_id", orgData.id)
        .order("date", { ascending: true });

      if (campsError) {
        console.error("Error fetching camps:", campsError);
      } else {
        console.log(`Found ${orgCamps?.length ?? 0} camp(s):`, orgCamps);
      }

      setCamps(orgCamps || []);
      setLoading(false);
      console.log("Finished fetching all data.");
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
        <p className="text-sm text-gray-500 select-all">Organization ID: {organization?.id}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Volunteers */}
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
                  <li key={vol.id}>{vol.profile?.full_name || "Unnamed Volunteer"}</li>
                ))
              )}
            </ul>
          </div>

          {/* Camps */}
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
                    <div className="text-sm text-gray-500">
                      {camp.location} — {camp.date}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* New Camp Form */}
        <div className="bg-white p-6 rounded-xl shadow mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Host a New Donation Camp</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
              const location = (form.elements.namedItem("location") as HTMLInputElement).value.trim();
              const date = (form.elements.namedItem("date") as HTMLInputElement).value;

              if (!name || !location || !date) {
                alert("Please fill in all fields.");
                return;
              }

              const { data, error } = await supabase.from("donation_camps").insert([
                {
                  name,
                  location,
                  date,
                  organization_id: organization.id,
                },
              ]);

              if (error) {
                console.error("Error creating camp:", error);
                alert("Failed to create camp.");
              } else {
                console.log("New camp created:", data);
                setCamps((prev) => [...prev, { name, location, date }]);
                form.reset();
              }
            }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Camp Name"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="date"
                name="date"
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded"
            >
              Create Camp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Organization;
