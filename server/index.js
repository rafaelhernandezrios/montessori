import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import connectDB from "./config/db.js";
import app from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5001;

const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(404).send("Not found");
  });
});

async function start() {
  try {
    await connectDB();
  } catch {
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor local en http://localhost:${PORT}`);
    console.log(`   API health: http://localhost:${PORT}/api/health`);
  });
}

start();
