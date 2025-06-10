import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../SupabaseCilent";

const Header = () => {
  const [showForm, setShowForm] = useState(false);
  const [bloodType, setBloodType] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    if (!bloodType || !location || !message) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase.from("alerts").insert([
      {
        user_id: user.id,
        blood_type: bloodType,
        location,
        message,
      },
    ]);

    if (error) {
      alert("Failed to send alert.");
      console.error(error);
    } else {
      alert("Emergency alert sent!");
      setShowForm(false);
      setBloodType("");
      setLocation("");
      setMessage("");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">
          <span className="text-red-500">Donor</span>Net
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow cursor-pointer"
          >
            Emergency
          </button>
        </div>

        <nav className="hidden md:flex gap-10 text-gray-700 text-sm font-medium">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/alerts" className="hover:underline">Alerts</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
        </nav>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Emergency Alert</h2>

            <div className="space-y-3">
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full border px-4 py-2 rounded-md"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border px-4 py-2 rounded-md"
              />

              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border px-4 py-2 rounded-md"
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-red-500 text-white font-semibold py-2 rounded-md hover:bg-red-600"
              >
                Send Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
