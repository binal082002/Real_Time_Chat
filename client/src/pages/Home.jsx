import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import chatImg from "../assets/images/chat.png";
import Loader from "./Loader";
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-purple-100 to-white">
      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-xl text-center bg-white shadow-2xl p-8 sm:p-10 rounded-3xl border border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-800 mb-4">
            Welcome to TalkWave
          </h1>
          <p className="text-gray-600 mb-6 text-base sm:text-lg">
            Connect with friends and chat in real-time. Start a conversation now!
          </p>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-3 bg-purple-800 text-white rounded-full text-lg hover:bg-purple-900 cursor-pointer shadow-md hover:shadow-lg transition"
          >
            {user ? "Start Chatting" : "Login to Start"}
          </button>

          {!user && (
            <p className="text-sm text-gray-500 mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-700 font-semibold underline hover:text-purple-900">
                Sign up here
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-14 px-4 bg-white shadow-inner m-4 sm:m-6 rounded-2xl border border-purple-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-10">
          How it works
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            {
              title: "1. Create an Account",
              desc: "Sign up in seconds and verify your identity.",
            },
            {
              title: "2. Choose a User",
              desc: "See who's online and start a new conversation.",
            },
            {
              title: "3. Chat Instantly",
              desc: "Enjoy seamless and real-time messaging.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="bg-purple-50 p-6 rounded-2xl shadow-md border hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-purple-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-14 px-4 bg-white m-4 sm:m-6 rounded-2xl border border-purple-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-10">
          Why Choose TalkWave?
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "💬", label: "Real-Time Chat", desc: "Messages appear instantly with no delay." },
            { icon: "🔒", label: "Secure", desc: "Your chats are encrypted and protected." },
            { icon: "⚡", label: "Typing & Online Status", desc: "Know when someone's online or typing." },
            { icon: "📱", label: "Responsive", desc: "Works perfectly on mobile and desktop." },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-purple-100 p-6 rounded-2xl shadow-md hover:shadow-xl border transition-all duration-300"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="font-semibold text-purple-800 text-lg">{feature.label}</h4>
              <p className="text-sm text-gray-700 mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOT SECTION */}
      <section className="px-4 py-14 text-center bg-gradient-to-b from-white to-purple-50 rounded-t-3xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6">
          A clean and simple chat interface
        </h2>
        <img
          src={chatImg}
          alt="Chat Preview"
          className="w-full max-w-2xl mx-auto rounded-xl shadow-2xl border-2 border-purple-200 object-cover"
        />
      </section>
    </div>
  );
};

export default Home;
