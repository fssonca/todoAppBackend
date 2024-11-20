import { v4 as uuidv4 } from "uuid";
import { authenticateAndParse } from "../services/authMiddleware";
import { headers } from "../utils/constants";
import { createTodo } from "../services/dynamoService";
import { Todo } from "../types";

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
  const { name, description, priority, dueDate } = body;

  const todo: Todo = {
    userId,
    todoId: uuidv4(),
    name,
    description,
    priority,
    dueDate,
    completed: false,
  };

  try {
    await createTodo(todo);
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(todo),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
