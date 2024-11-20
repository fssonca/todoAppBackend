import { APIGatewayProxyHandler } from "aws-lambda";
import { authenticateAndParse } from "../services/authMiddleware";
import { headers } from "../utils/constants";
import { updateTodo, validateTodoOwnership } from "../services/dynamoService";

export const handler: APIGatewayProxyHandler = async (event) => {
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
  const { todoId } = event.pathParameters || {};

  if (!todoId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Todo ID is required" }),
    };
  }

  const updates = body;

  if (!updates || Object.keys(updates).length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "No updates provided" }),
    };
  }

  try {
    // Build the UpdateExpression, ExpressionAttributeValues, and ExpressionAttributeNames dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null) {
        const attributeKey = `#${key}`;
        const valueKey = `:${key}`;

        if (!expressionAttributeNames[attributeKey]) {
          updateExpressions.push(`${attributeKey} = ${valueKey}`);
          expressionAttributeValues[valueKey] = value;
          expressionAttributeNames[attributeKey] = key;
        }
      }
    }

    const UpdateExpression = "SET " + updateExpressions.join(", ");

    // Update the todo in DynamoDB
    const result = await updateTodo(
      todoId,
      userId,
      UpdateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Todo updated successfully",
        updatedTodo: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Failed to update todo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to update todo", error }),
    };
  }
};
