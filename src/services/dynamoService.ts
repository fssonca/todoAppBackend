import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const LOGIN_CODES_TABLE = "LoginCodes";

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

export async function deleteLoginCode(userEmail: string) {
  return dynamodb
    .delete({
      TableName: LOGIN_CODES_TABLE,
      Key: { userEmail },
    })
    .promise();
}
