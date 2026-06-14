import User from "./models/User.js";
import bcrypt from "bcrypt";
import connectToDatabase from "./db/connection.js";

const userRegister = async () => {
  // 1. Connect to the database first
  await connectToDatabase();

  try {
    const hashedPassword = await bcrypt.hash("ndiludulmon", 10);

    // CORRECTION: Use User.create() directly and await it.
    // Do NOT use 'new' and Do NOT use .save() later.
    const newUser = await User.create({
      name: "Nayyab Noor",
      email: "admin@example.com",
      password: hashedPassword,
      isActive: true,
      role: "admin",
    });

    console.log("Admin user seeded successfully:", newUser);
  } catch (error) {
    // Log the error and disconnect if connection logic is separate
    console.error("Error seeding user:", error);
  }
};

userRegister();
