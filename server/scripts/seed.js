import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Availability from "../models/Availability.js";
import connectDB from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seed() {
  await connectDB();
  const adminEmail = process.env.ADMIN_EMAIL || "adriana@ejemplo.com";
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", salt);
    await User.create({
      name: process.env.ADMIN_NAME || "Adriana Villalobos",
      email: adminEmail,
      password,
      role: "admin",
      isActive: true,
    });
    console.log("Admin creado:", adminEmail);
  } else {
    console.log("Admin ya existe:", adminEmail);
  }
  const avail = await Availability.findOne();
  if (!avail) {
    await Availability.create({});
    console.log("Disponibilidad inicial creada");
  }
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
