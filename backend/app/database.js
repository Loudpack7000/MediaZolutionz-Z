// Database Connection & Initialization
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./core/config');

let db;

// Initialize database connection
function initializeDatabase() {
    const dbPath = path.join(__dirname, '../../database', config.DATABASE_PATH.replace('./', ''));
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database');
            createTables();
        }
    });
    return db;
}

// Get database instance
function getDatabase() {
    if (!db) {
        return initializeDatabase();
    }
    return db;
}

// Create all database tables
function createTables() {
    const db = getDatabase();
    
    // Contact Field Definitions
    db.run(`CREATE TABLE IF NOT EXISTS contact_field_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        field_key TEXT UNIQUE NOT NULL,
        field_type TEXT NOT NULL,
        is_required INTEGER DEFAULT 0,
        section TEXT DEFAULT 'custom',
        display_order INTEGER DEFAULT 0,
        options TEXT,
        placeholder TEXT,
        help_text TEXT,
        is_active INTEGER DEFAULT 1,
        created_by_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Contacts - Comprehensive Schema
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        display_name TEXT,
        company TEXT,
        email TEXT,
        website TEXT,
        main_phone TEXT,
        mobile_phone TEXT,
        work_phone TEXT,
        fax TEXT,
        address_line_1 TEXT,
        address_line_2 TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT,
        client_type TEXT,
        industry TEXT,
        status TEXT DEFAULT 'Lead',
        lead_source TEXT,
        assigned_designer_id INTEGER DEFAULT NULL,
        assigned_content_creator_id INTEGER DEFAULT NULL,
        assigned_team_ids TEXT,
        current_website_url TEXT,
        current_website_platform TEXT,
        website_goals TEXT,
        target_audience TEXT,
        brand_colors TEXT,
        brand_fonts TEXT,
        brand_guidelines_url TEXT,
        preferred_communication_method TEXT,
        project_budget_range TEXT,
        timeline_preference TEXT,
        social_media_platforms TEXT,
        current_follower_count TEXT,
        content_goals TEXT,
        posting_frequency_preference TEXT,
        content_style_preference TEXT,
        brand_voice_description TEXT,
        competitor_accounts TEXT,
        related_contact_ids TEXT,
        referral_source_contact_id INTEGER DEFAULT NULL,
        tags TEXT,
        notes TEXT,
        description TEXT,
        custom_fields TEXT,
        created_by_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Projects Table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        project_type TEXT,
        description TEXT,
        client_id INTEGER NOT NULL,
        owner_id INTEGER DEFAULT 1,
        assigned_team_ids TEXT,
        status TEXT DEFAULT 'Planning',
        priority TEXT DEFAULT 'Normal',
        start_date DATE,
        target_completion_date DATE,
        actual_completion_date DATE,
        budget_amount REAL,
        hours_estimated INTEGER,
        hours_actual INTEGER,
        project_url TEXT,
        repository_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES contacts(id)
    )`);

    // Tasks Table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        task_type TEXT,
        status TEXT DEFAULT 'To Do',
        priority TEXT DEFAULT 'Normal',
        project_id INTEGER,
        client_id INTEGER,
        assigned_to_id INTEGER DEFAULT 1,
        created_by_id INTEGER DEFAULT 1,
        due_date DATE,
        due_time_start TIME,
        due_time_end TIME,
        is_all_day INTEGER DEFAULT 1,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (client_id) REFERENCES contacts(id)
    )`);

    // Activities Table
    db.run(`CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_type TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        client_id INTEGER NOT NULL,
        created_by_id INTEGER DEFAULT 1,
        related_client_ids TEXT,
        attachments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES contacts(id)
    )`);

    // Documents Table
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        file_type TEXT,
        mime_type TEXT,
        category TEXT,
        client_id INTEGER NOT NULL,
        project_id INTEGER,
        description TEXT,
        is_private INTEGER DEFAULT 0,
        created_by_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES contacts(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )`);

    // Boards
    db.run(`CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#1E40AF',
        created_by_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Board Columns
    db.run(`CREATE TABLE IF NOT EXISTS board_columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        position INTEGER NOT NULL,
        color TEXT,
        wip_limit INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    )`);

    // Board Cards
    db.run(`CREATE TABLE IF NOT EXISTS board_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_column_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        notes TEXT,
        created_by_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_column_id) REFERENCES board_columns(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
    )`);

    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        hashed_password TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database tables initialized');
}

module.exports = {
    initializeDatabase,
    getDatabase
};

