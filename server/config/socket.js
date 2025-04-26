const {
  onlineUsers,
  roomUsersMap,
  groupMembersMap,
} = require("./user.map");

const Group = require("../models/Group.model");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("userOnline", async(userId) => {
      onlineUsers.set(userId, socket.id);
      const groups = await Group.find({members : userId});
      if(groups){
        for(const group of groups){
          groupMembersMap.set(group._id.toString(),new Set(group.members));
        }
      }
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
      for ([userId, socketId] of onlineUsers.entries()) {
        if (socketId == socket.id) {
          for (const [roomId, userSet] of roomUsersMap.entries()) {
            if (userSet.has(userId)) {
              userSet.delete(userId);
              if (userSet.size === 0) {
                roomUsersMap.delete(roomId);
              }
              break;
            }
          }
        }
      }

      for ([userId, socketId] of onlineUsers.entries()) {
        if (socketId == socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
      console.log("Client disconnected: ", socket.id);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId });
      }
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("chatOpened", ({ userId, roomId }) => {
      if(!roomUsersMap.has(roomId)){
        roomUsersMap.set(roomId, new Set([userId]));
      }else roomUsersMap.get(roomId).add(userId);
    });

    socket.on("chatClosed", ({ userId, roomId }) => {
      const userSet = roomUsersMap.get(roomId);
      if(userSet){
        userSet.delete(userId);
        if(userSet.size==0) roomUsersMap.delete(roomId)
      }
    });

    socket.on("sendMessage", (message) => {
      const {receiverId, roomId, senderId} = message;
      
      if(receiverId) {
        const receiver_socket_id = onlineUsers.get(receiverId);
        const sender_socket_id = onlineUsers.get(senderId);

        if(receiver_socket_id) io.to(receiver_socket_id).emit('newMessage',message);
        if(sender_socket_id) io.to(sender_socket_id).emit('newMessage',message)
      }

      if(!receiverId){
        const groupMembers = groupMembersMap.get(roomId.toString());

        if(groupMembers){
          for(const member_id of groupMembers){
            const socket_id = onlineUsers.get(member_id);
            if(socket_id){
              io.to(socket_id).emit('newMessage',message);
            }
          }
        }
      }
    });
    
  });
};
