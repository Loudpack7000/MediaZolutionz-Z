// Documents Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/documents/client/:clientId
router.get('/client/:clientId', (req, res) => {
    const db = getDatabase();
    const clientId = req.params.clientId;
    
    db.all('SELECT * FROM documents WHERE client_id = ? ORDER BY created_at DESC', [clientId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST /api/v1/documents/client/:clientId/upload
router.post('/client/:clientId/upload', (req, res) => {
    // File upload will be handled with multer or similar in production
    // For now, return placeholder
    res.status(501).json({ error: 'File upload not yet implemented' });
});

module.exports = router;

