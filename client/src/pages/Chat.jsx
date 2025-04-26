import React, { useState, useEffect, useRef } from "react";
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
  const [notifications, setNotifications] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedChatRef = useRef(null);

  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

  useEffect(() => {
    if (!selectedChat) return;

    selectedChatRef.current = selectedChat

    let roomId;
    if(selectedChat.type=="user") roomId = [user.uid, selectedChat.data.uid].sort().join("_");
    else roomId = selectedChat.data._id;

    socket.emit("joinRoom", roomId);
    socket.emit("chatOpened",{ userId: user.uid, roomId});

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.emit("chatClosed",{userId: user.uid, roomId})
    };
  }, [selectedChat]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      let relevant = false;

      const currentChat = selectedChatRef.current;
  
      if (currentChat) {
        if (currentChat.type === "user") {
          relevant =
            (message.senderId === user.uid && message.receiverId === currentChat?.data?.uid) ||
            (message.senderId === currentChat?.data?.uid && message.receiverId === user.uid);
        } else {
          relevant = currentChat?.data?._id === message.roomId;
        }

        if (relevant) {
          setMessages((prev) => [...prev, message]);
        }else setNotifications((prev)=>[...prev,message]);
      }else{
        setNotifications((prev)=>[...prev,message]);
      }
    };
  
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [user?.uid]);
  

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
    if (user?.uid) {
      socket.emit("userOnline", user.uid);
  
      socket.on("updateOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });
  
      return () => {
        socket.off("updateOnlineUsers");
      };
    }
  }, [user?.uid]);
  

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

  useEffect(() => {
    if (!selectedChat) return;
  
    const chatId = selectedChat.type === "user"
      ? [user.uid, selectedChat.data.uid].sort().join("_")
      : selectedChat.data._id;
  
    setNotifications((prev) =>
      prev.filter((msg) => {
        const msgRoomId = msg.roomId || [msg.senderId, msg.receiverId].sort().join("_");
        return msgRoomId !== chatId;
      })
    );

    const updateReadStatus = async () => {
      try {
        let roomId;
        if (selectedChat.type === "user") {
          roomId = [user.uid, selectedChat.data.uid].sort().join("_");
        } else {
          roomId = selectedChat.data._id;
        }

        if(notifications.length==0) return;
    
        const unreadExists = notifications.some(
          (msg) => msg.roomId === roomId && !msg.readBy.includes(user.uid)
        );
    
        if (!unreadExists) return; 
    
        const res = await secureApiCall(
          `${baseURL}/api/messages/${roomId}`,
          { method: "PATCH" },
          user?.accessToken
        );
    
        const data = await res.json();
    
        setNotifications((prev) =>
          prev.map((msg) => {
            if (msg.roomId === roomId && !msg.readBy.includes(user.uid)) {
              return {
                ...msg,
                readBy: [...msg.readBy, user.uid],
              };
            }
            return msg;
          })
        );
      } catch (err) {
        console.error("Failed to update read status:", err);
      }
    };
    

    updateReadStatus();

  }, [selectedChat]);

  useEffect(()=>{
    const fetchUnreadMessages = async () => {
      setLoading(true);

      try {
          const res = await secureApiCall(
            // `http://localhost:5000/api/messages?${params.toString()}`,
            `${baseURL}/api/messages/unread`,
            {},
            user?.accessToken
          );
          const data = await res.json();
          setNotifications((prev) => {
            const allMessages = [...prev, ...data.unreadMessages];
          
            const uniqueMessages = Array.from(
              new Map(allMessages.map((msg) => [msg._id, msg])).values()
            );
          
            return uniqueMessages;
          });
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        } finally{
          setLoading(false);
        }
    };

    fetchUnreadMessages();
  },[])
  

  if(loading) return <Loader/>

  return (
    <div className="flex h-190 bg-white">
      <UserList setSelectedChat={setSelectedChat} onlineUsers={onlineUsers} notifications={notifications}/>
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
