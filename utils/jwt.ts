import jwt, { JwtPayload } from "jsonwebtoken";

type VerifyResult =
  | { success: true; data: JwtPayload }
  | { success: false; data: null };

const verifyToken = (token: string, secret: string): VerifyResult => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return { success: true, data: decoded };
  } catch {
    return { success: false, data: null };
  }
};

export const jwtUtils = {
  verifyToken,
};
