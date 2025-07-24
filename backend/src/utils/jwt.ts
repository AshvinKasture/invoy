import jwt from "jsonwebtoken";

// You should put this in your environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: number;
  username: string;
  name: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
