const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: String,
  members: [String], // Array of user UIDs
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
