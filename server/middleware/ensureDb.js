import connectDB from "../config/db.js";

export async function ensureDb(_req, res, next) {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB middleware error:", error.message);
    res.status(503).json({
      message: "La base de datos no está disponible. Revisa MONGO_URI en Vercel.",
      db: "disconnected",
    });
  }
}
