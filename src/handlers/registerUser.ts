import { sendLoginCode } from "../services/codeService";
import { headers } from "../utils/constants";
import { getUserByEmail, createUser } from "../services/dynamoService";

export const handler = async (event: any): Promise<any> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const { email, name } = body;

  if (!email || !name) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Email and name are required" }),
    };
  }

  try {
    // Check if the user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser.Item) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }

    await sendLoginCode(email);

    // Create the user with `verified: false`
    const user = { email, name, verified: false };

    await createUser(user);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "User created. Verification code is being sent to email.",
      }),
    };
  } catch (error) {
    console.error("Error in user registration:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
