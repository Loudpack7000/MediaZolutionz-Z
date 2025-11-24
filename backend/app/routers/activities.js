// Activities Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/activities/client/:clientId
router.get('/client/:clientId', (req, res) => {
    const db = getDatabase();
    const clientId = req.params.clientId;
    
    db.all('SELECT * FROM activities WHERE client_id = ? ORDER BY created_at DESC', [clientId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST /api/v1/activities/client/:clientId
router.post('/client/:clientId', (req, res) => {
    const db = getDatabase();
    const clientId = req.params.clientId;
    const { activity_type, subject, content, attachments } = req.body;
    
    const attachmentsJson = attachments ? JSON.stringify(attachments) : null;
    
    db.run(
        `INSERT INTO activities (activity_type, subject, content, client_id, attachments)
        VALUES (?, ?, ?, ?, ?)`,
        [activity_type, subject || null, content, clientId, attachmentsJson],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Activity created successfully' });
        }
    );
});

module.exports = router;

