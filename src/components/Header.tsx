import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm px-6 md:px-10 py-4 flex items-center justify-between">
      
      {/* Logo */}
      <div className="text-2xl font-bold text-gray-800">
        <span className="text-red-500">Donor</span>Net
      </div>

      {/* Emergency Button - Centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <button className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow">
          Emergency
        </button>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex gap-6 text-gray-700 text-sm font-medium">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/donate" className="hover:underline">Donate</Link>
        <Link to="/request" className="hover:underline">Request</Link>
        <Link to="/profile" className="hover:underline">Profile</Link>
      </nav>
    </header>
  );
};

export default Header;
