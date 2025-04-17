import React, { useState, useEffect } from "react";
import { secureApiCall } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../pages/Loader";
import group_validation from "../Validations/group.validation";
import { toast } from "react-toastify";

const UserList = ({ setSelectedChat, onlineUsers }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grpPopup, setGrpPopup] = useState(false);
  const [group, setGroup] = useState({ name: "", members: [] });
  const [errors, setErrors] = useState({});

  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, groupsRes] = await Promise.all([
          secureApiCall(`${baseURL}/api/users`, {}, user?.accessToken),
          secureApiCall(`${baseURL}/api/group`, {}, user?.accessToken)
        ]);
  
        const [usersData, groupsData] = await Promise.all([
          usersRes.json(),
          groupsRes.json()
        ]);
  
        setUsers(usersData);
        setGroups(groupsData);
      } catch (err) {
        console.error("Failed to fetch users or groups:", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (user?.uid) {
      fetchData();
    }
  }, [grpPopup]);
  

  const toggleMember = (uid) => {
    setGroup((prev) => {
      const members = prev.members.includes(uid)
        ? prev.members.filter((id) => id !== uid)
        : [...prev.members, uid];
      return { ...prev, members };
    });
  };

  const handleGroupCreate = async (e) => {
    e.preventDefault();

      let error = group_validation(group);

      if (error && Object.keys(error).length > 0) {
        setErrors(error);
        return;
      }

      setErrors({});
      try {
        const res = await secureApiCall(
          `${baseURL}/api/group`,
          { method: "POST", body: JSON.stringify({
            name: group.name,
            members: Array.from(new Set([...group.members, user.uid])),
          })},
          user?.accessToken
        );

        if(res.ok){
          setGroup({ name: "", members: [] });
          setGrpPopup(false);
          toast.success("Group created successfully")
        }

      } catch (error) {
        console.error("Failed to create group:", err);
      }
  };

  return (
    <div className="hidden sm:block w-[290px] bg-white text-gray-800 py-4 px-1 rounded-2xl shadow-lg border border-purple-200">
      <div className="flex justify-around items-center mb-4 w-full">
        <h3 className="text-center font-bold text-2xl text-purple-800">
          Chats
        </h3>
        <button
          className="text-sm bg-purple-600 text-white px-1.5 py-2 rounded hover:bg-purple-700"
          onClick={()=>setGrpPopup(!grpPopup)}
        >
          Create Group
        </button>
      </div>

     
        <ul className="space-y-3 mt-2">
          {users.map((u) => (
            <li
              key={u.uid}
              onClick={() => setSelectedChat({type : "user", data : u})}
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

{groups.map((group) => (
            <li
              key={group._id}
              onClick={() => setSelectedChat({type : "group", data : group})}
              className={`cursor-pointer p-3 rounded-xl transition-all duration-300 bg-purple-200 hover:bg-purple-300`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white text-black capitalize flex items-center justify-center font-bold">
                &#128101; 
                </div>
                <span className="ml-3 text-sm capitalize font-semibold text-black">
                  {group.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      

      {grpPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 z-50">
          <div className="bg-purple-50 border-1 border-purple-700 p-6 rounded-xl shadow-2xl w-[90%] max-w-md text-left relative max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-purple-800">
              Create Group
            </h2>

            <input
              type="text"
              placeholder="Group Name"
              value={group.name}
              onChange={(e) => setGroup({ ...group, name: e.target.value })}
              className="w-full border border-purple-300 rounded-md px-3 py-2 mb-4 focus:outline-none"
            />
            {errors?.name && (<p className="text-sm text-red-500 -mt-3">{errors.name}</p>)}


            <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
              {users.map((u) => (
                <label key={u.uid} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={group.members.includes(u.uid)}
                    onChange={() => toggleMember(u.uid)}
                    className="accent-purple-600"
                  />
                  <span className="capitalize font-medium">
                    {u.displayName}
                  </span>
                </label>
              ))}
              {errors?.members && (<p className="text-sm text-red-500 -mt-3">{errors.members}</p>)}

            </div>


            <div className="flex justify-center gap-8 align-middle">
              <button
                onClick={() => {setGrpPopup(false); setGroup({ name: "", members: [] }); setErrors({})}}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleGroupCreate}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
