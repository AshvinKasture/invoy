import bcrypt from "bcrypt";
import { Request, Response } from "express";
import db from "../db/database";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { generateToken } from "../utils/jwt";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await db
    .selectFrom("users")
    .select(["id", "name", "password"])
    .where("username", "=", username)
    .executeTakeFirst();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    username: username,
    name: user.name,
  });

  // If login is successful, return token
  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      username: username,
    },
  });
});
