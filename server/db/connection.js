import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "lawease",
    });
    console.log("Connected to MongoDB database");
  } catch (error) {
    console.log("Database connection error:", error);
    throw error;
  }
};

export default connectToDatabase;
