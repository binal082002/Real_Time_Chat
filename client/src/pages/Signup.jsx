import { useState } from "react";
import signin_validation from "../Validations/signin.validation";
import { AuthService } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let error = signin_validation({ email, password });

    if (error && Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await signup(email, password);
      toast.success("Account created successfully");
      navigate("/");
    } catch (error) {
      toast.warn(error.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-purple-100 to-white">
      <div className="bg-white text-black p-8 rounded-lg shadow-2xl w-[30%]">
        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-800">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-2 p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors?.email && (<p className="text-sm text-red-500 -mt-3">{errors.email}</p>)}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-2 p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors?.password && (<p className="text-sm text-red-500 -mt-3">{errors.password}</p>)}

          <div className="text-center text-sm text-gray-700">Already have an account? <a href="/signin" className="text-purple-600 underline">Sign In</a></div>

          <div>
            <button type="submit" className="text-lg w-full py-2 px-4 mt-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
