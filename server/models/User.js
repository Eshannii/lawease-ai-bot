import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "user"],
  },
  chatHistory: {
    type: [
      {
        id: String,
        title: String,
        messages: [{ role: String, content: String }],
        createdAt: Date,
      },
    ],
    default: [],
    select: false,
  },
  createAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
