import AWS from "aws-sdk";
import {
  LOGIN_CODES_TABLE,
  TODOS_TABLE,
  USERS_TABLE,
} from "../utils/constants";
import { Todo } from "../types";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function saveLoginCode(
  userEmail: string,
  code: string,
  expirationTime: number
) {
  return dynamodb
    .put({
      TableName: LOGIN_CODES_TABLE,
      Item: { userEmail, code, expirationTime },
    })
    .promise();
}

export async function getLoginCode(userEmail: string) {
  return dynamodb
    .get({
      TableName: LOGIN_CODES_TABLE,
      Key: { userEmail },
    })
    .promise();
}

export async function getUserByEmail(email: string) {
  return dynamodb
    .get({
      TableName: USERS_TABLE,
      Key: { email },
    })
    .promise();
}

export async function createUser(user: {
  email: string;
  name: string;
  verified: boolean;
}) {
  return dynamodb
    .put({
      TableName: USERS_TABLE,
      Item: user,
    })
    .promise();
}

export async function updateUserVerification(email: string) {
  return dynamodb
    .update({
      TableName: USERS_TABLE,
      Key: { email },
      UpdateExpression: "set verified = :verified",
      ExpressionAttributeValues: {
        ":verified": true,
      },
    })
    .promise();
}

export function getAllTodos(userId: string) {
  const params = {
    TableName: TODOS_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  return dynamodb.query(params).promise();
}

export function createTodo(todo: Todo) {
  return dynamodb
    .put({
      TableName: TODOS_TABLE,
      Item: todo,
    })
    .promise();
}

export async function deleteLoginCode(userEmail: string) {
  return dynamodb
    .delete({
      TableName: LOGIN_CODES_TABLE,
      Key: { userEmail },
    })
    .promise();
}

export const validateTodoOwnership = async (
  userId: string,
  todoId: string
): Promise<{ isValid: boolean; todo?: any }> => {
  try {
    const result = await dynamodb
      .get({
        TableName: TODOS_TABLE,
        Key: { userId, todoId },
      })
      .promise();

    // Check if the item exists and the userId matches
    if (result.Item && result.Item.userId === userId) {
      return { isValid: true, todo: result.Item };
    }

    return { isValid: false };
  } catch (error) {
    console.error("Error validating todo ownership:", error);
    throw new Error("Error validating todo ownership");
  }
};

export function updateTodo(
  todoId: string,
  userId: string,
  UpdateExpression: string,
  expressionAttributeValues: { [key: string]: any },
  expressionAttributeNames: { [key: string]: string }
) {
  return dynamodb
    .update({
      TableName: TODOS_TABLE,
      Key: { userId, todoId },
      UpdateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    })
    .promise();
}

export function deleteTodo(userId: string, todoId: string) {
  return dynamodb
    .delete({
      TableName: "Todos",
      Key: {
        userId, // Partition key to ensure the user is authorized to delete the specific todo
        todoId, // Sort key
      },
    })
    .promise();
}
