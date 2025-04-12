const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },

  receiverId: {
    type: String,
  },

  roomId: {
    type: String,
  },

  content: {
    type: String, // This will store the URL to the message content (text or audio)
    required: true,
  },
  
  type: {
    type: String,
    enum: ["text", "audio"], // We specify that this can either be text or audio
    default: "text",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
