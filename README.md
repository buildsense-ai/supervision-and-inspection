# Inspection Dashboard Mock API Server

This is a mock API server that simulates the behavior of the APIs defined in the API design document. It provides mock data for all pages to facilitate a demonstration of the application's functionality.

## Features

- Simulates all endpoints defined in the API design document
- Provides realistic mock data
- Supports CRUD operations for all resources
- Implements pagination, filtering, and sorting
- Follows RESTful API conventions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Start the server:

\`\`\`bash
npm start
# or
yarn start
\`\`\`

The server will run on http://localhost:3001 by default. You can change the port by setting the PORT environment variable.

## API Endpoints

The mock API server implements all endpoints defined in the API design document, including:

### Authentication
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Issues
- GET /api/issues
- GET /api/issues/:id
- POST /api/issues
- PUT /api/issues/:id
- DELETE /api/issues/:id
- POST /api/issues/:id/comments

### Supervision Records
- GET /api/supervision-records
- GET /api/supervision-records/:id
- POST /api/supervision-records
- PUT /api/supervision-records/:id
- DELETE /api/supervision-records/:id
- POST /api/supervision-records/:id/generate-document

### Daily Logs
- GET /api/daily-logs
- GET /api/daily-logs/:id
- POST /api/daily-logs
- PUT /api/daily-logs/:id
- DELETE /api/daily-logs/:id
- POST /api/daily-logs/:id/generate-document

### Meeting Minutes
- GET /api/meeting-minutes
- GET /api/meeting-minutes/:id
- POST /api/meeting-minutes
- PUT /api/meeting-minutes/:id
- DELETE /api/meeting-minutes/:id
- POST /api/meeting-minutes/:id/generate-document

### Documents
- GET /api/documents
- GET /api/documents/:id
- DELETE /api/documents/:id

### Attachments
- POST /api/attachments
- GET /api/attachments/:id
- DELETE /api/attachments/:id

### Events
- GET /api/events

### Users
- GET /api/users
- GET /api/users/:id

### Projects
- GET /api/projects
- GET /api/projects/:id
- GET /api/projects/:id/statistics

## Mock Data

The server includes mock data for:
- Users
- Projects
- Issues
- Supervision Records
- Daily Logs
- Meeting Minutes
- Documents
- Attachments

## Development

For development with auto-restart on file changes:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

## Customizing Mock Data

You can modify the mock data in the `mock-data.js` file to suit your needs.
\`\`\`

Now, let's create a simple API client that can be used in the frontend to interact with our mock API server:
