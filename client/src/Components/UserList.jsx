import React, { useState, useEffect } from "react";
import { secureApiCall } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../pages/Loader";

const UserList = ({ onSelectUser, onlineUsers }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await secureApiCall(
          `${baseURL}/api/users`,
          // "http://localhost:5000/api/users",
          {},
          user?.accessToken
        );
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  return (
    <div className="hidden sm:block w-[250px] bg-white text-gray-800 py-4 px-1 rounded-2xl shadow-lg border border-purple-200">
      <h3 className="text-center font-bold text-2xl mb-4 text-purple-800">Users</h3>
      {loading ? (
        <Loader />
      ) : (
        <ul className="space-y-3 mt-2">
          {users.map((u) => (
            <li
              key={u.uid}
              onClick={() => onSelectUser(u)}
              className={`cursor-pointer p-3 rounded-xl transition-all duration-300 bg-purple-200 hover:bg-purple-300 ${
                onlineUsers.includes(u.uid) ? "border-l-4 border-green-500" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white text-black capitalize flex items-center justify-center font-bold">
                  {u.displayName.charAt(0)}
                </div>
                <span className="ml-3 text-sm capitalize font-semibold text-black">
                  {u.displayName}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
