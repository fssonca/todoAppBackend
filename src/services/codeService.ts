import { headers } from "../utils/constants";
import { saveLoginCode, getLoginCode, deleteLoginCode } from "./dynamoService";
import { sendEmail } from "./smtpService";

export async function sendLoginCode(email: string): Promise<any> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes from now

  await sendEmail(email, code);
  await saveLoginCode(email, code, expirationTime);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: "Verification code sent" }),
  };
}

export async function validateLoginCode(
  email: string,
  code: string
): Promise<any> {
  const result = await getLoginCode(email);
  const storedCodeData = result.Item;

  if (!storedCodeData || storedCodeData.code !== code) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid or expired code" }),
    };
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (storedCodeData.expirationTime < currentTime) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Code expired" }),
    };
  }

  await deleteLoginCode(email); // Remove code after successful validation
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: "Code validated" }),
  };
}
