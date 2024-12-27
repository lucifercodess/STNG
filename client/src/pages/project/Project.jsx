import React, { useEffect, useRef, useState } from "react";
import { MdAdd, MdClose, MdPeople } from "react-icons/md";
import { BsSendArrowUpFill } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import Markdown from "markdown-to-jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/utils/apiClient";
import { toast } from "@/hooks/use-toast";
import { initSocket, recieveMessage, sendMessage } from "@/utils/socket";
import { useUser } from "@/context/User.context";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Project = () => {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [showPeopleBox, setShowPeopleBox] = useState(false);
  const [modal, setModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const [selected, setSelected] = useState(null);
  const [fileTree, setFileTree] = useState({
    "app.js": "const express = require('express');",
    "index.js": "app.get('/', (req, res) => {...});",
    "routes/auth.js": "exports.login = async (req, res) => {...};",
  });
  const [currentFile, setCurrentFile] = useState(null);
  const [bgColor, setBgColor] = useState("bg-white");

  const messagesEndRef = useRef(null);
  const [openFiles, setOpenFiles] = useState([]);

  useEffect(() => {
    const socket = initSocket(location.state.p._id);
    recieveMessage("project-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    async function getAllUsers() {
      try {
        const res = await apiClient.get("/api/auth/get-all", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.error(error);
        toast({
          type: "error",
          title: "Error",
          description: "Error fetching users.",
          duration: 2000,
        });
      }
    }
    getAllUsers();

    return () => {
      socket.disconnect();
    };
  }, [location.state.p._id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = () => {
    if (input.trim() === "") return;

    const messageData = {
      message: input,
      sender: user.email,
    };

    sendMessage("project-message", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setInput("");
  };

  const handleAddCollaborator = async (userId) => {
    try {
      const res = await apiClient.put(
        `/api/user/add-user/${location.state.p._id}`,
        { userToAdd: userId },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast({
          type: "success",
          title: "Success",
          description: "User added successfully.",
          duration: 2000,
        });

        const addedUser = users.find((user) => user._id === userId);
        if (addedUser) {
          location.state.p.users.push(addedUser);
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user._id !== userId)
          );
        }
        setModal(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        title: "Error",
        description: error.response?.data?.message || "Failed to add user.",
        duration: 2000,
      });
    }
  };

  const togglePeopleBox = () => {
    setShowPeopleBox(!showPeopleBox);
  };

  const handleFileClick = (file) => {
    setCurrentFile(file);
    setSelected(file);
    setOpenFiles([...new Set([...openFiles, file])]);
    setBgColor("bg-blue-50");
  };

  return (
    <main className={`min-h-screen w-full flex flex-col sm:flex-row ${bgColor}`}>
      {/* Left Sidebar Section */}
      <section className="w-full sm:w-[35%] xl:w-[30%] bg-gradient-to-r from-purple-600 to-blue-500 flex flex-col h-screen shadow-lg">
        <header className="flex justify-between py-3 px-5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-tl-xl items-center">
          <button
            className="p-2 shadow-amber-300 shadow-sm rounded-lg hover:translate-y-1 hover:shadow-amber-300 hover:shadow-md duration-700"
            onClick={() => setModal(true)}
          >
            Add Collab +
          </button>
          <button
            onClick={togglePeopleBox}
            className="p-2 rounded-full hover:bg-purple-400 transition ease-in-out"
          >
            <MdPeople size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 bg-gradient-to-r from-purple-100 to-blue-100 flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg shadow ${
                msg.sender._id === "ai"
                  ? "bg-gray-800 text-white"
                  : msg.sender === user.email
                  ? "bg-blue-300 self-end"
                  : "bg-gray-200 self-start"
              }`}
            >
              <strong>{msg.sender._id === "ai" ? "AI" : msg.sender} : </strong>
              <Markdown
                options={{
                  overrides: {
                    code: {
                      component: ({ children }) => (
                        <SyntaxHighlighter
                          language="jsx"
                          style={docco}
                          showLineNumbers
                          customStyle={{
                            borderRadius: "8px",
                            padding: "12px",
                            backgroundColor: "#f7f7f7",
                            margin: "0",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {children}
                        </SyntaxHighlighter>
                      ),
                    },
                  },
                }}
              >
                {msg.message}
              </Markdown>
            </div>
          ))}
          {isLoading && (
            <div className="p-3 rounded-lg bg-gray-100 self-start">
              <p>
                <em>AI is typing...</em>
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 bg-white shadow-md border-t flex items-center space-x-2">
          <input
            type="text"
            placeholder="start with @ai to chat with AI"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="p-3 outline-none border rounded-lg w-full mr-2 text-gray-800 focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={send}
            className="p-3 rounded-full bg-purple-500 text-white hover:scale-110"
          >
            <BsSendArrowUpFill size={30} />
          </button>
        </div>
      </section>

      {/* Right Content Section */}
      <section className="bg-red-50 flex-grow min-h-screen sm:w-[65%] lg:w-[70%] flex">
        <div className="h-full w-[25%] min-w-52 max-w-64 border bg-gray-300">
          <div className="tree border">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                className={`tree-element cursor-pointer p-2 px-3 py-2 flex items-center gap-2 bg-slate-200 w-full border-b hover:bg-slate-100 ${
                  selected === file ? "bg-slate-100" : ""
                }`}
                onClick={() => handleFileClick(file)}
              >
                <p>{file}</p>
              </button>
            ))}
          </div>
        </div>
        {currentFile && fileTree[currentFile] !== undefined && (
          <div className="code-editor flex flex-grow flex-col h-full">
            <div className="top flex gap-2 p-2 bg-gray-100 border-b">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 items-center gap-2 w-fit bg-slate-200 border rounded-md hover:bg-slate-100 ${
                    currentFile === file ? "font-bold" : ""
                  }`}
                >
                  {file}
                </button>
              ))}
            </div>
            <div className="bottom h-full flex flex-grow">
              <textarea
                value={fileTree[currentFile]}
                onChange={(e) =>
                  setFileTree({
                    ...fileTree,
                    [currentFile]: e.target.value,
                  })
                }
                className="w-full h-full p-4"
              />
            </div>
          </div>
        )}
      </section>

      {/* Collaborator Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[250px] bg-white shadow-lg z-50 p-4 transition-transform ${
          showPeopleBox ? "translate-x-0" : "-translate-x-full"
        } sm:w-[300px] rounded-tr-3xl`}
      >
        <h2 className="text-2xl font-semibold text-purple-600 mb-4">
          Collaborators
        </h2>
        <ul className="text-black space-y-3">
          {location.state.p.users.map((user, index) => (
            <li
              key={index}
              className="p-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300"
            >
              {user.email}
            </li>
          ))}
        </ul>
        <button
          onClick={togglePeopleBox}
          className="absolute top-3 right-3 p-1 px-3 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          X
        </button>
      </div>

      {/* Modal for adding collaborators */}
      {modal && (
        <Dialog open={modal} onOpenChange={setModal}>
          <DialogContent className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold text-purple-600">
                Add Collaborators
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-2">
                Add new collaborators to your project by selecting from the list
                below.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-3">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow hover:bg-gray-200"
                  >
                    <span className="text-gray-800">{user.email}</span>
                    <button
                      className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                      onClick={() => handleAddCollaborator(user._id)}
                    >
                      <MdAdd size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No users available.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
};

export default Project;
