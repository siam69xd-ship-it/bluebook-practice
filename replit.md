# NextPrep - SAT Practice Platform

## Overview

NextPreep is a web-based SAT (Digital SAT/DSAT) practice platform that provides students with authentic past exam questions in a Bluebook-style interface. The application allows users to practice SAT questions with features like topic filtering, question navigation, timers, text highlighting, and detailed explanations. The platform focuses on delivering a smooth, fast, and organized practice experience that mimics the real SAT testing environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Single Page Application (SPA) architecture with client-side routing via React Router

**UI Component System**
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom theme configuration
- Framer Motion for animations and transitions
- Component aliasing via TypeScript path mapping (`@/components`, `@/lib`, etc.)

**State Management**
- React Context API for authentication state (`AuthContext`)
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks
- LocalStorage for persisting user progress and question states

**Key Design Patterns**
- Compound component pattern (accordion, dialog, dropdown components)
- Custom hooks for reusable logic (`useFullscreen`, `useIsMobile`, `use-toast`)
- Controlled components with form validation via React Hook Form
- Progressive enhancement with feature detection for fullscreen API

### Data Layer

**Question Data Structure**
- Questions organized hierarchically: Section → SubSection → Topic → SubTopic
- JSON-based question storage in `/public/data/` directory
- Async question loading with caching to improve performance
- Total Questions: 1147 across 11 topics
- Question categories include:
  - Standard English Conventions (Boundaries, Verbs, Pronouns, Modifiers)
  - Information and Ideas (Central Ideas and Details, Command of Evidence, Inferences)
  - Craft and Structure (Text Structure and Purpose, Cross-Text Connections, Words in Context)

**State Persistence**
- User progress saved to LocalStorage with question states tracking:
  - Selected answers
  - Marked for review flags
  - Eliminated options
  - Text highlights with color and position
  - Individual option check states

### Routing Structure

- `/` - Landing page with feature overview and stats
- `/quiz` - Main practice interface with question practice (free mode)
- `/timed-quiz` - Timed quiz mode with topic selection and countdown timer
- `/auth` - Authentication page for Google OAuth
- `/404` - Custom 404 error page for undefined routes

### Two Practice Modes

**Practice Mode (`/quiz`)**
- Free-form practice with all questions
- Topic filtering via sidebar
- Check Answer button to verify individual options
- Explanation panel for learning
- Per-question timer for self-pacing
- Progress saved to LocalStorage

**Timed Quiz Mode (`/timed-quiz`)**
- Three phases: Setup → Active → Completed
- Topic selection with multi-select support
- Configurable question count (5-200 questions)
- Dynamic timer calculation based on question types (SEC questions get less time)
- Shuffled questions to avoid consecutive same-topic questions
- No Check Answer button during active quiz (disabled for authentic testing)
- Post-quiz summary with correct/incorrect/unanswered counts
- Review mode with full explanations after submission

### Authentication & Authorization

**Status**: Server-Side Authentication with Session Management
- Email/password authentication via Express backend
- Session management using express-session with PostgreSQL store
- Password hashing with bcrypt (12 rounds)
- Email verification code system for account creation
- HTTP-only secure cookies for production environments
- Optional guest mode - users can access quiz without authentication

**Authentication Flow**:
1. Sign-up: User provides email → receives verification code → submits code + password → account created
2. Sign-in: User provides email + password → session established
3. Session persistence: Session stored in PostgreSQL, auto-checked on page load

**Backend API Endpoints**:
- `POST /api/auth/send-code` - Sends email verification code
- `POST /api/auth/verify-code` - Verifies code and creates user account
- `POST /api/auth/login` - Authenticates user with email/password
- `POST /api/auth/logout` - Destroys user session
- `GET /api/auth/user` - Retrieves current authenticated user
- `GET /api/attempts` - Fetches user's question attempt history
- `POST /api/attempts` - Saves question attempt for authenticated user

**Design Rationale**: Server-side authentication provides better security and allows for user progress tracking across devices. Guest mode remains available for users who want to practice without creating an account.

### UI/UX Features

**Bluebook-Style Interface**
- Two-column layout (passage on left, question on right)
- Custom color scheme matching SAT Bluebook aesthetic
- Question option states: unselected, selected, eliminated, correct, incorrect
- Per-question timer with pause functionality
- Text highlighting tool with multiple color options
- Mark for review functionality

**Navigation & Filtering**
- Sidebar filter system with collapsible topic hierarchy
- Question navigator modal showing progress across all questions
- Previous/Next navigation with keyboard support
- Fullscreen mode toggle for distraction-free practice

**Feedback Mechanisms**
- Explanation panel that slides in from the right
- Individual option checking before revealing final answer
- Visual indicators for correct/incorrect answers
- Toast notifications for user actions

### Styling Architecture

**Tailwind Configuration**
- Custom color system with CSS variables for theme consistency
- Extended font families: Inter (sans), Playfair Display (display), Merriweather (serif)
- Custom highlight colors for text annotation
- Bluebook-specific theme colors defined as CSS custom properties
- Dark mode support via class-based strategy

**Rationale**: CSS variables allow runtime theme switching and maintain a single source of truth for colors, while Tailwind provides rapid UI development with consistent spacing and sizing.

### Performance Optimizations

- Async question loading to avoid blocking initial render
- Question data caching to prevent redundant file fetches
- Lazy loading of routes with React Router
- Memoization of filtered question lists
- Optimized re-renders with proper React key usage

## External Dependencies

### Third-Party Services

**Database**: Replit's Neon PostgreSQL
- Database schema managed via Drizzle ORM
- Server-side database access via @neondatabase/serverless
- Tables: admin_users, donors, locations, reports, verification_codes

### Core Libraries

**UI & Styling**
- `@radix-ui/*` - Unstyled accessible component primitives
- `tailwindcss` - Utility-first CSS framework
- `framer-motion` - Animation library for smooth transitions
- `lucide-react` - Icon library
- `next-themes` - Theme switching support

**State & Data Management**
- `@tanstack/react-query` - Server state management and caching
- `react-hook-form` - Form state management and validation
- `@hookform/resolvers` - Form validation resolver integration

**Utilities**
- `clsx` & `class-variance-authority` - Conditional className utilities
- `date-fns` - Date manipulation and formatting
- `cmdk` - Command menu component

**Development Tools**
- `vite` - Build tool and dev server
- `typescript` - Type checking
- `eslint` - Code linting with React-specific rules
- `@vitejs/plugin-react-swc` - Fast React refresh using SWC compiler

### Data Sources

- Static JSON files stored in `/public/data/` directory
- Question content loaded asynchronously from local files
- No external API dependencies for question data (fully offline-capable for practice)

### Deployment Configuration

**Vercel Deployment**
- `vercel.json` configured with rewrites to handle SPA client-side routing
- All routes are redirected to `/index.html` for proper React Router navigation
- This ensures page refresh on deep links (e.g., `/quiz/21`) works correctly