import { APIGatewayProxyResult } from "aws-lambda";
import { sendLoginCode, validateLoginCode } from "../services/codeService";
import { headers } from "../utils/constants";

export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body);
  const { email, sixDigitCode } = body;

  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Email is required" }),
    };
  }

  if (sixDigitCode) {
    // Validate the six-digit code
    return await validateLoginCode(email, sixDigitCode);
  } else {
    // Send six-digit code to email
    return await sendLoginCode(email);
  }
};
