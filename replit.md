# CoinIT - Content Tokenization Platform

## Overview

CoinIT is a Web3 application that transforms blog content and articles into collectible digital assets (coins) on blockchain networks. The platform bridges traditional web content and blockchain-based digital assets by allowing users to scrape blog posts, extract metadata, and mint them as tokens. Built with React, Express, and integrating with blockchain infrastructure through Neon Database and IPFS storage via Pinata.

## User Preferences

Preferred communication style: Simple, everyday language.

## On-Chain Activity Tracking (Grant Verification)

**Contract Name**: youbuidlevery1  
**Purpose**: Records all platform activities on-chain for grant verification with comprehensive fee tracking

**Last Updated**: October 13, 2025

### Hybrid Activity Tracking Approach

The platform uses a **hybrid approach** for on-chain verification to provide the best user experience while maintaining grant verification:

**How It Works**:
1. **Instant Coin Creation**: When a user creates a coin, they sign ONCE to deploy via Zora's factory
2. **Database Recording**: Coin is immediately saved to our database with all metadata
3. **Background Batch Sync**: A background service batches unrecorded coins and records them to the blockchain
4. **Timestamp Preservation**: The contract accepts a timestamp parameter, so batch recording preserves the exact original creation time

**Why Hybrid Approach?**:
- ✅ **No Double Signatures**: Users only sign once (for deployment), not twice
- ✅ **Better UX**: Instant coin creation without blockchain delays
- ✅ **Grant Verification**: All activities still recorded on-chain with accurate timestamps
- ✅ **Cost Efficient**: Batch recording saves gas fees

**Tracked Metrics**:
- 💰 **Platform Fees Earned** - 20% of all trading fees (on-chain)
- 👥 **Creator Fees Earned** - Distributed to coin creators (on-chain)
- 📊 **Market Cap Updates** - Per coin market capitalization
- 📈 **Trading Volume** - Total platform trading volume
- 👤 **Unique Creators** - Number of active creators
- 🪙 **Total Coins Created** - All-time coin deployments with preserved timestamps

**Key Components**:
- Smart Contract: `contracts/youbuidlevery1.sol` (accepts timestamp parameter for batch recording)
- Background Service: `server/activity-tracker-service.ts` (batches and records coins to blockchain)
- Backend Routes: `server/routes.ts` (includes `/api/activity-tracker/sync` and `/api/activity-tracker/stats`)
- Deployment Scripts: `scripts/deploy-activity-tracker.js`, `scripts/verify-activity-tracker.js`
- Frontend Integration: `client/src/lib/zora-factory.ts` (temporarily disabled postDeployHook)
- Admin Dashboard: `client/src/pages/AdminMetrics.tsx` (visit `/admin/metrics`)
- Database Schema: `shared/schema.ts` (activityTrackerTxHash and activityTrackerRecordedAt fields)
- Documentation: `DEPLOYMENT_GUIDE.md`

**Deployment Instructions**:
```bash
# 1. Set environment variables in Replit Secrets
DEPLOYER_PRIVATE_KEY=your_private_key_with_ETH_on_Base
BASESCAN_API_KEY=your_basescan_key (optional)

# 2. Deploy contract to Base mainnet
npm run deploy:tracker

# 3. Add deployed address to Replit Secrets
VITE_ACTIVITY_TRACKER_ADDRESS=deployed_contract_address

# 4. Verify contract on Basescan (optional but recommended)
npm run verify:tracker <contract_address>

# 5. Deploy to Replit
# Click "Deploy" button, select "Autoscale", and deploy
```

**For Grant Judges**:
- View contract on Basescan: `https://basescan.org/address/<TRACKER_ADDRESS>#readContract`
- Call `getPlatformStats()` to see total coins, fees, volume, and creators
- Call `getCoinMetrics(address)` to view specific coin metrics
- Call `getCreatorStats(address)` to see creator-specific earnings
- Call `getAllActivities()` to view all platform activities
- All events and data are permanently on-chain and cannot be modified

**Admin Dashboard**: Visit `/admin/metrics` to view comprehensive on-chain metrics including total platform fees earned, creator fees distributed, trading volume, and more.

## Daily Login Streak Feature

**Last Updated**: October 15, 2025

A gamification feature that rewards users with points for logging in consecutively each day, encouraging daily platform engagement.

**How It Works**:
1. **Automatic Check-in**: When users visit the app while authenticated, the system automatically checks them in for the day
2. **Streak Tracking**: Consecutive daily logins build up a streak counter
3. **Points Rewards**: Users earn 10 base points per day, plus bonus points for longer streaks (e.g., 7+ days = additional bonus)
4. **Streak Reset**: Missing a day resets the streak counter back to 1

**Key Features**:
- 🔥 **Streak Counter**: Visual display with flame icon showing current streak
- 📅 **Weekly Calendar**: Shows last 7 days with checkmarks for login days
- 📊 **Stats Dashboard**: Displays total points earned, current streak, and best streak (personal record)
- 🎁 **Bonus Points**: Longer streaks earn bonus points on top of the base 10 points

**Points System**:
- Base reward: 10 points per daily login
- Streak bonus: Additional points for maintaining long streaks
- Bonus formula: `10 + min(floor(streak/7) * 5, 50)` (caps at 50 bonus points)

**Database Schema**:
- Table: `login_streaks` in `shared/schema.ts`
- Fields: userAddress, currentStreak, longestStreak, lastLoginDate, totalPoints, loginDates[]

**Implementation Components**:
- Backend API: `/api/login-streak/:address` (GET), `/api/login-streak/check-in` (POST)
- Storage Layer: `server/storage.ts` and `server/supabase-storage.ts` (getLoginStreak, createLoginStreak, updateLoginStreak methods)
- Frontend Component: `client/src/components/streak-display.tsx`
- Integration: Displayed on home page for authenticated users

**User Experience**:
- Automatic check-in on app visit (no manual action required)
- Toast notifications showing points earned and streak status
- Visual calendar highlighting logged-in days
- Dark mode support with proper color theming

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript and Vite as the build tool

**Routing**: Wouter for client-side routing with a simple switch-based route configuration

**UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. The design system uses a "new-york" style with CSS variables for theming and supports dark mode.

**State Management**: 
- TanStack Query (React Query) for server state management and data fetching
- Local React hooks (useState, useEffect) for component-level state
- Custom query client configured with specific retry and caching strategies

**Key Design Patterns**:
- Component-based architecture with reusable UI primitives
- Custom hooks for cross-cutting concerns (useToast, useIsMobile)
- Path aliases for clean imports (@/, @shared/, @assets/)

### Backend Architecture

**Framework**: Express.js running on Node.js with TypeScript

**Server Structure**:
- Single entry point (`server/index.ts`) handling all middleware setup
- Modular route registration system (`server/routes.ts`)
- In-memory storage implementation with interface-based design for easy database migration
- Custom logging middleware for API request tracking

**API Design**:
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Scraping endpoint (`POST /api/scrape`) for extracting web content
- CRUD operations for scraped content and coins

**Development Setup**:
- Vite middleware integration for HMR in development
- Static file serving for production builds
- Separation of client and server concerns

### Data Storage

**Current Implementation**: In-memory storage using Map data structures (MemStorage class)

**Planned Database**: PostgreSQL via Neon serverless database
- Drizzle ORM configured for database operations
- Schema defined in `shared/schema.ts` with two main tables:
  - `scraped_content`: Stores web scraping results with metadata
  - `coins`: Stores blockchain token information linked to scraped content
- Connection pooling configured for `connect-pg-simple` sessions

**Data Models**:
- ScrapedContent: url, title, description, author, publishDate, image, content, tags
- Coin: name, symbol, address, creator, scrapedContentId (foreign key), ipfsUri

**Schema Validation**: Zod schemas generated via drizzle-zod for runtime validation

### External Dependencies

**Web Scraping**:
- axios: HTTP client for fetching web pages
- cheerio: Server-side DOM manipulation for HTML parsing
- Extracts Open Graph metadata, article metadata, and content

**IPFS Storage**:
- Pinata: Decentralized file storage service
- Used for storing coin metadata permanently
- API integration via REST endpoints
- Falls back to mock URIs if credentials not configured

**Blockchain Integration**:
- Zora SDK for coin creation and trading
- Wallet connection via Privy Auth
- Live trading functionality with on-chain transactions
- Designed for Zora network coin minting on Base blockchain

**GeckoTerminal Integration** (Added October 12, 2025):
- Live DEX pool charts via GeckoTerminal embed iframes
- Free API access (30 calls/min rate limit)
- Backend proxy routes to avoid CORS and manage rate limits
- Integration Components:
  - `client/src/components/geckoterminal-chart.tsx`: Reusable chart component
  - `client/src/lib/geckoterminal.ts`: API helper functions for pools, OHLCV data
  - `server/routes.ts`: Backend proxy routes (/api/geckoterminal/*)
- Chart Features:
  - TradingView-powered interactive charts
  - Support for 240+ blockchains including Base
  - Multiple chart types (price, market cap, volume)
  - Customizable resolution and styling
  - Automatic pool discovery by token address
  - Fallback to existing recharts when GeckoTerminal data unavailable

**UI Libraries**:
- Radix UI: Accessible, unstyled component primitives
- Tailwind CSS: Utility-first styling
- class-variance-authority: Component variant management
- Lucide React: Icon library

**Development Tools**:
- TypeScript: Type safety across frontend and backend
- Vite: Fast build tool with HMR
- Replit plugins: Dev banner, cartographer, runtime error overlay
- ESBuild: Server-side bundling for production

**Session Management**:
- connect-pg-simple: PostgreSQL session store (configured but not active with in-memory storage)

### Architecture Decisions

**Monorepo Structure**: Client and server code in same repository with shared types/schemas for type safety across boundaries.

**Why chosen**: Simplifies development, ensures type consistency, and reduces duplication.

**Trade-offs**: Requires careful build configuration; could be split into separate repos for independent deployment.

**In-Memory Storage**: Current implementation uses Map-based storage instead of database.

**Why chosen**: Simplifies initial development and removes database dependency for prototyping.

**Trade-offs**: Data doesn't persist across restarts; must migrate to PostgreSQL for production (infrastructure already configured).

**IPFS via Pinata**: Centralized service for decentralized storage.

**Why chosen**: Easier setup than running own IPFS node; reliable gateway access.

**Trade-offs**: Depends on third-party service; additional cost considerations.

**Mock Blockchain Operations**: Placeholder implementations for wallet and Zora integration.

**Why chosen**: Allows frontend development without blockchain complexity.

**Trade-offs**: Requires significant work to integrate real blockchain functionality; current implementation is not production-ready for actual token minting.