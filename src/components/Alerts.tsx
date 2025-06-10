import { useEffect, useState } from "react";
import { supabase } from "../SupabaseCilent";
import toast from "react-hot-toast";
import Header from "./Header";

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch existing alerts initially
    const fetchAlerts = async () => {
      const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
      setAlerts(data || []);
    };
    fetchAlerts();

    // Subscribe to realtime INSERTs
    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          toast.error(`🚨 Emergency: ${payload.new.blood_type} needed at ${payload.new.location}`);
          setAlerts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <><Header /><div className="p-6">
          <h2 className="text-2xl font-bold py-20 text-center mb-4">Emergency Alerts</h2>
          <ul className="space-y-3">
              {alerts.map((alert) => (
                  <li key={alert.id} className="bg-red-100 p-4 rounded shadow text-red-900">
                      <strong>{alert.blood_type}</strong> at <em>{alert.location}</em><br />
                      {alert.message} <br />
                      <small>{new Date(alert.created_at).toLocaleString()}</small>
                  </li>
              ))}
          </ul>
      </div></>
  );
};

export default Alerts;
