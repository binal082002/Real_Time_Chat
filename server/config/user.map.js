// maps.js
const onlineUsers = new Map();          // userId -> socketId
const roomUsersMap = new Map();         // roomId -> Set(userId) (who opened the room)
const groupMembersMap = new Map();      // roomId -> Set(userId) (all group members)

module.exports = {
  onlineUsers,
  roomUsersMap,
  groupMembersMap,
};
