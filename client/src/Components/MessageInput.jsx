import React, { useState, useRef } from "react";
import { secureApiCall } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";

const MessageInput = ({ senderId, receiverId }) => {
  const [content, setContent] = useState("");
  const [recording, setRecording] = useState(false);
  const [isRecordingText, setIsRecordingText] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

  const { user } = useAuth();

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (value) {
      socket.emit("typing", { senderId, receiverId });
    } else {
      socket.emit("stopTyping", { senderId, receiverId });
    }
  };

  const handleSend = async () => {
    if (!content.trim() || recording) return;

    const formData = new FormData();
    formData.append("senderId", senderId);
    formData.append("receiverId", receiverId);

    if (recordedAudio) formData.append("audio", recordedAudio);
    else formData.append("content", content);

    try {
      const res = await secureApiCall(
        `${baseURL}/api/messages`,
        // "http://localhost:5000/api/messages",
        {
          method: "POST",
          body: formData,
        },
        user?.accessToken
      );

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      const message = data.newMessage;

      socket.emit("sendMessage", {
        roomId: [senderId, receiverId].sort().join("_"),
        senderId,
        receiverId,
        content: message.content,
        type: recordedAudio ? "audio" : "text",
      });

      setContent("");
      setRecordedAudio(null);
      socket.emit("stopTyping", { senderId, receiverId });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecordingText(false);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size === 0) {
          console.warn("Recorded audio is empty.");
          return;
        }

        setRecordedAudio(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      setIsRecordingText(true);
      setShowRecordingModal(true); // 👈 open modal
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleAudioSend = async () => {
    if (!recordedAudio) return;

    const formData = new FormData();
    formData.append("senderId", senderId);
    formData.append("receiverId", receiverId);
    formData.append("audio", recordedAudio);

    try {
      const res = await secureApiCall(
        `${baseURL}/api/messages`,
        {
          method: "POST",
          body: formData,
        },
        user?.accessToken
      );

      if (!res.ok) throw new Error("Audio send failed");

      const data = await res.json();
      const message = data.newMessage;

      socket.emit("sendMessage", {
        roomId: [senderId, receiverId].sort().join("_"),
        senderId,
        receiverId,
        content: message.content,
        type: "audio",
      });

      setRecordedAudio(null);
      setShowRecordingModal(false);
      socket.emit("stopTyping", { senderId, receiverId });
    } catch (err) {
      console.error("Failed to send audio:", err);
    }
  };

  // const stopRecording = () => {
  //   setTimeout(() => {
  //     if (
  //       mediaRecorderRef.current &&
  //       mediaRecorderRef.current.state === "recording"
  //     ) {
  //       mediaRecorderRef.current.stop();
  //       setRecording(false);
  //     }
  //   }, 1000); // wait 1 second before stopping
  // };

  return (
    <div className="flex items-center p-4 bg-white border border-purple-300 shadow-2xl rounded-lg mt-2 relative">
      <input
        type="text"
        value={content}
        onChange={handleChange}
        placeholder="Type your message..."
        className="w-full p-3 bg-[#e6d9f2] text-black rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={recording}
      />

      <button
        onClick={handleSend}
        disabled={recording}
        className={`ml-3 px-6 py-2 rounded-full text-lg transition cursor-pointer ${
          recording
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-800 hover:bg-purple-900 text-white"
        }`}
      >
        Send
      </button>

      <button
        onClick={startRecording}
        className={`cursor-pointer ml-2 px-3 py-2 rounded-full bg-purple-400 hover:bg-purple-500 text-white text-2xl`}
        title="Record Audio"
      >
        🎤
      </button>

      {showRecordingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-10 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl h-40 w-[30%] sm:w-[40%] lg:w-[90%] max-w-lg text-center">
            {isRecordingText && (
              <div className="text-red-600 font-semibold mb-4 animate-pulse">
                🔴 Recording Audio...
              </div>
            )}

            {recordedAudio && (
              <div className="mb-4">
                <audio
                  controls
                  controlsList="nodownload"
                  className="w-full"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source
                    src={URL.createObjectURL(recordedAudio)}
                    type="audio/webm"
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-4">
              {!recordedAudio && (
                <button
                  onClick={stopRecording}
                  className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white shadow-2xl rounded-lg"
                >
                  Stop Recording
                </button>
              )}

              {recordedAudio && (
                <>
                  <button
                    onClick={handleAudioSend}
                    className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-lg cursor-pointer"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setRecordedAudio(null);
                      setShowRecordingModal(false);
                    }}
                    className="px-4 py-2 border border-purple-800 bg-white text-purple-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
