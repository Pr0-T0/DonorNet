import { useEffect, useState } from "react";
import { supabase } from "../SupabaseCilent";
import Header from "./Header";

const Alert = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (!error) setAlerts(data);
    else console.error("Error fetching alerts:", error);
  };

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (error) {
      alert("Failed to delete alert.");
      console.error(error);
    } else {
      fetchAlerts(); // refresh the list
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAlerts();

    const channel = supabase
      .channel("alerts-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6">
      <Header />
      <h2 className="text-xl font-bold mb-4">Emergency Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts found.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="p-4 bg-red-100 rounded-md shadow border-l-4 border-red-500"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-red-700">
                  🔔 Alert by: {alert.profiles?.full_name || "Unknown"}
                </p>
                <span className="text-sm text-gray-500">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
              <p><strong>Blood Type:</strong> {alert.blood_type}</p>
              <p><strong>Location:</strong> {alert.location}</p>
              <p><strong>Message:</strong> {alert.message}</p>
              
              {/* Show delete button if user is the owner */}
              {userId === alert.user_id && (
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="mt-3 text-sm text-red-600 hover:underline"
                >
                  🗑️ Delete Alert
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alert;
