# LambdaTodoApp

A serverless Todo application backend built with AWS Lambda, Serverless Framework, and DynamoDB. This application supports user registration, login with email verification, JWT authentication, and CRUD operations for managing todos.

## Features

- **User Registration**: Users can register using their email, which receives a verification code for authentication.
- **Email Verification**: Sends a six-digit verification code via EmailJS.
- **JWT Authentication**: After email verification, users receive a JWT for authorization in further requests.
- **Todo Management**: Users can create, view, complete, and delete todo items. Each todo has a name, description, priority, due date, and completion status.
- **Serverless**: Fully serverless application using AWS Lambda, DynamoDB, and Serverless Framework.

## Tech Stack

- **AWS Lambda** - For serverless functions
- **AWS DynamoDB** - Database to store user, login code, and todo information
- **EmailJS** - To send verification codes to user email addresses
- **JWT** - For secure user authentication and authorization
- **Serverless Framework** - To deploy and manage AWS resources
- **TypeScript** - For type safety and maintainability

## Project Structure

```
.
├── src
│   ├── handlers             # Lambda function handlers
│   │   ├── createTodo.ts
│   │   ├── deleteTodo.ts
│   │   ├── getAllTodos.ts
│   │   ├── completeTodo.ts
│   │   ├── registerUser.ts
│   │   ├── userLogin.ts
│   │   └── verifyEmail.ts
│   ├── services             # Business logic and helper functions
│   │   ├── authMiddleware.ts
│   │   ├── authService.ts
│   │   ├── codeService.ts
│   │   └── smtpService.ts
│   └── utils                # Utility functions and constants
├── serverless.yml           # Serverless configuration file
└── package.json             # Node.js dependencies and scripts
```

## Prerequisites

- **Node.js** (v14 or higher)
- **Serverless Framework** installed globally:
  ```bash
  npm install -g serverless
  ```
- AWS CLI configured with sufficient permissions to deploy Lambda functions and manage DynamoDB tables.

## Environment Variables

Create a `.env` file in the root directory with the following environment variables:

```plaintext
JWT_SECRET=your_jwt_secret
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile TypeScript**:
   ```bash
   npm run build
   ```

3. **Deploy the application**:
   ```bash
   serverless deploy
   ```

   This will deploy the Lambda functions, configure API Gateway routes, and create necessary DynamoDB tables (`Users`, `Todos`, and `LoginCodes`).

## API Endpoints

| Function       | Path              | Method | Description                                  |
| -------------- | ----------------- | ------ | -------------------------------------------- |
| Register User  | `/register-user`  | POST   | Registers a new user with email              |
| Login User     | `/login`          | POST   | Initiates login by sending a code to email   |
| Verify Code    | `/verify-email`   | POST   | Verifies the login code and returns a JWT    |
| Get Todos      | `/todos`          | GET    | Retrieves all todos for an authenticated user |
| Create Todo    | `/todos`          | POST   | Creates a new todo                           |
| Complete Todo  | `/todos/complete` | POST   | Marks a todo as complete                     |
| Delete Todo    | `/todos`          | DELETE | Deletes a specified todo                     |

## Authentication Workflow

1. **User Registration**: Users initiate login by providing their email. A verification code is sent via EmailJS.
2. **Email Verification**: The user submits the verification code. If valid, a JWT is issued.
3. **JWT Authorization**: The JWT is used to authorize requests for creating, viewing, completing, and deleting todos.

## Key Files and Functions

### `serverless.yml`

This file configures the Serverless Framework, defining the provider, environment variables, IAM permissions, and the Lambda functions.

- **IAM Role Permissions**:
  - **DynamoDB**: Permissions to read and write to the `Users`, `Todos`, and `LoginCodes` tables.
  - **SES**: Permission to send emails using Amazon SES (optional, since EmailJS is used here).

### `src/handlers/*.ts`

Each file in the `handlers` folder is a Lambda function handler for specific API endpoints. For example:
- **createTodo.ts**: Handles the creation of a new todo item.
- **userLogin.ts**: Sends a login code to the user's email or validates an entered code.
- **verifyEmail.ts**: Verifies the email code and issues a JWT if successful.

### `src/services/authMiddleware.ts`

A middleware function to authenticate incoming requests by decoding the JWT and extracting the user’s email. This middleware is used to secure todo-related endpoints.

### `src/services/smtpService.ts`

A service to send emails using EmailJS. It is used to send the six-digit login code to users' email addresses.

## Example Requests

### Register User (POST `/register-user`)

```json
{
  "email": "user@example.com"
}
```

### Login User (POST `/login`)

- **Request to send code**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Request to verify code**:
  ```json
  {
    "email": "user@example.com",
    "sixDigitCode": "123456"
  }
  ```

### Create Todo (POST `/todos`)

Headers: `Authorization: Bearer <JWT_TOKEN>`

```json
{
  "name": "Sample Task",
  "description": "This is a sample task",
  "priority": 3,
  "dueDate": "2024-12-31"
}
```

### Complete Todo (POST `/todos/complete`)

Headers: `Authorization: Bearer <JWT_TOKEN>`

```json
{
  "todoId": "unique-todo-id"
}
```

### Delete Todo (DELETE `/todos`)

Headers: `Authorization: Bearer <JWT_TOKEN>`

```json
{
  "todoId": "unique-todo-id"
}
```

## Local Testing

To test the functions locally, you can use the Serverless framework's offline capabilities or invoke functions directly with sample payloads.

### Invoke a Function Locally

For example, to test `createTodo`:

```bash
serverless invoke local -f createTodo -p path/to/sample-event.json
```

## Deployment

To update the deployed Lambda functions, run:

```bash
serverless deploy
```

## License

This project is licensed under the MIT License.
