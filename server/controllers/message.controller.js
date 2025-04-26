const Message = require("../models/Message.model");
const Group = require("../models/Group.model");
const { getGFS } = require("../config/db");
const { Readable } = require("stream");
const {roomUsersMap} = require("../config/user.map");

const postMessages = async (req, res) => {
  try {
    const { senderId, receiverId, content, roomId } = req.body;

    const usersInRoom = Array.from(roomUsersMap.get(roomId) || []);
    const readBy = [...usersInRoom];

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
          let payload = {
            senderId,
            receiverId,
            content: messageContent,
            roomId,
            type: messageType,
            readBy
          }

          const newMessage = new Message(payload);

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
        readBy
      });
      await newMessage.save();
      return res.status(201).json({ newMessage });
    }

  } catch (err) {
    console.error("Error in postMessages:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

const updateReadByStatus = async (req, res) => {
  try {
    const roomId = req.params.id;
    const user_id = req.user.uid;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    // Fetch all messages from the given room
    const messages = await Message.find({ roomId });

    if (!messages.length) {
      return res.status(400).json({ message: "No messages found for this room" });
    }

    // Go through each message and update readBy if user_id not already present
    const bulkOps = messages.map((msg) => {
      if (!msg.readBy.includes(user_id)) {
        return {
          updateOne: {
            filter: { _id: msg._id },
            update: { $addToSet: { readBy: user_id } }
          }
        };
      }
      return null;
    }).filter(Boolean); // remove nulls (no update needed)

    if (bulkOps.length) {
      await Message.bulkWrite(bulkOps);
    }

    return res.status(200).json({ message: "Messages marked as read", updatedCount: bulkOps.length });
  } catch (error) {
    console.error("Error in updateReadByStatus:", error);
    return res.status(500).json({ error: "Failed to update read status" });
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

const getUnreadMessages = async(req,res) => {
  try{
    const user_id = req.user.uid;
    let unreadMessages = [];

    let existMessages = await Message.find({receiverId : user_id, readBy:{$nin:[user_id]}});

    if(existMessages.length) unreadMessages.push(...existMessages);

    let userGroups = await Group.find({members:{$in:[user_id]}});

    if(userGroups){
      for(let group of userGroups){
        let message = await Message.find({roomId : group._id, readBy:{$nin:[user_id]}});
        if(message) unreadMessages.push(...message)
      }
    }

    return res.json({ unreadMessages });

  }catch(error){
    return res.status(500).json({ error: "Failed to get unread messages" });

  }
}

module.exports = {
  postMessages,
  getMessages,
  updateReadByStatus,
  getUnreadMessages
};
