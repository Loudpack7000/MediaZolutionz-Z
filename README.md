# MediaZolutionz Project Management System

A comprehensive project management system with contact management and Kanban boards, similar to JobNimbus.

## Project Structure

This project follows a clean separation between backend and frontend:

```
MediaZolutionz-Z/
├── backend/                    # Node.js/Express Backend
│   ├── app/                   # Main application
│   │   ├── main.js           # Express app entry point
│   │   ├── database.js       # Database connection & initialization
│   │   ├── core/             # Core configuration
│   │   │   └── config.js     # App configuration
│   │   └── routers/          # API route handlers
│   │       ├── contact_fields.js
│   │       ├── contacts.js
│   │       ├── projects.js
│   │       ├── tasks.js
│   │       ├── activities.js
│   │       ├── documents.js
│   │       └── boards.js
│   └── package.json          # Backend dependencies
│
├── frontend/                  # Frontend Application
│   ├── app/                  # HTML pages
│   │   ├── index.html        # Homepage
│   │   ├── login.html        # Login page
│   │   ├── register.html    # Registration page
│   │   ├── clients-list.html # Client list
│   │   ├── client-detail.html # Client detail
│   │   ├── client-new.html   # New client form
│   │   ├── boards.html       # Kanban boards
│   │   └── settings.html    # Settings page
│   ├── styles/               # CSS files
│   │   ├── styles.css        # Main styles
│   │   ├── clients.css
│   │   ├── boards.css
│   │   └── ...
│   ├── lib/                  # JavaScript files
│   │   ├── auth.js
│   │   ├── nav-header.js
│   │   ├── clients-list.js
│   │   └── ...
│   └── public/              # Static assets
│
├── database/                 # Database files
│   ├── pm.db               # SQLite database
│   └── init.sql            # Schema documentation
│
├── package.json             # Root package.json (for convenience)
├── env.example              # Environment variables template
└── README.md                # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Start the server:
   ```bash
   npm start
   # or
   cd backend && npm start
   ```

5. Open your browser to `http://localhost:3000`

## API Endpoints

All API endpoints are prefixed with `/api/v1/`:

- **Contact Fields**: `/api/v1/contact-fields/`
- **Contacts**: `/api/v1/contacts/`
- **Projects**: `/api/v1/projects/`
- **Tasks**: `/api/v1/tasks/`
- **Activities**: `/api/v1/activities/`
- **Documents**: `/api/v1/documents/`
- **Boards**: `/api/v1/boards/`

## Features

- ✅ User authentication
- ✅ Contact/Client management with custom fields
- ✅ Kanban boards for project management
- ✅ Project and task tracking
- ✅ Activity/communication history
- ✅ Settings page for field customization

## Development

The project structure follows these principles:

1. **Separation of Concerns**: Backend and frontend are clearly separated
2. **Modular Routes**: Each resource has its own router file
3. **Consistent Naming**: Files follow naming conventions (snake_case for backend, kebab-case for frontend)
4. **API-First**: Backend provides RESTful API, frontend consumes it

## License

ISC
