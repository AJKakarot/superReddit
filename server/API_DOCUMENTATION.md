# Reddit Post Management SaaS - API Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Health Check](#health-check)
- [Authentication APIs](#authentication-apis)
- [Post Management APIs](#post-management-apis)
- [Monitoring & Analytics APIs](#monitoring--analytics-apis)
- [AI APIs](#ai-apis)
- [Testing & Debugging APIs](#testing--debugging-apis)
- [Data Models](#data-models)
- [Testing Examples](#testing-examples)
- [Environment Variables](#environment-variables)
- [Notes](#notes)

## 🌐 Overview

This API provides a complete backend for managing Reddit posts with AI-assisted content generation, secure token storage, automated scheduling, and real-time keyword monitoring.

**Features:**
- User authentication with JWT
- Multi-tenant client management
- Reddit OAuth integration with encrypted token storage
- AI-powered content generation (Google Gemini)
- Automated post scheduling
- Real-time Reddit keyword monitoring with WebSocket alerts

## 🔗 Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## 🔐 Authentication

Most endpoints require authentication using JWT tokens.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

**Getting a Token:**
1. Register a user: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Use the returned token in subsequent requests

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 🏥 Health Check

### GET `/health`

Check if the server is running.

**No authentication required**

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```

---

## 🔑 Authentication APIs

### POST `/api/auth/register`

Register a new user and create a client organization.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "clientName": "My Company"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "clientId": "cl_abc123...",
  "userId": "user_xyz789..."
}
```

### POST `/api/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_xyz789...",
    "email": "user@example.com",
    "role": "CLIENT_USER",
    "clientId": "cl_abc123...",
    "clientName": "My Company"
  }
}
```

### GET `/api/auth/me`

Get information for the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "user_xyz789...",
    "email": "user@example.com",
    "role": "CLIENT_USER",
    "clientId": "cl_abc123...",
    "clientName": "My Company"
  }
}
```

### POST `/api/auth/reddit/oauth/connect`

Get Reddit OAuth URL for connecting a Reddit account.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "authUrl": "https://www.reddit.com/api/v1/authorize?client_id=...&response_type=code&state=...&redirect_uri=...&duration=permanent&scope=identity,submit,read"
}
```

### GET `/api/auth/reddit/oauth/callback`

Handle Reddit OAuth callback and save tokens. The frontend should capture the `code` and `state` from the URL after Reddit redirects, then call this backend endpoint.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `code`: Authorization code from Reddit
- `state`: State parameter for security

**Response (200):**
```json
{
  "message": "Reddit account connected successfully",
  "redditUsername": "my_reddit_username"
}
```

### GET `/api/auth/reddit/accounts`

List all connected Reddit accounts for the client.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "accounts": [
    {
      "id": "acct_abc123...",
      "reddit_username": "my_reddit_username",
      "token_expires_at": "2025-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 📝 Post Management APIs

All endpoints require authentication.

### POST `/api/posts`

Create a new post.

**Request Body:**
```json
{
  "title": "My Reddit Post Title",
  "body": "This is the content of my post.",
  "subreddit": "programming",
  "scheduled_at": "2024-01-15T15:00:00Z" // Optional
}
```

**Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post_abc123...",
    "title": "My Reddit Post Title",
    "body": "This is the content of my post...",
    "subreddit": "programming",
    "status": "Draft",
    "scheduled_at": "2024-01-15T15:00:00.000Z",
    "author": {
      "email": "user@example.com"
    }
  }
}
```

### GET `/api/posts`

Get all posts for the client, with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by `Draft`, `Scheduled`, `Posted`, `Error`

**Response (200):**
```json
{
  "posts": [
    {
      "id": "post_abc123...",
      "title": "My Reddit Post",
      "subreddit": "programming",
      "status": "Draft",
      "scheduled_at": null,
      "author": { "email": "user@example.com" },
      "redditAccount": { "reddit_username": "my_reddit_username" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### GET `/api/posts/:id` / PUT `/api/posts/:id` / DELETE `/api/posts/:id`

Standard CRUD operations for a specific post. `PUT` cannot be used on a `Posted` post. `DELETE` cannot be used on a `Posted` post.

### POST `/api/posts/:id/schedule`

Schedule a post for a specific time.

**Request Body:**
```json
{
  "scheduled_at": "2024-01-15T16:00:00Z",
  "redditAccountId": "acct_xyz789..."
}
```

**Response (200):**
```json
{
  "message": "Post scheduled successfully",
  "post": {
    "id": "post_abc123...",
    "status": "Scheduled",
    "scheduled_at": "2024-01-15T16:00:00.000Z"
  }
}
```

---

## 📈 Monitoring & Analytics APIs

All endpoints require authentication.

### POST `/api/keywords`

Create a new keyword for the client to monitor.

**Request Body:**
```json
{ "term": "customer service" }
```

**Response (201):**
```json
{
  "id": "kw_abc123...",
  "term": "customer service",
  "is_active": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "lastScannedAt": null,
  "clientId": "cl_abc123..."
}
```

### GET `/api/keywords`

List all keywords for the client.

**Response (200):**
```json
[
  {
    "id": "kw_abc123...",
    "term": "customer service",
    "is_active": true
  }
]
```

### DELETE `/api/keywords/:id`

Delete a specific keyword by its ID.

**Response (204):** No content.

### GET `/api/mentions`

Get a paginated list of all mentions found for the client's keywords.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)

**Response (200):**
```json
{
  "mentions": [
    {
      "id": "mention_abc123...",
      "source_url": "https://reddit.com/...",
      "content_snippet": "A snippet of the post or comment...",
      "author": "reddit_user",
      "subreddit": "programming",
      "sentiment": "NEUTRAL",
      "found_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

---

## 🤖 AI APIs

All endpoints require authentication.

### POST `/api/ai/draft`

Generate AI-powered post content using Google Gemini.

**Request Body:**
```json
{
  "keywords": "programming tips for beginners",
  "tone": "story"
}
```

**Response (200):**
```json
{
  "title": "How I Learned Programming: A Beginner's Journey",
  "body": "When I first started learning to code...",
  "keywords": "programming tips for beginners",
  "tone": "story"
}
```

### GET `/api/ai/tones`

Get available AI generation tones.

**Response (200):**
```json
{
  "tones": [
    { "value": "story", "label": "Personal Story", "description": "..." },
    { "value": "question", "label": "Discussion Question", "description": "..." },
    { "value": "experience", "label": "Experience Share", "description": "..." }
  ]
}
```

---

## 🧪 Testing & Debugging APIs

### POST `/api/test/trigger-mention`

Manually triggers a `new_mention` WebSocket event for the authenticated client. Requires at least one keyword to exist for the client.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Test mention created and emitted",
  "mention": { /* The test mention object */ }
}
```

### GET `/api/test/socket-status`

Checks the current WebSocket connection status for the client.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "clientId": "cl_abc123...",
  "connectedSockets": 1,
  "totalConnections": 5,
  "roomExists": true
}
```
---

## 📊 Data Models

### Enums
```typescript
enum PostStatus { Draft, Scheduled, Posted, Error }
enum Role { ADMIN, CLIENT_USER }
enum Sentiment { POSITIVE, NEUTRAL, NEGATIVE, UNKNOWN }
```

### Core Objects
```typescript
interface Post {
  id: string;
  title: string;
  body: string;
  subreddit: string;
  status: PostStatus;
  scheduled_at?: Date;
  // ... other fields
}

interface Keyword {
  id: string;
  term: string;
  is_active: boolean;
  lastScannedAt?: Date;
}

interface Mention {
  id: string;
  source_url: string;
  content_snippet: string;
  author: string;
  subreddit: string;
  sentiment: Sentiment;
  found_at: Date;
}
```

---

## 🧪 Testing Examples

Use `curl`, Postman, or any other API client.

**1. Register a user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "clientName": "Test Company"
  }'
```

**2. Login and get a token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**3. Add a keyword (using the token):**
```bash
curl -X POST http://localhost:3001/api/keywords \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"term": "new feature"}'
```
---

## 🔧 Environment Variables

Required `.env` variables for the server to function:

```bash
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public"

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_encryption_key_hex
ENCRYPTION_IV=your_16_byte_encryption_iv_hex

# Reddit OAuth
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REDIRECT_URI=http://localhost:3001/api/auth/reddit/oauth/callback

# Google Gemini
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 📝 Notes
- All timestamps are in ISO 8601 format.
- IDs are CUIDs for security and uniqueness.
- Passwords are hashed with bcryptjs.
- Reddit tokens are encrypted with AES-256-CBC.
- A scheduler runs to process scheduled posts and monitor keywords.
- Real-time monitoring alerts are sent via WebSockets. Clients must connect with a valid JWT. 