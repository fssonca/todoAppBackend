import { validateLoginCode } from "../services/codeService";
import { generateJWT } from "../services/authService";
import { headers } from "../utils/constants";
import { updateUserVerification } from "../services/dynamoService";

export const handler = async (event: any): Promise<any> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const { email, code } = body;

  if (!email || !code) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Email and code are required" }),
    };
  }

  // Step 1: Validate the code
  const validationResponse = await validateLoginCode(email, code);
  if (validationResponse.statusCode !== 200) {
    return validationResponse; // If code validation fails, return the response with error
  }

  try {
    // Step 2: Update the user to set `verified` as true
    await updateUserVerification(email);

    // Step 3: Generate JWT for the user after successful verification
    const token = generateJWT(email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "User verified successfully", token }),
    };
  } catch (error) {
    console.error("Error verifying user:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
