# Backend - Notification Management System

This is the backend service for the Notification Management System, built with Express, Prisma, and TypeScript. It handles notification dispatching (APN, Email) and scheduling via Google Cloud Scheduler.

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **npm** or **yarn**.
- **PostgreSQL Database**: Uses Prisma ORM (compatible with Supabase).
- **Apple Developer Account**: For sending iOS Push Notifications (APNs).
- **Google Cloud Project**: For Cloud Scheduler integration.

## Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the `backend` directory based on the following template:

    ```env
    # Server Configuration
    PORT=3000
    PUBLIC_URL=https://your-backend-url.com # Required for Cloud Scheduler callbacks

    # Database
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

    # Apple Push Notification Service (APN)
    APN_KEY_ID=ABC123DEF4              # The Key ID from Apple Developer Console
    APN_TEAM_ID=DEF456GHI7             # Your Apple Team ID
    APN_BUNDLE_ID=com.example.app      # Your App Bundle ID
    APN_PRODUCTION=false               # Set to 'true' for production environment

    # Email Service (SendGrid)
    SENDGRID_API_KEY=SG.xxx...         
    EMAIL_FROM=noreply@example.com
    ```

3.  **Certificates**
    To enable APN functionality, you must have an Apple Push Notification Auth Key (`.p8` file).
    *   Download the `.p8` file from your Apple Developer account.
    *   Place the file in the `src/backend/certs/` directory.
    *   **Note**: The system attempts to automatically find the `.p8` file. For best results, keep the original filename (e.g., `AuthKey_ABC123DEF4.p8`).

4.  **Database Setup**
    Initialize the database schema and generate the Prisma client:
    ```bash
    # Generate Prisma Client
    npm run generate
    
    # Push schema to database
    npm run db:push

    # Seed initial data (optional)
    npm run seed
    ```

## Running the Application

*   **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```

*   **Production Build**:
    ```bash
    npm run build
    npm start
    ```

## Cloud Scheduler Integration

This backend exposes endpoints for managing schedules. When a schedule is created, it registers a job with Google Cloud Scheduler.

*   **Requirement**: The `PUBLIC_URL` environment variable must be set to a publicly accessible URL where this backend is hosted (e.g., a deployed URL or an Ngrok tunnel for local testing).
*   **Mechanism**: Cloud Scheduler will make HTTP requests to this backend's `PUBLIC_URL` to trigger notifications.
