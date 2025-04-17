const Message = require("../models/Message.model");
const { getGFS } = require("../config/db");
const { Readable } = require("stream");

const postMessages = async (req, res) => {
  try {
    const { senderId, receiverId, content, roomId } = req.body;
    if (!senderId) {
      return res.status(400).json({ message: "senderId is required" });
    }

    let messageType = "text";
    let messageContent = content;

    const gfs = getGFS();
    if (req.file) {
      messageType = "audio";
      const filename = `${Date.now()}-${req.file.originalname}`;

      const readableStream = Readable.from(req.file.buffer);

      const uploadStream = gfs.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });

      readableStream.pipe(uploadStream)
        .on("error", (err) => {
          console.error("Upload Error:", err);
          return res.status(500).json({ error: "Failed to upload audio file" });
        })
        .on("finish", async () => {
          messageContent = `/uploads/audio/${uploadStream.id}`;

          const newMessage = new Message({
            senderId,
            receiverId,
            content: messageContent,
            roomId,
            type: messageType,
          });

          await newMessage.save();
          return res.status(201).json({ newMessage });
        });
    } else if (!content?.trim()) {
      return res.status(400).json({ message: "Message content or audio file is required" });
    } else {
      const newMessage = new Message({
        senderId,
        receiverId,
        content: messageContent,
        roomId,
        type: messageType,
      });
      await newMessage.save();
      return res.status(201).json({ newMessage });
    }

  } catch (err) {
    console.error("Error in postMessages:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ message: "roomId is required" });
  }

  try {
    const messages = await Message.find({roomId}).sort({ timestamp: 1 });
      
    return res.json({ messages });

  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ error: "Failed to get messages" });
  }
};


module.exports = {
  postMessages,
  getMessages
};
