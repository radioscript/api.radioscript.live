# Test Examples for Post Interactions

## Prerequisites

1. Run the database migration: `migrations/post_interactions.sql`
2. Start the application: `npm run serve`

## Test Scenarios

### 1. Like/Unlike a Post

```bash
# First, get a JWT token by logging in
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the token to like a post
curl -X POST http://localhost:3000/post-interactions/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId": "post-uuid-here"}'

# Check if user liked the post
curl -X GET http://localhost:3000/post-interactions/like/post-uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Record a View

```bash
# Record a view (no authentication required)
curl -X POST http://localhost:3000/post-interactions/view \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "post-uuid-here",
    "sessionId": "session-123",
    "viewDuration": 120,
    "isCompleted": false
  }'
```

### 3. Update View Duration (for podcasts)

```bash
# Update view duration for a podcast
curl -X POST http://localhost:3000/post-interactions/view/post-uuid-here/duration \
  -H "Content-Type: application/json" \
  -d '{
    "viewDuration": 300,
    "isCompleted": true
  }'
```

### 4. Get Post Statistics

```bash
# Get statistics for a post
curl -X GET http://localhost:3000/post-interactions/stats/post-uuid-here
```

### 5. Get User's Liked Posts

```bash
# Get posts liked by the current user
curl -X GET "http://localhost:3000/post-interactions/liked-posts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Get Posts with Statistics

```bash
# Get all posts with like/view counts
curl -X GET "http://localhost:3000/posts?page=1&limit=10"

# Get a specific post with statistics
curl -X GET http://localhost:3000/posts/post-uuid-here
```

## Expected Responses

### Like Response

```json
{
  "liked": true,
  "likeCount": 1
}
```

### Stats Response

```json
{
  "likeCount": 5,
  "viewCount": 120,
  "playCount": 45,
  "uniqueViewers": 80
}
```

### Post with Statistics Response

```json
{
  "id": "post-uuid",
  "title": "عنوان پست",
  "content": "محتوای پست",
  "likeCount": 15,
  "viewCount": 120,
  "playCount": 45,
  "categories": [...],
  "tags": [...],
  "author": {...}
}
```
