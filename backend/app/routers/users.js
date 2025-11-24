// Users Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/users/
router.get('/', (req, res) => {
    const db = getDatabase();
    db.all('SELECT id, email, username, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Database error fetching users:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Handle empty result
        if (!rows || rows.length === 0) {
            return res.json([]);
        }
        
        // Convert is_active from integer to boolean
        const users = rows.map(row => ({
            ...row,
            is_active: row.is_active === 1
        }));
        
        res.json(users);
    });
});

// GET /api/v1/users/:id
router.get('/:id', (req, res) => {
    const db = getDatabase();
    const userId = req.params.id;
    db.get('SELECT id, email, username, full_name, role, is_active, created_at FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            ...row,
            is_active: row.is_active === 1
        });
    });
});

module.exports = router;

