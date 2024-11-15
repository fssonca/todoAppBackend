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

  const { userId } = authResult;

  try {
    const params = {
      TableName: "Todos",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
