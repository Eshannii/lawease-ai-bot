import express from "express";
import cors from "cors";
import connectToDatabase from "./db/connection.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import { chatbotRoutes } from "./routes/chat.js";
import { chatHistoryRoutes } from "./routes/chatHistory.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/chat-history", chatHistoryRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDatabase();
});
