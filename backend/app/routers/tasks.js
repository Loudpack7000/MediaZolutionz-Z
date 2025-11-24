// Tasks Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/tasks/
router.get('/', (req, res) => {
    const db = getDatabase();
    const clientId = req.query.client_id;
    const projectId = req.query.project_id;
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    
    if (clientId) {
        query += ' AND client_id = ?';
        params.push(clientId);
    }
    if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
    }
    
    query += ' ORDER BY due_date, created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST /api/v1/tasks/
router.post('/', (req, res) => {
    const db = getDatabase();
    const { title, description, task_type, status, priority, project_id, client_id, assigned_to_id, due_date } = req.body;
    
    db.run(
        `INSERT INTO tasks (title, description, task_type, status, priority, project_id, client_id, assigned_to_id, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || null, task_type || null, status || 'To Do', priority || 'Normal', 
         project_id || null, client_id || null, assigned_to_id || 1, due_date || null],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Task created successfully' });
        }
    );
});

module.exports = router;

