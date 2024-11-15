import AWS from "aws-sdk";
import { authenticateAndParse } from "../services/authMiddleware";
import { headers } from "../utils/constants";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
  const authResult = await authenticateAndParse(event);
  if (!authResult) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: "Unauthorized: Invalid or missing token",
      }),
    };
  }

  const { userId, body } = authResult;
  const { todoId } = body;

  if (!todoId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Todo ID is required" }),
    };
  }

  try {
    await dynamodb
      .delete({
        TableName: "Todos",
        Key: {
          userId, // Partition key to ensure the user is authorized to delete the specific todo
          todoId, // Sort key
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Todo deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
