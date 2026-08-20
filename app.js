import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import chatRouter from "./routes/chatRouter.js";
import adminRouter from "./routes/adminRouter.js";

dotenv.config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token) {
    token = token.replace("Bearer ", "");

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Invalid tokens are ignored here; protected routes still enforce auth.
    }
  }

  next();
});

/* ---------- ROUTES ---------- */
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRouter);
app.use("/uploads", express.static("uploads"));

export default app;
