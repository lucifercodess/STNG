import React, { useEffect, useState } from "react";
import { MdAddLink, MdPerson2 } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/utils/apiClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Rings } from "react-loader-spinner";
import { useUser } from "@/context/User.context";
import { LogOut } from "lucide-react";

const pageTransition = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.5 },
};

const Home = () => {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, projects, setProjects } = useUser();

  // Fetch projects on component mount (Only once)
  useEffect(() => {
    const getProjects = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/api/user/all", {
          withCredentials: true,
        });
        if (res.status === 200) {
          // Update projects only if they are different
          if (res.data.projects.length !== projects.length) {
            setProjects(res.data.projects); // Avoid redundant updates
          }
        }
      } catch (error) {
        toast({
          type: "error",
          title: "Error",
          description: "Error in fetching projects",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };
    getProjects();
  }, [projects.length]);

  function validateCreateProject() {
    if (!name) {
      toast({
        type: "error",
        title: "Error",
        description: "Project name is required",
      });
      return false;
    }
    return true;
  }

  async function createProject() {
    if (validateCreateProject()) {
      setLoading(true);
      try {
        const res = await apiClient.post(
          "api/user/create-project",
          { name },
          { withCredentials: true }
        );
        if (res.status === 201) {
          toast({
            type: "success",
            title: "Success",
            description: "Project created successfully",
            duration: 2000,
          });
          setProjects(prev => [...prev, res.data.project]); 
          setModal(false);
          setName("");
        }
      } catch (error) {
        toast({
          type: "error",
          title: "Error",
          description: error.response.data?.message,
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    }
  }

  const handleLogout = async () => {
    try {
      const res = await apiClient.post("/api/auth/logout", { withCredentials: true });
      if (res.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
        toast({
          type: "success",
          title: "Success",
          description: "Logged out successfully",
          duration: 2000,
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        type: "error",
        title: "Error",
        description: error.response.data?.message,
        duration: 2000,
      });
    }
  };

  return (
    <motion.main className="bg-gray-900 min-h-screen p-6 text-white" {...pageTransition}>
      <div className="flex flex-col sm:flex-row sm:gap-6 items-start gap-4">
        <div className="flex items-center gap-3 justify-between">
          <div
            className="flex gap-3 items-center bg-gradient-to-r from-purple-600 to-blue-500 p-4 rounded-lg shadow-lg transform hover:scale-105 duration-300 cursor-pointer"
            onClick={() => setModal(true)}
          >
            <h1 className="text-lg font-bold hidden sm:block">New Project</h1>
            <MdAddLink size={32} className="text-white" />
          </div>
          <div className="flex items-center justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <LogOut onClick={handleLogout} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center">
              <Rings height="80" width="80" color="purple" ariaLabel="loading" />
            </div>
          ) : (
            projects.map((p, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 p-6 rounded-lg mt-4 shadow-md transform hover:scale-105 duration-300 cursor-pointer"
                onClick={() =>
                  navigate(`/project`, {
                    state: { p },
                  })
                }
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-xl font-semibold mb-2 text-purple-400">{p.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MdPerson2 />
                  <p>Collaborators: {p.users.length}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <Dialog open={modal} onOpenChange={setModal}>
          <DialogContent className="bg-gray-800 rounded-lg shadow-xl text-white p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-400">
                Create New Project
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the details of your new project below.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-400"
              >
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 outline-none block w-full px-4 py-2 rounded-md bg-gray-700 text-gray-200 focus:ring-2 focus:ring-purple-500 border-none"
                placeholder="Enter project name"
              />
            </div>
            <div className="mt-6 flex items-center justify-end space-x-4">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                {loading ? (
                  <Rings height="20" width="20" color="white" ariaLabel="loading" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.main>
  );
};

export default Home;
