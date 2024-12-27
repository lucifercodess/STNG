import React, { useState } from "react";
import Scorpion from "../../assets/scorpion.png";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/utils/apiClient";
import { useUser } from "@/context/User.context";
import{ Spinner } from "../../components/Spinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  const validateLogin = () => {
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
  
  const login = async (e) => {
    e.preventDefault();
    if (validateLogin()) {
      setLoading(true);
      try {
        const res = await apiClient.post("/api/auth/login", { email, password },{
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
    <div className="h-screen bg-gradient-to-r from-gray-500 to-blue-200 flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-12 shadow-lg rounded-lg w-full sm:w-96 md:w-96">
        <div className="flex justify-center mb-6 items-center gap-2">
          <h1 className="text-center text-4xl">STNG</h1>
          <img src={Scorpion} alt="Scorpion logo" className="w-16 h-16" />
        </div>
        <form onSubmit={login}>
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
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              placeholder="Enter your password"
            />
          </div>

          <span className="text-sm mt-3 block text-center text-gray-600">
            Don't have an Account? 
            <Link to="/register" className="text-black font-bold underline">Register</Link>
          </span>

          <div className="mt-6 flex justify-center">
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-extrabold py-3 px-6 rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transform transition-all duration-300 ease-in-out focus:ring-4 focus:ring-blue-300 focus:outline-none flex justify-center items-center"
            >
              {loading ? <Spinner /> : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
