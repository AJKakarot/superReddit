# Supereddit - Backend

A robust, scalable backend for Supereddit: AI Reddit Post Writing, Smart Scheduler, Keyword Tracking, Engagement Coordination, Analytics, and more for agencies & brands.

## 🚀 Features

- **AI Reddit Post Writing**: AI-generated post drafts based on user prompt or keywords; customize tone (story, question, experience); pre-fill titles and body for approval/edit
- **Smart Post Scheduler**: Schedule posts to specific subreddits; calendar interface; label posts by status: Draft, Scheduled, Posted
- **Keyword Tracking**: Monitor Reddit for keyword mentions (brand, competitors, trends); push real-time alerts to user dashboard; tag mentions by sentiment (positive/neutral/negative)
- **Engagement Coordination**: Track and manage post engagement activities with built-in analytics dashboard
- **Client Dashboard**: Each client gets secure access; visual calendar to see upcoming/past posts; read-only analytics (views, engagement, keyword mentions); optional comment visibility
- **Reporting & Analytics**: Post performance (views, upvotes, CTR); comments per post + engagement graph; keyword trigger logs; exportable PDF reports for client review
- **Reddit API Integration**: OAuth-based access for scheduling & post tracking

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Encryption**: Node.js crypto module (AES-256-CBC)
- **AI Integration**: OpenAI API
- **Scheduling**: node-cron
- **HTTP Client**: axios

## 📁 Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts     # Authentication logic
│   │   ├── post.controller.ts     # Post management
│   │   └── ai.controller.ts       # AI content generation
│   ├── routes/
│   │   ├── auth.routes.ts         # Auth endpoints
│   │   ├── post.routes.ts         # Post endpoints
│   │   └── ai.routes.ts           # AI endpoints
│   ├── services/
│   │   ├── encryption.service.ts  # Token encryption
│   │   └── scheduler.service.ts   # Post scheduling
│   ├── middleware/
│   │   └── auth.middleware.ts     # JWT authentication
│   ├── utils/
│   │   └── prisma.ts             # Database client
│   └── index.ts                   # Main server file
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Reddit Developer Account
- OpenAI API Key

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate
```

### 3. Environment Setup

Edit `.env` file with your configuration:

```bash
# Generate secure keys
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_IV:', require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Database Setup

```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user and client.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "clientName": "My Company"
}
```

#### POST `/api/auth/login`
Login user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### POST `/api/auth/reddit/oauth/connect`
Get Reddit OAuth URL (requires authentication).

#### GET `/api/auth/reddit/oauth/callback`
Handle Reddit OAuth callback (requires authentication).

### Post Management Endpoints

All post endpoints require authentication via `Authorization: Bearer <token>` header.

#### POST `/api/posts`
Create a new post.

**Request Body:**
```json
{
  "title": "My Reddit Post",
  "body": "Post content here...",
  "subreddit": "programming",
  "scheduled_at": "2024-01-15T10:00:00Z" // Optional
}
```

#### GET `/api/posts`
Get all posts with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (Draft, Scheduled, Posted, Error)

#### GET `/api/posts/:id`
Get a specific post.

#### PUT `/api/posts/:id`
Update a post.

#### DELETE `/api/posts/:id`
Delete a post.

#### POST `/api/posts/:id/schedule`
Schedule a post for posting.

**Request Body:**
```json
{
  "scheduled_at": "2024-01-15T10:00:00Z",
  "redditAccountId": "account_id" // Optional
}
```

### AI Endpoints

#### POST `/api/ai/draft`
Generate AI-powered post content.

**Request Body:**
```json
{
  "keywords": "programming tips",
  "tone": "story" // "story", "question", or "experience"
}
```

#### GET `/api/ai/tones`
Get available AI generation tones.

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Token Encryption**: AES-256-CBC encryption for Reddit tokens
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend security
- **Rate Limiting**: Built-in Express rate limiting

## 🤖 AI Integration

The AI service uses OpenAI's GPT-3.5-turbo model to generate engaging Reddit posts based on:

- **Keywords**: User-provided topics
- **Tone**: story, question, or experience
- **Content Guidelines**: Reddit-appropriate content with proper length limits

## ⏰ Automated Scheduling

The scheduler service runs every minute to:

1. Find scheduled posts due for posting
2. Refresh expired Reddit tokens
3. Submit posts to Reddit API
4. Update post status and track errors

## 🗄 Database Schema

### Core Models

- **Client**: Multi-tenant client organizations
- **User**: Authenticated users with roles
- **RedditAccount**: Encrypted Reddit OAuth tokens
- **Post**: Reddit posts with scheduling and status tracking

### Key Features

- **Multi-tenancy**: Client-based data isolation
- **Audit Trail**: Created/updated timestamps
- **Status Tracking**: Draft → Scheduled → Posted/Error
- **Error Handling**: Detailed error messages for failed posts

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Configure all required environment variables
2. **Database**: Set up PostgreSQL with proper connection string
3. **Build**: `npm run build`
4. **Start**: `npm start`

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm run start`: Start production server
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema to database
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open Prisma Studio

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code linting (configure as needed)
- **JSDoc**: Comprehensive documentation
- **Error Handling**: Proper error responses

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `DATABASE_URL` | PostgreSQL connection | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ENCRYPTION_KEY` | AES encryption key | Yes |
| `ENCRYPTION_IV` | AES initialization vector | Yes |
| `REDDIT_CLIENT_ID` | Reddit OAuth client ID | Yes |
| `REDDIT_CLIENT_SECRET` | Reddit OAuth secret | Yes |
| `REDDIT_REDIRECT_URI` | OAuth callback URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 