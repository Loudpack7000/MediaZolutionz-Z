// Projects Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/projects/
router.get('/', (req, res) => {
    const db = getDatabase();
    const clientId = req.query.client_id;
    let query = 'SELECT * FROM projects';
    const params = [];
    
    if (clientId) {
        query += ' WHERE client_id = ?';
        params.push(clientId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST /api/v1/projects/
router.post('/', (req, res) => {
    const db = getDatabase();
    const { name, project_type, description, client_id, status, priority, budget_amount } = req.body;
    
    db.run(
        `INSERT INTO projects (name, project_type, description, client_id, status, priority, budget_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, project_type || null, description || null, client_id, status || 'Planning', priority || 'Normal', budget_amount || null],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Project created successfully' });
        }
    );
});

module.exports = router;

