import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { disputeRouter } from "./routes/disputeRoutes";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload middleware (multer)
const upload = multer({ dest: path.join(__dirname, "../uploads/") });
// Routes
app.use("/api/disputes", disputeRouter);

// Health check
app.get("/", (_req, res) => res.json({ status: "ok" }));

export { app, upload };
