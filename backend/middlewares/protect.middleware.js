import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const decoded = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 0, message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ code: 0, message: "Invalid token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ code: 0, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in decoded middleware:", error);
    return res.status(401).json({ code: 0, message: "Error in decoded" });
  }
};
