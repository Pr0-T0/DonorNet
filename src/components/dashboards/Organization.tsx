import { useEffect, useState } from "react";
import Header from "../Header";
import { Calendar, Building2 } from "lucide-react";
import { supabase } from "../../SupabaseCilent";

type Camp = {
  id: string;
  name: string;
  location: string;
  date: string;
};

const Organization = () => {
  const [orgProfile, setOrgProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [editValues, setEditValues] = useState({ name: "", location: "", date: "" });

  useEffect(() => {
    const fetchOrganizationData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const userId = user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      setOrgProfile({ ...profile, id: userId });

      const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", userId)
        .single();
      if (!orgData) {
        setLoading(false);
        return;
      }

      setOrganization(orgData);

      const { data: orgVolunteers } = await supabase
        .from("volunteers")
        .select("id, profile:profiles!volunteers_id_fkey(full_name)")
        .eq("organization_id", orgData.id);
      setVolunteers(orgVolunteers || []);

      const { data: orgCamps } = await supabase
        .from("donation_camps")
        .select("id, name, location, date")
        .eq("organization_id", orgData.id)
        .order("date", { ascending: true });
      setCamps(orgCamps || []);

      setLoading(false);
    };

    fetchOrganizationData();
  }, []);

  const handleDeleteCamp = async (campId: string) => {
    const { error } = await supabase.from("donation_camps").delete().eq("id", campId);
    if (error) {
      alert("Failed to delete camp.");
    } else {
      setCamps((prev) => prev.filter((camp) => camp.id !== campId));
    }
  };

  const handleEditClick = (camp: Camp) => {
    setEditingCamp(camp);
    setEditValues({ name: camp.name, location: camp.location, date: camp.date });
  };

  const handleUpdateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamp) return;

    const { name, location, date } = editValues;
    const { error } = await supabase
      .from("donation_camps")
      .update({ name, location, date })
      .eq("id", editingCamp.id);

    if (error) {
      alert("Failed to update camp.");
    } else {
      setCamps((prev) =>
        prev.map((c) =>
          c.id === editingCamp.id ? { ...c, name, location, date } : c
        )
      );
      setEditingCamp(null);
    }
  };

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const location = (form.elements.namedItem("location") as HTMLInputElement).value.trim();
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;

    if (!name || !location || !date) {
      alert("Please fill in all fields.");
      return;
    }

    const { data, error } = await supabase
      .from("donation_camps")
      .insert([
        {
          name,
          location,
          date,
          organization_id: organization.id,
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      alert("Failed to create camp.");
    } else {
      const newCamp = data[0] as Camp;
      setCamps((prev) => [...prev, newCamp]);
      form.reset();
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome, <span className="text-red-600">{orgProfile?.full_name}</span>
          </h1>
          <p className="text-sm text-gray-500">Organization ID: {organization?.id}</p>
        </div>

        {/* Volunteers Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-700">Volunteers</h2>
          </div>
          {volunteers.length === 0 ? (
            <p className="text-gray-500">No volunteers assigned yet.</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-gray-700">
              {volunteers.map((vol) => (
                <li key={vol.id} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                  {vol.profile?.full_name || "Unnamed Volunteer"}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming Camps Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-700">Upcoming Camps</h2>
          </div>
          {camps.length === 0 ? (
            <p className="text-gray-500">No upcoming camps.</p>
          ) : (
            <ul className="space-y-4">
              {camps.map((camp) => (
                <li
                  key={camp.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:shadow-sm"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{camp.name}</h3>
                    <p className="text-sm text-gray-500">
                      {camp.location} — {new Date(camp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm mt-1">
                    <button
                      onClick={() => handleEditClick(camp)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCamp(camp.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Create Camp Form */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Host a New Donation Camp</h2>
          <form onSubmit={handleCreateCamp} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Camp Name"
                className="border px-4 py-2 rounded w-full focus:outline-none focus:ring focus:border-blue-300"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                className="border px-4 py-2 rounded w-full focus:outline-none focus:ring focus:border-blue-300"
              />
              <input
                type="date"
                name="date"
                className="border px-4 py-2 rounded w-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded transition"
            >
              Create Camp
            </button>
          </form>
        </section>

        {/* Edit Camp Form */}
        {editingCamp && (
          <form onSubmit={handleUpdateCamp} className="mt-8 space-y-4 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800">Editing Camp: {editingCamp.name}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                value={editValues.name}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                placeholder="Camp Name"
                className="border px-4 py-2 rounded w-full"
              />
              <input
                type="text"
                value={editValues.location}
                onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                placeholder="Location"
                className="border px-4 py-2 rounded w-full"
              />
              <input
                type="date"
                value={editValues.date}
                onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                className="border px-4 py-2 rounded w-full"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingCamp(null)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Organization;
