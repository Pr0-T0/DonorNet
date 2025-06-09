import { useEffect, useState } from "react";

import Header from "../Header";
import { Droplet, User, HeartPulse,} from "lucide-react";
import { supabase } from "../../SupabaseCilent";

const Donor = () => {
  const [profile, setProfile] = useState<any>(null);
  const [donorData, setDonorData] = useState<any>(null);
  const [volunteerName, setVolunteerName] = useState<string>("Not Assigned");
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorInfo = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const userId = user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", userId)
        .single();

      const { data: donorInfo } = await supabase
        .from("donors")
        .select("blood_group, volunteer_id")
        .eq("id", userId)
        .single();

      setProfile(profileData);
      setDonorData(donorInfo);

      if (donorInfo?.volunteer_id) {
        const { data: volunteerProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", donorInfo.volunteer_id)
          .single();

        setVolunteerName(volunteerProfile?.full_name || "Not Assigned");
      }

      const { data: donationsList } = await supabase
        .from("donations")
        .select("donation_date, units_donated, notes, donation_camps(name)")
        .eq("donor_id", userId)
        .order("donation_date", { ascending: false });

      setDonations(donationsList || []);
      setLoading(false);
    };

    fetchDonorInfo();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className={`flex items-center space-x-4 bg-white rounded-xl shadow p-4 border-l-4 ${color}`}>
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20 bg-gray-100 pb-10">
      <Header />
      <div className="max-w-5xl mx-auto px-4 mt-10 space-y-6">
        <h1 className="text-3xl py-10 font-bold text-red-600 mb-2">Welcome, {profile?.full_name}!</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<User className="text-blue-500" />}
            label="Volunteer"
            value={volunteerName}
            color="border-blue-500"
          />
          <StatCard
            icon={<Droplet className="text-red-500" />}
            label="Blood Group"
            value={
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
                {donorData?.blood_group || "Unknown"}
              </span>
            }
            color="border-red-500"
          />
          <StatCard
            icon={<HeartPulse className="text-pink-500" />}
            label="Total Donations"
            value={donations.length}
            color="border-pink-500"
          />
        </div>

        {/* Donation History */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Donation History</h2>
          {donations.length === 0 ? (
            <p className="text-gray-500">No donations yet.</p>
          ) : (
            <ol className="relative border-l border-gray-300 space-y-6 pl-6">
              {donations.map((donation) => (
                <li key={donation.id}>
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-1.5 top-1.5"></div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{donation.donation_camps?.name}</span>
                    <span className="ml-2 text-gray-500">({donation.donation_date})</span>
                  </div>
                  <div className="text-sm">
                    <strong>Units:</strong> {donation.units_donated} <br />
                    <strong>Notes:</strong> {donation.notes || "—"}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donor;
