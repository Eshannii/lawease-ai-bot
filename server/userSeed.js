import crypto from "crypto";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import connectToDatabase from "./db/connection.js";

const userRegister = async () => {
  try {
    await connectToDatabase();

    const hashedPassword = await bcrypt.hash("ndiludulmon", 10);
    const encryptionSalt = crypto.randomBytes(16).toString("hex");

    const newUser = await User.create({
      name: "Nayyab Noor",
      email: "admin@example.com",
      password: hashedPassword,
      encryptionSalt,
      role: "admin",
    });

    console.log("Admin user seeded successfully:", newUser);
  } catch (error) {
    console.error("Error seeding user:", error);
  } finally {
    process.exit();
  }
};

userRegister();
