const Message = require("../models/Message.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();

// Ensure upload directory exists
const uploadDir = "uploads/audio";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for handling file uploads with size and type validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /audio/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    return cb(new Error("Only audio files are allowed"), false);
  },
});

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Unified post message controller for text + audio
const postMessages = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    let messageType = "text";
    let messageContent = content;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "senderId and receiverId are required" });
    }

    if (req.file) {
      // Audio message
      messageType = "audio";
      messageContent = `/uploads/audio/${req.file.filename}`;
    } else if (!content?.trim() && !req.file) {
      return res.status(400).json({ message: "Message content or audio file is required" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content: messageContent,
      type: messageType,
    });

    await newMessage.save();
    return res.status(201).json({ newMessage });
  } catch (err) {
    console.error("Error in postMessages:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "senderId and receiverId required" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    return res.json({ messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ error: "Failed to get messages" });
  }
};

module.exports = {
  postMessages,
  upload,
  getMessages,
};
