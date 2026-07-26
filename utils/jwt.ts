import jwt, { JwtPayload } from "jsonwebtoken";

const verifyToken = (token: string, secret: string): JwtPayload | null => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.log("Token verification failed:", error);
    return null;
  }
};

export const jwtUtils = {
  verifyToken,
};
