import React, { useState, useEffect } from "react";
import ChatWindow from "../Components/ChatWindow";
import UserList from "../Components/UserList";
import MessageInput from "../Components/MessageInput";
import { secureApiCall } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import Loader from "./Loader";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

  useEffect(() => {
    if (!selectedUser) return;

    const roomId = [user.uid, selectedUser.uid].sort().join("_");
    socket.emit("joinRoom", roomId);

    return () => {
      socket.emit("leaveRoom", roomId);
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      const relevant =
        (message.senderId === user.uid && message.receiverId === selectedUser?.uid) ||
        (message.senderId === selectedUser?.uid && message.receiverId === user.uid);

      if (relevant) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [user?.uid, selectedUser?.uid]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          senderId: user.uid,
          receiverId: selectedUser.uid,
        });
        const res = await secureApiCall(
          // `http://localhost:5000/api/messages?${params.toString()}`,
          `${baseURL}/api/messages?${params.toString()}`,
          {},
          user?.accessToken
        );
        const data = await res.json();
        setMessages(data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally{
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    socket.emit("userOnline", user.uid);
    socket.on("updateOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
    return () => {
      socket.off("updateOnlineUsers");
    };
  }, [user.uid]);

  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      setTypingUsers((prev) => [...new Set([...prev, senderId])]);
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, []);

  if(loading) return <Loader/>

  return (
    <div className="flex h-190 bg-white">
      <UserList onSelectUser={setSelectedUser} onlineUsers={onlineUsers} />
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-hidden rounded-2xl border h-1 border-purple-300">
              <ChatWindow
                messages={messages}
                currentUser={user}
                selectedUser={selectedUser}
                isOnline={onlineUsers.includes(selectedUser.uid)}
                isTyping={typingUsers.includes(selectedUser.uid)}
              />
            </div>
            <MessageInput senderId={user.uid} receiverId={selectedUser.uid} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-black font-bold text-xl">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
