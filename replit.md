# Coastal Threat Alert System

## Overview

The Coastal Threat Alert System is a comprehensive full-stack application designed to monitor, analyze, and visualize coastal threats including storm surges, cyclones, coastal erosion, and pollution. The system provides real-time data collection, AI-powered analysis, and community-driven reporting to help government agencies, NGOs, and fishing communities respond to coastal threats effectively.

The application combines modern web technologies with real-time data processing to deliver critical coastal monitoring capabilities through an intuitive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark/light theme support
- **Authentication**: Session-based authentication with role-based access control
- **Real-time Communication**: WebSocket integration for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Authentication**: Replit Auth integration with session management
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Provider**: Neon Database for serverless PostgreSQL hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Data Models**: Comprehensive schema covering users, sensors, alerts, reports, readings, and notifications

### Authentication & Authorization
- **Authentication Provider**: Replit OpenID Connect (OIDC) integration
- **Session Management**: Express session with PostgreSQL storage
- **Role-based Access**: Three-tier role system (Government, NGO, Fisherfolk)
- **Security**: JWT-based tokens with secure session handling

### Real-time Features
- **WebSocket Server**: Socket.IO for bidirectional communication
- **Event Broadcasting**: Role-based room subscriptions for targeted notifications
- **Live Updates**: Real-time alerts, sensor readings, and system status updates

### Development & Build System
- **Build Tool**: Vite for fast development and optimized production builds
- **Package Manager**: npm with lockfile for reproducible builds
- **Development Server**: Hot module replacement with Vite dev server
- **Production Build**: ESBuild for server-side bundling with optimal performance

### UI/UX Design System
- **Component Library**: Comprehensive set of reusable UI components
- **Theme System**: CSS custom properties with light/dark mode support
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Accessibility**: ARIA-compliant components with keyboard navigation support
- **Icon System**: Font Awesome integration for consistent iconography

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Connection**: Direct HTTP connections via @neondatabase/serverless driver

### Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Backend**: PostgreSQL session storage for scalable session management

### Frontend Libraries
- **UI Components**: Radix UI primitives for accessible component foundations
- **Data Visualization**: Recharts for interactive charts and analytics displays
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Date Handling**: date-fns for consistent date formatting and manipulation

### Development Tools
- **Replit Integration**: Special handling for Replit development environment
- **Error Overlay**: Runtime error display in development mode
- **Build Optimization**: Vite plugins for development experience enhancement

### Mapping & Visualization
- **Leaflet**: Interactive mapping library loaded dynamically for threat visualization
- **Map Tiles**: OpenStreetMap integration for base map layers
- **Geolocation**: Browser geolocation API for location-based features

### Utility Libraries
- **Validation**: Zod for runtime type checking and data validation
- **Styling**: clsx and tailwind-merge for conditional CSS class management
- **Caching**: TanStack Query for intelligent data caching and synchronization