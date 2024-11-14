import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE!;
const TODOS_TABLE = process.env.TODOS_TABLE!;

export const createUser: APIGatewayProxyHandler = async (event) => {
  const { email, name } = JSON.parse(event.body || "{}");

  if (!email || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email and name are required" }),
    };
  }

  const params = {
    TableName: USERS_TABLE,
    Item: { email, name },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User created successfully" }),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create user" }),
    };
  }
};
