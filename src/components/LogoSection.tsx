const LogoSection = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
        <img src="src/assets/logo.png" alt="Donor-Net" className="" />
      </div>
      {/* <h1 className="mt-4 text-red-600 font-bold text-xl">Donor-Net</h1> */}
      {/* <span className="text-red-500 text-sm mt-1">tagline</span> */}
    </div>
  );
};

export default LogoSection;
