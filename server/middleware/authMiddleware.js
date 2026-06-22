import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) {
    return res.status(401).json({ message: "Acceso denegado, token requerido" });
  }
  try {
    const token = header.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Tu cuenta está inactiva." });
    }
    req.userId = user._id.toString();
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};
