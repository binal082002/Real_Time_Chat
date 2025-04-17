import React, { useEffect, useRef } from "react";

const GroupWindow = ({ messages, currentUser, selectedChat }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAudioUrl = (url) => {
    const baseURL = import.meta.env.VITE_DEV_ENDPOINT;
    const parts = url.split("/");
    const id = parts[parts.length - 1]; // returns the last part as ID

    return `${baseURL}/api/audio/${id}`;
  };

  const getSenderName = (senderId) => {
    const sender = selectedChat.data.members.find(
      (member) => member.uid === senderId
    );
    return sender?.displayName;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pt-2 bg-gradient-to-br from-purple-200 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white w-full flex items-start gap-4 p-4 shadow-md rounded-xl">
        <div className="h-10 w-10 capitalize rounded-full bg-purple-700 flex items-center justify-center text-white">
          {selectedChat?.data?.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <div className="font-semibold text-black capitalize">
            {selectedChat?.data?.name}
          </div>

          <div
            className="text-xs text-gray-600 truncate max-w-[250px] capitalize"
            title={selectedChat?.data?.members
              .map((m) => m.displayName)
              .join(", ")}
          >
            {selectedChat?.data?.members.map((m) => m.displayName).join(", ")}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 mt-2">
        {messages.map((msg, idx) => {
          const isOwnMessage = msg?.senderId === currentUser.uid;
          const isAudio = msg.type === "audio";
          const audioSrc = isAudio ? getAudioUrl(msg.content) : null;

          return (
            <div
              key={idx}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              } my-2`}
            >
              <div
                className={`inline-block px-6 py-3 rounded-2xl text-black max-w-[70%] ${
                  isOwnMessage ? "bg-purple-200" : "bg-white"
                } shadow-md`}
              >
                <strong className="text-sm font-semibold capitalize">
                  {isOwnMessage ? "You" : getSenderName(msg.senderId)}
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

export default GroupWindow;
