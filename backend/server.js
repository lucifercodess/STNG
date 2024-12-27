import app from "./index.js";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getCookie } from "./utils/getCookie.js";
import Project from "./models/project.model.js";
import winston from "winston";
import { genResult } from "./config/gemini.config.js";
dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// Middleware for authentication and project validation
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.query.token ||
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization &&
        socket.handshake.headers.authorization?.split(" ")[1]);

    const projectId = socket.handshake.query.projectId;

    if (!projectId) {
      logger.warn("Project ID not provided");
      return next(new Error("Project ID not provided"));
    }

    socket.project = await Project.findById(projectId);
    if (!socket.project) {
      logger.warn(`Invalid Project ID: ${projectId}`);
      return next(new Error("Invalid Project ID"));
    }

    if (!token) {
      logger.warn("Token not provided");
      return next(new Error("Token not provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      logger.warn("Invalid token");
      return next(new Error("Invalid token"));
    }

    socket.user = decoded;
    logger.info(`User connected: ${socket.user.email}, Project: ${projectId}`);
    next();
  } catch (error) {
    logger.error("Socket authentication error", { error });
    next(error);
  }
});

// Handle socket events
io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  socket.join(socket.roomId);

  logger.info(`User joined room: ${socket.roomId}`, {
    user: socket.user.email,
  });


  // Handle incoming project messages
  socket.on("project-message", async (data) => {
    try {
      const message = data.message;
      const aiPresent = message.includes("@ai");

      if (aiPresent) {
        const prompt = message.replace("@ai", "").trim();
        if (!prompt) {
          io.to(socket.roomId).emit("project-message", {
            message: "Please provide a valid prompt for AI.",
            sender: { _id: "ai", name: "AI", email: "ai@example.com" },
          });
          return;
        }

        const result = await genResult(prompt);
        io.to(socket.roomId).emit("project-message", {
          message: result,
          sender: { _id: "ai", name: "AI", email: "ai@example.com" },
        });
      } else {
        logger.info("Message received", {
          user: socket.user.email,
          room: socket.roomId,
          message: data.message,
        });

       
        socket.broadcast.to(socket.roomId).emit("project-message", data);
      }
    } catch (error) {
      logger.error("Error handling project message", { error });
      socket.emit("project-message", {
        message: "An error occurred while processing your message.",
        sender: { _id: "system", name: "System", email: "system@example.com" },
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.user.email}`, {
      room: socket.roomId,
    });

    // Notify other users if needed
    socket.broadcast
      .to(socket.roomId)
      .emit("user-disconnected", { userId: socket.user._id });
  });

  // Placeholder for additional events
  socket.on("event", (data) => {
    logger.debug("Custom event triggered", { event: "event", data });
  });
});

// Start server
server.listen(process.env.PORT, async () => {
  try {
    await connectDB();
    logger.info(`Server running on port ${process.env.PORT}`);
  } catch (error) {
    logger.error("Error connecting to the database", { error });
    process.exit(1);
  }
});
