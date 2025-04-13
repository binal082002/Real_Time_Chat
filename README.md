🎙 **Real-Time Chat Application**

A full-stack real-time chat app built with React, Node.js, Express, MongoDB, Firebase Authentication, and Socket.IO. It supports:
  ✅ User authentication via Firebase
  ✅ Real-time text messaging
  ✅ Voice message recording, playback & sending
  ✅ Typing indicators
  ✅ Online user tracking
  ✅ Responsive UI with clear UX feedback

🛠 **Tech Stack**
**Frontend**

1)React (with Context API for auth & state)
2)Socket.IO client
3)Tailwind CSS

**Backend**

1)Node.js + Express
2)MongoDB (Mongoose)
3)Firebase Admin SDK (for token verification)
4(Socket.IO server
5)Multer (for audio file handling)

📡 **Socket.IO Events**
**Client to Server**
1)sendMessage: Sends message to other users
2)typing: Notifies receiver that sender is typing
3)stopTyping: Stops typing indicator

**Server to Client**
1)message: New message received
2)typing: Show typing indicator
3)stopTyping: Hide typing indicator
4)onlineUsers: Emits list of online users
