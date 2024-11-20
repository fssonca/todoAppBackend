import AWS from "aws-sdk";
import { authenticateAndParse } from "../services/authMiddleware";
import { headers } from "../utils/constants";
import { validateTodoOwnership } from "../services/dynamoService";

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
  const { todoId, completed } = body;

  if (!todoId || completed === undefined) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Todo ID and completed status are required",
      }),
    };
  }

  try {
    const ownershipValidation = await validateTodoOwnership(userId, todoId);

    if (!ownershipValidation.isValid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: "Forbidden: Access denied" }),
      };
    }

    // Update the completed status dynamically based on the provided value
    await dynamodb
      .update({
        TableName: "Todos",
        Key: { userId, todoId },
        UpdateExpression: "set completed = :completed",
        ExpressionAttributeValues: {
          ":completed": completed,
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Todo marked as ${completed ? "complete" : "incomplete"}`,
      }),
    };
  } catch (error) {
    console.error("Error updating todo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
