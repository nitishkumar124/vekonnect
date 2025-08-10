import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If not authenticated, the sidebar probably shouldn't show.
  // The Layout component will handle this by not rendering Layout for public routes.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-4 flex flex-col shadow-md">
      {/* Top Section: Logo/App Name */}
      <div className="flex justify-center items-center h-20 mb-8">
        {" "}
        {/* Increased height for logo area */}
        <Link
          to="/"
          className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent text-3xl font-bold 
  transition-colors duration-500 ease-in-out 
  hover:from-blue-400 hover:via-teal-400 hover:to-green-400"
        >
          VeKonnect
        </Link>
      </div>

      {/* Middle Section: Navigation Links */}
      <nav className="flex-grow flex flex-col space-y-4">
        <Link
          to="/"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-11 7v-3m0 3H9m7 0h3a1 1 0 001-1v-4m-7 2h-4a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1z"
            ></path>
          </svg>
          Home
        </Link>
        <Link
          to="/create-post"
          className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Create Post
        </Link>
        {user && (
          <Link
            to={`/profile/${user._id}`}
            className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
          >
            <img
              src={user.profilePicture || "https://via.placeholder.com/24"}
              alt="Profile"
              className="w-6 h-6 rounded-full mr-3 object-cover"
            />
            Profile
          </Link>
        )}
        {/* Add other nav links here (e.g., Explore, Messages, Notifications) */}
      </nav>

      {/* Bottom Section: Logout Button */}
      <div className="mt-auto">
        {" "}
        {/* Pushes content to the bottom */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
