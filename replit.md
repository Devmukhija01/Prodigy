# SocialConnect Pro

## Overview

SocialConnect Pro is a real-time social chat application built with React, Express, and PostgreSQL. It features user search, friend requests, messaging, and WebSocket-based real-time communication. The application uses modern web technologies including shadcn/ui components, TanStack Query for state management, and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and production builds
- **Real-time Communication**: WebSocket client for live updates

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket server for instant messaging and status updates
- **Session Management**: Express sessions with PostgreSQL store
- **API**: RESTful endpoints for CRUD operations

### Database Schema
The application uses four main tables:
- **users**: Store user profiles with online status
- **friend_requests**: Manage friend request lifecycle
- **friendships**: Track established friendships
- **messages**: Store chat messages between users

## Key Components

### Frontend Components
- **Header**: Navigation with theme toggle and screen switching
- **SearchUsers**: User discovery by ID with friend request sending
- **PendingRequests**: Display and manage incoming friend requests
- **ChatInterface**: Real-time messaging with friend list and chat history
- **ThemeProvider**: Light/dark mode theme management

### Backend Components
- **Routes**: Express routes for API endpoints with WebSocket integration
- **Storage**: Abstract storage interface with in-memory implementation
- **WebSocket Server**: Real-time communication handling for messages and status updates

## Data Flow

### User Search and Friend Requests
1. User searches for others by user ID
2. Friend requests are sent via REST API
3. Real-time notifications sent via WebSocket
4. Recipients can accept/reject requests
5. Accepted requests create friendships

### Messaging Flow
1. Users select friends from their friend list
2. Messages are sent via WebSocket for real-time delivery
3. Message history is fetched via REST API
4. Online status is tracked and broadcast

### Real-time Updates
- WebSocket connections authenticate users on connect
- User status changes are broadcast to all connected clients
- Messages are delivered instantly to online recipients
- Friend requests trigger real-time notifications

## External Dependencies

### Frontend Dependencies
- **React & TypeScript**: Core framework and type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing
- **Lucide React**: Icon library

### Backend Dependencies
- **Express**: Web framework
- **Drizzle ORM**: Type-safe database operations
- **WebSocket (ws)**: Real-time communication
- **Zod**: Schema validation
- **PostgreSQL**: Database driver (@neondatabase/serverless)

## Deployment Strategy

### Development
- Vite dev server for frontend with hot module replacement
- Express server with TypeScript compilation via tsx
- Database migrations handled by Drizzle Kit
- Environment variables for database configuration

### Production Build
- Frontend: Vite builds static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Migrations applied via `drizzle-kit push`
- Single process serves both API and static files

### Database Configuration
- Uses PostgreSQL with connection string from `DATABASE_URL`
- Drizzle ORM manages schema and migrations
- Schema defined in `shared/schema.ts` for type sharing
- Migrations output to `./migrations` directory

The application is designed for easy deployment to platforms like Replit, with development and production modes handled by environment variables and build scripts.