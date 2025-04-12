import React, { useEffect, useRef } from "react";

const ChatWindow = ({
  messages,
  currentUser,
  selectedUser,
  isOnline,
  isTyping,
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getFullUrl = (path) => {
    // Adjust this based on your env setup
    const baseURL = import.meta.env.VITE_DEV_ENDPOINT;
    return `${baseURL}${path}`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pt-2 bg-gradient-to-br from-purple-200 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white w-full flex items-center gap-4 p-4 shadow-md rounded-xl">
        <div className="h-10 w-10 capitalize rounded-full bg-purple-700 flex items-center justify-center text-white">
          {selectedUser.displayName.charAt(0)}
        </div>
        <div className="font-semibold text-black capitalize">
          {selectedUser.displayName} <br />
          {isTyping ? (
            <span className="text-xs text-gray-400">Typing...</span>
          ) : (
            isOnline && <span className="text-sm text-green-400">Online</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 mt-2">
        {messages.map((msg, idx) => {
          const isOwnMessage = msg.senderId === currentUser.uid;
          const isAudio = msg.type === "audio";
          const audioSrc = isAudio ? getFullUrl(msg.content) : null;

          return (
            <div
              key={idx}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} my-2`}
            >
              <div
                className={`inline-block px-6 py-3 rounded-2xl text-black max-w-[70%] ${
                  isOwnMessage ? "bg-purple-200" : "bg-white"
                } shadow-md`}
              >
                <strong className="text-sm font-semibold capitalize">
                  {isOwnMessage ? "You" : selectedUser.displayName}
                </strong>

                <div className="mt-1 text-sm break-words">
                  {isAudio ? (
                    <audio controls controlsList="nodownload">
                      <source src={audioSrc} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
