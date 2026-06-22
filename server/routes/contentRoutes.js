import express from "express";
import { services, quotes } from "../../shared/content.js";

const router = express.Router();

router.get("/services", (_req, res) => {
  res.json({ services, quotes });
});

export default router;
