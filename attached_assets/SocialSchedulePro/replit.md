# SocialFlow - Social Media Management Platform

## Overview

SocialFlow is a comprehensive social media management platform built with React and Express. It provides users with tools to create, schedule, and manage social media posts across multiple platforms, along with template management, brand asset organization, and analytics capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas shared between frontend and backend
- **Session Management**: PostgreSQL session store (connect-pg-simple)

### Key Design Decisions
1. **Monorepo Structure**: Single repository with shared schemas and types between client and server
2. **Type Safety**: End-to-end TypeScript with shared Zod schemas for validation
3. **Component Library**: shadcn/ui for consistent, accessible UI components
4. **Database-First**: Schema-driven development with Drizzle ORM migrations

## Key Components

### Database Schema
- **Posts**: Social media posts with content, platforms, scheduling, and status
- **Templates**: Reusable post templates with brand guidelines
- **Brand Assets**: Logo, color, and font management
- **Schedules**: Post scheduling across different platforms
- **Users**: User management (schema defined but not fully implemented)

### API Endpoints
- **Posts**: CRUD operations for social media posts
- **Templates**: Template management and retrieval
- **Brand Assets**: Asset management by type
- **Schedules**: Post scheduling management
- **Analytics**: Statistics and performance data

### Frontend Pages
- **Dashboard**: Overview with stats, recent posts, and quick actions
- **Calendar**: Content calendar with scheduling visualization
- **Create Post**: Post creation with template selection and platform targeting
- **Templates**: Template library management
- **Analytics**: Performance metrics and insights
- **Brand Assets**: Brand resource management

## Data Flow

1. **Content Creation**: Users create posts using templates or from scratch
2. **Platform Selection**: Posts can be targeted to multiple social platforms
3. **Scheduling**: Posts can be saved as drafts, scheduled, or published immediately
4. **Asset Integration**: Brand assets are integrated into posts and templates
5. **Analytics**: Performance data is tracked and displayed in dashboards

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool with HMR support
- **tsx**: TypeScript execution for server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Build Process
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle kit handles schema migrations

### Environment Configuration
- **Development**: Uses `tsx` for TypeScript execution with HMR
- **Production**: Compiled JavaScript with Node.js execution
- **Database**: Configured via `DATABASE_URL` environment variable

### Platform Optimization
- **Replit Integration**: Special handling for Replit environment
- **Asset Serving**: Static assets served from built client
- **Error Handling**: Development error overlay and production error boundaries

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- July 08, 2025: Complete social media automation platform implemented
  - Built comprehensive data model with posts, templates, brand assets, and schedules
  - Created full-stack application with Express backend and React frontend
  - Implemented dashboard with analytics, recent posts, and quick actions
  - Added content calendar for scheduling visualization
  - Built post creation page with template selection and real-time preview
  - Created templates management system with pre-built examples
  - Added brand assets management for logos, colors, and fonts
  - Implemented analytics page with performance tracking
  - Application successfully running and all features operational

## Changelog

- July 08, 2025. Initial setup and complete implementation