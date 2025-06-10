import { useEffect, useState } from "react";
import Header from "../Header";
import { CalendarDays, Users } from "lucide-react";
import { supabase } from "../../SupabaseCilent";

const Volunteer = () => {
  const [volunteerProfile, setVolunteerProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      const { data: volunteerData } = await supabase
        .from("volunteers")
        .select(`
          id,
          profiles(full_name),
          organization_id,
          organizations(name)
        `)
        .eq("id", userId)
        .single();

      if (!volunteerData) {
        setLoading(false);
        return;
      }

      setVolunteerProfile(volunteerData);
      setOrganization(volunteerData.organizations);

      const { data: donorsData } = await supabase
        .from("donors")
        .select(`
          id,
          volunteer_id,
          blood_group,
          profiles(full_name),
          volunteers(profiles(full_name))
        `);

      setDonors(donorsData || []);

      const { data: eventsData } = await supabase
        .from("donation_camps")
        .select("*")
        .eq("organization_id", volunteerData.organization_id)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      setEvents(eventsData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-200 py-20">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Welcome + Org Info */}
        <div className="bg-white p-6 rounded-xl shadow ">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome,{" "}
            <span className="text-red-600">
              {volunteerProfile?.profiles?.full_name || "Volunteer"}
            </span>
          </h1>
          <p className="text-gray-600">
            Organization:{" "}
            <span className="font-medium text-blue-700">
              {organization?.name || "Not Assigned"}
            </span>
          </p>
        </div>

        {/* Donors & Events Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donors */}
          <div className="bg-white p-6 rounded-xl shadow  h-[400px] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-green-600" />
              <h2 className="text-xl font-semibold text-gray-700">Registered Donors</h2>
            </div>

            {donors.length === 0 ? (
              <p className="text-gray-500">No donors found.</p>
            ) : (
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                {donors.map((donor) => (
                  <li key={donor.id}>
                    <span className="font-semibold">
                      {donor.profiles?.full_name || "Unnamed Donor"}
                    </span>{" "}
                    — Blood Group:{" "}
                    <span className="text-blue-700 font-medium">
                      {donor.blood_group || "N/A"}
                    </span>
                    <br />
                    <span className="text-sm">
                      Assigned Volunteer:{" "}
                      {donor.volunteer_id ? (
                        <span className="text-green-700 font-medium">
                          {donor.volunteers?.profiles?.full_name || donor.volunteer_id}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not Assigned</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-xl shadow  h-[400px] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="text-red-600" />
              <h2 className="text-xl font-semibold text-gray-700">Upcoming Events</h2>
            </div>

            {events.length === 0 ? (
              <p className="text-gray-500">No upcoming events.</p>
            ) : (
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                {events.map((event) => (
                  <li key={event.id}>
                    <span className="font-semibold">{event.name}</span> —{" "}
                    <span className="text-blue-700 font-medium">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <br />
                    <span className="text-sm italic text-gray-600">
                      {event.location || "Location TBD"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
