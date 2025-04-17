import React, { useState, useEffect } from "react";
import ChatWindow from "../Components/ChatWindow";
import GroupWindow from "../Components/GroupWindow";
import UserList from "../Components/UserList";
import MessageInput from "../Components/MessageInput";
import { secureApiCall } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import Loader from "./Loader";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

  useEffect(() => {
    if (!selectedChat) return;

    let roomId;
    if(selectedChat.type=="user") roomId = [user.uid, selectedChat.data.uid].sort().join("_");
    else roomId = selectedChat.data._id;

    socket.emit("joinRoom", roomId);

    return () => {
      socket.emit("leaveRoom", roomId);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    const handleNewMessage = (message) => {
      let relevant = false;

      if(selectedChat.type == "user"){
        relevant =
        (message.senderId === user.uid && message.receiverId === selectedChat?.data?.uid) ||
        (message.senderId === selectedChat?.data?.uid && message.receiverId === user.uid);
      }else {
        relevant = selectedChat?.data?._id == message.roomId
      }
      
      if (relevant) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [user?.uid, selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      setLoading(true);

      let roomId;
      if(selectedChat.type=="user") roomId = [user.uid, selectedChat.data.uid].sort().join("_");
      else roomId = selectedChat.data._id;

      try {
          const params = new URLSearchParams({roomId});
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
  }, [selectedChat]);

  useEffect(() => {
    
    if (!selectedChat) return;

    socket.emit("userOnline", user.uid);
    socket.on("updateOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
    return () => {
      socket.off("updateOnlineUsers");
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;

    if(selectedChat.type=="user"){
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
    }
  }, [selectedChat]);

  if(loading) return <Loader/>

  return (
    <div className="flex h-190 bg-white">
      <UserList setSelectedChat={setSelectedChat} onlineUsers={onlineUsers} />
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {selectedChat ? (
          <>
          {selectedChat.type=="user" ? (<div className="flex-1 overflow-hidden rounded-2xl border h-1 border-purple-300">
              <ChatWindow
                messages={messages}
                currentUser={user}
                selectedChat={selectedChat}
                isOnline={onlineUsers.includes(selectedChat?.data?.uid)}
                isTyping={typingUsers.includes(selectedChat?.data?.uid)}
              />
            </div> )
            : (<div className="flex-1 overflow-hidden rounded-2xl border h-1 border-purple-300">
              <GroupWindow
                messages={messages}
                currentUser={user}
                selectedChat={selectedChat}
              />
            </div>)}
            
            <MessageInput selectedChat={selectedChat} currentUser={user}/>
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
