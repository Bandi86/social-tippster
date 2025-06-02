# Comments Module

The Comments module provides a comprehensive API for managing user comments, including creating, listing, updating, and deleting comments. It also supports nested replies, upvoting/downvoting, and comment moderation features.

## Features

- Create, read, update, delete (CRUD) operations for comments
- Nested replies support (hierarchical comments)
- Upvoting and downvoting comments
- Comment reporting system
- Admin moderation (flagging inappropriate comments)
- Pagination and sorting

## API Endpoints

### Create Comment
- **POST /comments**
- **Auth:** JWT required
- **Description:** Create a new comment or reply to an existing comment
- **Request Body:**
  ```json
  {
    "content": "This is my comment",
    "postId": "uuid-of-post",
    "parentCommentId": "uuid-of-parent-comment" // Optional, for replies
  }
  ```
- **Response:** 201 Created with CommentResponseDto

### Get Comments
- **GET /comments**
- **Auth:** None
- **Description:** Get paginated comments with optional filtering
- **Query Params:**
  - postId (optional): Filter by post ID
  - parentCommentId (optional): Filter by parent comment ID
  - page (optional): Page number (default: 1)
  - limit (optional): Items per page (default: 10)
  - sortBy (optional): Sort field (default: createdAt)
  - sortOrder (optional): Sort order: asc or desc (default: desc)
- **Response:** 200 OK with paginated comments

### Get Comment By ID
- **GET /comments/:id**
- **Auth:** None
- **Description:** Get a specific comment by ID
- **Response:** 200 OK with CommentResponseDto

### Get Comment Replies
- **GET /comments/:id/replies**
- **Auth:** None
- **Description:** Get all replies to a specific comment
- **Query Params:** Same as Get Comments
- **Response:** 200 OK with paginated comments

### Update Comment
- **PATCH /comments/:id**
- **Auth:** JWT required (author only)
- **Description:** Update a comment's content
- **Request Body:**
  ```json
  {
    "content": "Updated comment content"
  }
  ```
- **Response:** 200 OK with CommentResponseDto

### Delete Comment
- **DELETE /comments/:id**
- **Auth:** JWT required (author or admin only)
- **Description:** Delete a comment
- **Response:** 204 No Content

### Vote on Comment
- **POST /comments/:id/vote**
- **Auth:** JWT required
- **Description:** Upvote or downvote a comment
- **Request Body:**
  ```json
  {
    "value": 1 // 1 for upvote, -1 for downvote
  }
  ```
- **Response:** 200 OK with CommentResponseDto

### Report Comment
- **POST /comments/:id/report**
- **Auth:** JWT required
- **Description:** Report a comment for inappropriate content
- **Request Body:**
  ```json
  {
    "reason": "Reason for reporting this comment"
  }
  ```
- **Response:** 200 OK with success message

### Flag Comment (Admin only)
- **POST /comments/:id/flag**
- **Auth:** JWT required (admin only)
- **Description:** Flag a comment as inappropriate
- **Request Body:**
  ```json
  {
    "reason": "Reason for flagging this comment"
  }
  ```
- **Response:** 200 OK with CommentResponseDto

### Unflag Comment (Admin only)
- **POST /comments/:id/unflag**
- **Auth:** JWT required (admin only)
- **Description:** Remove flag from a comment
- **Response:** 200 OK with CommentResponseDto
```

## Data Models

### CommentResponseDto
```typescript
{
  id: string;
  content: string;
  postId: string;
  parentCommentId?: string; // Optional for replies
  user: {
    id: string;
    username: string;
    email: string;
  };
  upvotes: number;
  downvotes: number;
  userVote: number | null; // 1, -1, or null
  replyCount: number;
  flagReason?: string; // Only visible to admins
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Example

### Creating a Comment
```typescript
// Example using axios
const createComment = async (token, content, postId, parentCommentId = null) => {
  try {
    const response = await axios.post(
      'http://your-api.com/comments',
      { content, postId, parentCommentId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
  }
};
```
