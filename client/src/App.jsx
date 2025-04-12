import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";

import { useAuth } from "./context/AuthContext";


function App() {
  const {user} = useAuth();

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/signin" replace />}
        />

      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
