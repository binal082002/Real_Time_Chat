const express = require('express');
const cors = require('cors');
const app = express();
const protectedRoutes = require("./routes/protected.js");
const messageRoutes = require('./routes/messages.routes.js');
const userRoutes = require('./routes/user.routes.js');
const groupRoutes = require('./routes/group.routes.js');

const socketIO = require("socket.io");
const socketHandler = require("./config/socket.js");
const http = require('http');
const path = require('path');
const { getGFS } = require('./config/db.js'); 
const mongoose = require("mongoose");
const { connectDB } = require('./config/db');

require('dotenv').config();

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/messages', messageRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// socket io connection
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});
socketHandler(io);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.use("/api", protectedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/group', groupRoutes);

// Serve audio file from GridFS
app.get('/api/audio/:id', async (req, res) => {
  const gfs = getGFS();
  const db = mongoose.connection.db;

  if (!gfs) {
    return res.status(500).json({ message: "GridFS not initialized yet" });
  }

  const fileId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const files = await db.collection('uploads.files').find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Audio file not found" });
    }

    const file = files[0];

    if (!file.contentType.startsWith('audio/')) {
      return res.status(400).json({ message: "Not an audio file" });
    }

    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
      console.error('Error in download stream:', err);
      res.status(500).json({ message: 'Error streaming file' });
    });

    downloadStream.pipe(res);

  } catch (err) {
    console.error('Error reading file:', err);
    res.status(500).json({ message: "Error reading file" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB(); // Ensure DB is connected and gfsBucket is set
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
