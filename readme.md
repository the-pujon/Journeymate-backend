# Social Media Platform Backend

This is the backend for a travel community platform, built with Node.js, Express, and TypeScript. It provides a robust API for managing users, posts, comments, votes, and payments.

## [API URL](https://jouernymatebackendapi.vercel.app/api)

## Project Structure

The project follows a modular architecture:

```
|   app.ts
|   server.ts
|
\---app
    +---config
    |       index.ts
    |
    +---errors
    |       AppError.ts
    |       handleCastError.ts
    |       handleDuplicateError.ts
    |       handleValidationError.ts
    |       handleZodError.ts
    |
    +---interface
    |       error.ts
    |       index.d.ts
    |
    +---middlewares
    |       authorization.ts
    |       globalErrorHandler.ts
    |       notFoundRouteHandler.ts
    |       validateRequest.ts
    |
    +---modules
    |   +---auth
    |   |       auth.controller.ts
    |   |       auth.interface.ts
    |   |       auth.model.ts
    |   |       auth.route.ts
    |   |       auth.service.ts
    |   |       auth.utils.ts
    |   |       auth.validation.ts
    |   |
    |   +---comment
    |   |       comment.controller.ts
    |   |       comment.interface.ts
    |   |       comment.model.ts
    |   |       comment.route.ts
    |   |       comment.service.ts
    |   |       comment.utils.ts
    |   |       comment.validation.ts
    |   |
    |   +---payment
    |   |       payment.controller.ts
    |   |       payment.interface.ts
    |   |       payment.model.ts
    |   |       payment.route.ts
    |   |       payment.service.ts
    |   |       payment.utils.ts
    |   |       payment.validation.ts
    |   |
    |   +---post
    |   |       post.controller.ts
    |   |       post.interface.ts
    |   |       post.model.ts
    |   |       post.route.ts
    |   |       post.service.ts
    |   |       post.utils.ts
    |   |       post.validation.ts
    |   |
    |   +---user
    |   |       user.controller.ts
    |   |       user.interface.ts
    |   |       user.model.ts
    |   |       user.route.ts
    |   |       user.service.ts
    |   |       user.utils.ts
    |   |       user.validation.ts
    |   |
    |   \---vote
    |           vote.controller.ts
    |           vote.interface.ts
    |           vote.model.ts
    |           vote.route.ts
    |           vote.service.ts
    |           vote.validation.ts
    |
    +---routes
    |       index.ts
    |
    \---utils
            catchAsync.ts
            email.utils.ts
            noDataFoundResponse.ts
            sendResponse.ts
```

## Features

- User authentication and authorization
- Post creation, retrieval, updating, and deletion
- Commenting system
- Voting system for posts and comments
- User profile management
- Payment integration for user verification
- Error handling and validation

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## API Endpoints

### Auth

- POST `/api/auth/signup`: User registration
- POST `/api/auth/login`: User login
- POST `/api/auth/request-password-recovery`: Request password recovery
- POST `/api/auth/verify-recovery-code`: Verify recovery code
- POST `/api/auth/reset-password`: Reset password
- POST `/api/auth/change-password`: Change password (authenticated)

### Posts

- POST `/api/posts/create`: Create a new post
- GET `/api/posts`: Get all posts
- GET `/api/posts/user/:userId`: Get posts by user ID
- GET `/api/posts/:id`: Get a specific post
- PATCH `/api/posts/:id`: Update a post
- DELETE `/api/posts/:id`: Delete a post
- POST `/api/posts/:id/upvote`: Upvote a post
- POST `/api/posts/:id/downvote`: Downvote a post

### Users

- GET `/api/users`: Get all users
- GET `/api/users/:id`: Get a specific user
- PATCH `/api/users/:id`: Update user profile
- POST `/api/users/follow`: Follow a user
- POST `/api/users/unfollow`: Unfollow a user
- POST `/api/users/request-verification`: Request user verification

### Comments

- POST `/api/comments/create`: Create a new comment
- GET `/api/comments/post/:postId`: Get comments for a post
- PATCH `/api/comments/:commentId`: Edit a comment
- DELETE `/api/comments/:commentId`: Delete a comment
- POST `/api/comments/:commentId/vote`: Vote on a comment

### Votes

- GET `/api/votes/:postId`: Get vote status for a post

### Payments

- POST `/api/payments/create-payment`: Create a payment
- GET `/api/payments`: Get all payments
- DELETE `/api/payments/:id`: Delete a payment

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB (assumed, based on project structure)
- JSON Web Tokens (JWT) for authentication
