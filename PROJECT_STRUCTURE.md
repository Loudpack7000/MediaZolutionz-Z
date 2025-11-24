# MediaZolutionz Project Structure

This document describes the project structure aligned with the WORKSPACE_STRUCTURE.md pattern.

## Directory Structure

```
MediaZolutionz-Z/
├── backend/                    # Node.js/Express Backend
│   ├── app/                   # Main application package
│   │   ├── main.js           # Express app entry point & routing
│   │   ├── database.js       # Database connection & initialization
│   │   ├── core/             # Core configuration
│   │   │   └── config.js     # Settings & environment variables
│   │   └── routers/          # API route handlers (one file per resource)
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
│   ├── app/                  # HTML pages (routes)
│   │   ├── index.html        # Homepage (/home)
│   │   ├── login.html        # Login page (/)
│   │   ├── register.html     # Registration page
│   │   ├── clients-list.html # Client list (/clients)
│   │   ├── client-detail.html # Client detail (/clients/:id)
│   │   ├── client-new.html   # New client form (/clients/new)
│   │   ├── contact-new.html  # Contact creation
│   │   ├── boards.html       # Kanban boards (/boards.html)
│   │   └── settings.html     # Settings page (/settings)
│   ├── styles/               # CSS files
│   │   ├── styles.css        # Main styles
│   │   ├── auth.css
│   │   ├── clients.css
│   │   ├── client-detail.css
│   │   ├── client-form-enhanced.css
│   │   ├── client-modal.css
│   │   ├── contact-form.css
│   │   ├── boards.css
│   │   └── settings.css
│   ├── lib/                  # JavaScript utilities & API clients
│   │   ├── auth.js           # Authentication logic
│   │   ├── auth-check.js     # Auth state checking
│   │   ├── nav-header.js     # Navigation header logic
│   │   ├── client-form.js    # Client form handling
│   │   ├── client-modal.js   # Client modal logic
│   │   ├── client-detail.js  # Client detail page logic
│   │   ├── clients-list.js   # Client list logic
│   │   ├── boards-api.js     # Boards API client
│   │   ├── boards.js         # Boards page logic
│   │   ├── contact-form.js   # Contact form logic
│   │   └── settings.js       # Settings page logic
│   └── public/               # Static assets (favicon, images, etc.)
│
├── database/                 # Database files
│   ├── pm.db                # SQLite database (auto-generated)
│   ├── users.db             # Users database (if separate)
│   └── init.sql             # Schema documentation
│
├── package.json             # Root package.json (convenience)
├── env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
└── PROJECT_STRUCTURE.md     # This file
```

## Key Organizational Principles

### 1. **Separation of Concerns**
- **Backend**: All server-side logic in `backend/app/`
- **Frontend**: All client-side code in `frontend/`
- **Database**: Database files and initialization scripts in `database/`

### 2. **Modular Routes**
- Each API resource has its own router file in `backend/app/routers/`
- Routes follow RESTful conventions: `/api/v1/{resource}/`

### 3. **Frontend Organization**
- **Pages**: HTML files in `frontend/app/` (one file per route)
- **Styles**: CSS files in `frontend/styles/` organized by feature
- **Scripts**: JavaScript files in `frontend/lib/` for utilities and API clients
- **Static**: Public assets in `frontend/public/`

### 4. **Naming Conventions**
- **Backend**: `snake_case.js` for files (e.g., `contact_fields.js`)
- **Frontend**: `kebab-case.html` for pages, `kebab-case.css` for styles
- **Routes**: RESTful URLs with `/api/v1/` prefix

### 5. **Configuration**
- Environment variables: `env.example` → `.env`
- Backend config: `backend/app/core/config.js`
- Database path: Configured in `config.js`, stored in `database/`

## API Structure

All API endpoints follow this pattern:
- Base URL: `http://localhost:3000/api/v1/`
- Resources:
  - `/api/v1/contact-fields/` - Custom field definitions
  - `/api/v1/contacts/` - Client/contact management
  - `/api/v1/projects/` - Project management
  - `/api/v1/tasks/` - Task management
  - `/api/v1/activities/` - Activity/communication tracking
  - `/api/v1/documents/` - Document management
  - `/api/v1/boards/` - Kanban board management

## File Paths

### Backend Paths
- Entry point: `backend/app/main.js`
- Database: `database/pm.db` (relative to project root)
- Static files: Served from `frontend/` directory

### Frontend Paths
- CSS: `/styles/{filename}.css` (served from `frontend/styles/`)
- JS: `/lib/{filename}.js` (served from `frontend/lib/`)
- Pages: Routes defined in `backend/app/main.js`

## Development Workflow

1. **Start Server**: `npm start` or `cd backend && npm start`
2. **Backend Changes**: Edit files in `backend/app/`, server auto-restarts
3. **Frontend Changes**: Edit files in `frontend/`, refresh browser
4. **Database Changes**: Modify `backend/app/database.js` schema

## Adding New Features

### Adding a New API Resource (e.g., "Invoices"):

1. **Backend**:
   - Create `backend/app/routers/invoices.js`
   - Add router to `backend/app/main.js`: `app.use('/api/v1/invoices', invoicesRouter);`
   - Update database schema in `backend/app/database.js`

2. **Frontend**:
   - Create `frontend/app/invoices-list.html` (list page)
   - Create `frontend/app/invoice-detail.html` (detail page)
   - Create `frontend/lib/invoices-api.js` (API client)
   - Add routes in `backend/app/main.js` for HTML pages

This structure ensures consistency, maintainability, and scalability.

