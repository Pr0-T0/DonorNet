import { useState } from "react";
import { Search } from "lucide-react";
import Header from "../Header";

const Admin = () => {
  const [search, setSearch] = useState("");

  const hospitals = [
    "PaceHolder 1",
    "PaceHolder 2",
    "PaceHolder 3",
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-20 py-20 space-y-12 shadow-2xl">
      {/* Header */}
      <Header/>
      {/* Hero Section */}
      <div className="text-center py-10 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Save Lives. Donate <span className="text-red-500">Blood</span>.
        </h1>
        <p className="text-xl md:text-2xl font-medium text-gray-600">
          Find Donors Near You.
        </p>
      </div>

      {/* Search Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            className="w-full py-4 pl-12 pr-4 text-lg border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Search Group, Hospital, ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="px-4 py-2 rounded-full border text-sm text-gray-700 hover:bg-gray-100">
            Blood Group
          </span>
          <span className="px-4 py-2 rounded-full bg-green-500 text-white text-sm">
            Hospital
          </span>
          <span className="px-4 py-2 rounded-full border text-sm text-gray-700 hover:bg-gray-100">
            Filter 3
          </span>
        </div>
      </div>

      {/* Result Table */}
      <div className="bg-white w-full max-w-4xl mx-auto rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-green-600 border-b pb-2 mb-4">
          Hospital Name
        </h3>
        <ul className="space-y-4">
          {hospitals.map((name, index) => (
            <li key={index} className="text-gray-800 font-medium">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin