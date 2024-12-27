import { io } from "socket.io-client";

let socketInstance = null;

export const initSocket = (projectId) => {
  socketInstance = io("http://localhost:3000", {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });
  return socketInstance;
};

export const recieveMessage = (event, callback) => {
  socketInstance.on(event, callback);
};

export const sendMessage = (event, data) => {
  socketInstance.emit(event, data);
};
