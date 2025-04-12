const express = require('express');
const cors = require('cors');
const app = express();
const protectedRoutes = require("./routes/protected.js");
const messageRoutes = require('./routes/messages.routes.js');
const userRoutes = require('./routes/user.routes.js');
const socketIO = require("socket.io");
const socketHandler = require("./config/socket.js")
const http = require('http');
const path = require('path');

require('dotenv').config();

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/messages', messageRoutes);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//MongoDB connection
const connectDB = require('./config/db');
connectDB();

//socket io connection
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
