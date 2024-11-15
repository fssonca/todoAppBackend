import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

interface JwtPayload {
  email: string;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export function generateJWT(email: string): string {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
}
