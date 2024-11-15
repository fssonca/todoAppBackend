import { APIGatewayProxyResult } from "aws-lambda";
import { sendLoginCode, validateLoginCode } from "../services/codeService";
import { headers } from "../utils/constants";
import { generateJWT } from "../services/authService";

export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body);
  const { email, sixDigitCode } = body;

  // DEMO ONLY - fallback mechanism - in case email service provider stops working
  const DUMMY_EMAIL = "demo@example.com";
  const DUMMY_CODE = "123456";

  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Email is required" }),
    };
  }

  // Check for dummy credentials
  if (email === DUMMY_EMAIL) {
    if (sixDigitCode === DUMMY_CODE) {
      const token = generateJWT(email);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "User verified successfully", token }),
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid code for demo email" }),
      };
    }
  }

  if (sixDigitCode) {
    // Validate the six-digit code
    return await validateLoginCode(email, sixDigitCode);
  } else {
    // Send six-digit code to email
    return await sendLoginCode(email);
  }
};
