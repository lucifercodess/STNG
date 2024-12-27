import React, { useState, useEffect } from "react";
import Scorpion from "../../assets/scorpion.png";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/User.context";
import { Spinner } from "../../components/Spinner"; 

const Register = () => {
  const [typedText, setTypedText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();
  const navigate = useNavigate();
  
  const welcomeMessages = [
    "Welcome to STNG",
    "Register now and",
    "Chat with Friends and AI",
    "Get Code Assist",
  ];

  const validateRegister = () => {
    if (!email || !password) {
      toast({
        type: "error",
        title: "Error",
        description: "Please provide email and password",
        duration: 2000,
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (charIndex < welcomeMessages[messageIndex].length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + welcomeMessages[messageIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timeout);
    } else if (messageIndex < welcomeMessages.length - 1) {
      const timeout = setTimeout(() => {
        setTypedText("");
        setCharIndex(0);
        setMessageIndex((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, messageIndex, welcomeMessages]);

  const register = async (e) => {
    e.preventDefault();
    if (validateRegister()) {
      setLoading(true);
      try {
        const res = await apiClient.post("/api/auth/register", { email, password },{
          withCredentials: true,
        });
        if (res.data.code === 1) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          setUser(res.data.user);
          toast({
            type: "success",
            title: "Success",
            description: res.data.message,
            duration: 2000,
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          type: "error",
          title: "Error",
          description: error.response?.data?.message || "Something went wrong",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-r from-gray-500 to-blue-200 flex flex-col items-center justify-center px-4">
      <div className="w-full text-center mb-6">
        <h1 className="text-4xl font-extrabold text-white tracking-wider">
          {typedText}
        </h1>
      </div>

      <div className="bg-white p-8 md:p-12 shadow-lg rounded-lg w-full sm:w-96 md:w-96">
        <form onSubmit={register}>
          <div className="flex flex-col gap-6">
            <label className="text-lg text-gray-700 font-semibold">Email Address:</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              placeholder="Enter your email address"
            />
          </div>
          <div className="flex flex-col mt-4 gap-6">
            <label className="text-lg text-gray-700 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              placeholder="Enter your password"
            />
          </div>

          <span className="text-sm mt-3 block text-center text-gray-600">
            Already have an Account? 
            <Link to="/login" className="text-black font-bold underline">Login</Link>
          </span>

          <div className="mt-6 flex justify-center">
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-extrabold py-3 px-6 rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transform transition-all duration-300 ease-in-out focus:ring-4 focus:ring-blue-300 focus:outline-none flex justify-center items-center"
            >
              {loading ? <Spinner /> : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
