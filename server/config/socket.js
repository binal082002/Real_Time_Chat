const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // socket.on("join", ({ roomId }) => {
    //   socket.join(roomId);
    //   console.log("User joined room: ", roomId);
    // });

    socket.on("roomId", (message) => {
      console.log("Message received: ", message);
      io.emit("newMessage", message);
    });

    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
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

    socket.on("sendMessage", (message) => {
      io.to(message.roomId).emit("newMessage", message);
    });
  });
};
