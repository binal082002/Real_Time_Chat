import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  console.log(user);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const closeDropdown = () => setIsDropdownOpen(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#210d33] sticky top-0 z-50 text-white p-3 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center px-4">
        <Link
          to="/"
          className="text-3xl font-bold text-white hover:text-purple-200 transition"
        >
          TalkWave
        </Link>

        {/* Navigation links */}
        {/* Navigation links */}
        <div className="hidden sm:flex space-x-4 mt-2 sm:mt-0">
          <Link
            to="/"
            className="text-white font-bold hover:text-purple-200 transition"
          >
            Home
          </Link>
          {/* <Link
            to="/about"
            className="text-white font-bold hover:text-purple-200 transition"
          >
            About
          </Link>
          <Link
            to="/services"
            className="text-white font-bold hover:text-purple-200 transition"
          >
            Services
          </Link> */}
        </div>

        {/* Auth buttons / Avatar Dropdown */}
        <div className="flex space-x-3 mt-2 sm:mt-0 items-center">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={toggleDropdown}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold uppercase">
                  {user?.displayName?.charAt(0)}
                </div>
                <span className="text-purple-200 text-sm sm:text-base font-semibold capitalize">
                  {user?.displayName}
                </span>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#2e1842] rounded-md shadow-lg z-50">
                  {/* <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-purple-700 transition"
                    onClick={closeDropdown}
                  >
                    Profile
                  </Link> */}
                  <button
                    onClick={() => {
                      logout();
                      closeDropdown();
                    }}
                    className="block w-full rounded-lg text-left px-4 py-2 text-sm text-white hover:bg-purple-700 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 bg-purple-800 text-purple-100 rounded-full hover:bg-purple-900 transition text-sm sm:text-base"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-purple-800 text-white rounded-full hover:bg-purple-900 transition text-sm sm:text-base"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
