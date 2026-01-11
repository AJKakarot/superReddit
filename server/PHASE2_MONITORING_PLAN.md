# Phase 2: Monitoring & Analytics Module – Project Plan

## Persona
You are a Senior Full-Stack Engineer with deep expertise in real-time data processing, external API integration, and building scalable SaaS features. You are tasked with extending an existing Reddit management application with a sophisticated monitoring and analytics module. Your code must be efficient, secure, and production-ready.

## Project Goal
Evolve the application from a simple content publisher into a proactive market intelligence platform. You will build a complete, end-to-end system that allows clients to track keywords across Reddit, receive real-time alerts for new mentions, and automatically analyze the sentiment of those conversations.

---

## Part A: The Backend (Node.js, Express, TypeScript, Prisma)

### Step 1: Database Schema Expansion (`prisma/schema.prisma`)
- **Define Enums:**
  - `Sentiment` enum: POSITIVE, NEUTRAL, NEGATIVE, UNKNOWN
- **Create Models:**
  - **Keyword Model:**
    - Fields: id, term, is_active, createdAt, lastScannedAt, clientId (FK), mentions (relation)
    - Constraints: `@@unique([term, clientId])`
  - **Mention Model:**
    - Fields: id, source_url (unique), content_snippet (@db.Text), author, subreddit, sentiment, found_at, keywordId (FK), clientId (FK)
    - Relations: keyword (onDelete: Cascade), client (onDelete: Cascade)
- **After modifying, run:**
  - `npx prisma migrate dev --name add_monitoring_engine`

### Step 2: Keyword & Mention Management APIs
- **File Locations:**
  - `src/controllers/keyword.controller.ts`, `src/routes/keyword.routes.ts`, etc.
- **Authentication:**
  - All endpoints protected by `auth.middleware`.
- **Endpoints:**
  - `POST /api/keywords`: Create new keyword for authenticated client
  - `GET /api/keywords`: List all keywords for client
  - `DELETE /api/keywords/:id`: Delete keyword (ownership enforced)
  - `GET /api/mentions`: Paginated list of mentions for client, ordered by `found_at` desc

### Step 3: The Reddit Monitoring Service (`src/services/monitoring.service.ts`)
- **Scheduler Setup:**
  - Use `node-cron` to run every 2 minutes (`'*/2 * * * *'`)
  - Locking mechanism to prevent overlapping runs
- **Reddit API Authentication:**
  - Use app-only OAuth2 (client_credentials grant)
  - Store token and expiry
- **Core Scanning Logic:**
  - Fetch active keywords
  - For each keyword:
    - Delay between requests (e.g., 1100ms)
    - Use `lastScannedAt` or default (24h ago)
    - Query Reddit: `q=timestamp:${lastScannedAt}..${now} "${keyword.term}"`
    - GET `https://oauth.reddit.com/search.json?sort=new&limit=100&q=...`
    - For each result:
      - Extract permalink, author, subreddit, title, selftext/body
      - Deduplicate by permalink
      - Sentiment analysis (map score to enum)
      - Insert Mention in DB
      - Emit real-time alert via socket.io to client room
    - Update keyword's `lastScannedAt`

### Step 4: WebSocket Server Integration (`src/index.ts`)
- **Setup socket.io** and attach to HTTP server
- **Connection Authentication:**
  - Middleware: verify JWT in handshake
  - On success: join room named after clientId

---

## Part B: The Frontend (React, TypeScript, Vite)

### Step 1: Context for WebSocket Management (`src/contexts/SocketContext.tsx`)
- Create `SocketProvider` to wrap app
- `useEffect`:
  - If authenticated, connect socket.io-client with JWT
  - Listen for `new_mention` event
  - Update context state or notify via callback
  - Cleanup: `socket.disconnect()`

### Step 2: New Pages and Routing
- Create `MonitoringPage.tsx` (central hub)
- Fetch initial keywords and mentions
- Update `App.tsx` and `Navbar.tsx` for new route/link

### Step 3: Build the UI Components
- **KeywordManager.tsx:**
  - Props: keywords, onAddKeyword, onDeleteKeyword
  - UI: MUI TextField + Add Button, List of keywords, Delete button
- **MentionsFeed.tsx:**
  - Props: mentions
  - State: updates on new mentions via SocketContext
  - UI: MUI Card per mention
    - MUI Chip for sentiment (color-coded)
    - Content snippet
    - Metadata (subreddit, author, relative time)
    - "View on Reddit" link

---

By following this plan, you will create a highly valuable and technically impressive feature that functions as a cohesive, end-to-end system. 