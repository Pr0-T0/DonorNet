import { useEffect, useState } from "react";
import { supabase } from "../SupabaseCilent";
import Header from "./Header";

const Alert = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchAlerts = async () => {
    const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
    if (!error) setAlerts(data);
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("alerts-channel")
      .on(
        "postgres_changes",
        {
          event: "*", // could be 'INSERT', 'UPDATE', or 'DELETE'
          schema: "public",
          table: "alerts",
        },
        () => {
          fetchAlerts(); // refetch alerts when any change happens
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6">
    <Header/>
      <h2 className="text-xl font-bold mb-4">Emergency Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts found.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li key={alert.id} className="p-4 bg-red-100 rounded-md shadow">
              <p><strong>Blood Type:</strong> {alert.blood_type}</p>
              <p><strong>Location:</strong> {alert.location}</p>
              <p><strong>Message:</strong> {alert.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alert;
