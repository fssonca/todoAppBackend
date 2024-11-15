import { decodeToken } from "./authService";

export async function authenticateAndParse(
  event: any
): Promise<{ userId: string; body: any } | null> {
  const authHeader = event.headers.Authorization || event.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  // Extract the token by removing "Bearer " prefix
  const token = authHeader.split(" ")[1];

  // Decode JWT and get userId
  const decodedToken = decodeToken(token);
  if (!decodedToken) {
    return null;
  }

  const userId = decodedToken.email; // userId is the email in the payload
  const body = event.body ? JSON.parse(event.body) : null;

  return { userId, body };
}
