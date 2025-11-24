// Boards Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/boards/
router.get('/', (req, res) => {
    const db = getDatabase();
    db.all('SELECT * FROM boards ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /api/v1/boards/:id
router.get('/:id', (req, res) => {
    const db = getDatabase();
    const boardId = req.params.id;
    
    db.get('SELECT * FROM boards WHERE id = ?', [boardId], (err, board) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        
        // Get columns
        db.all('SELECT * FROM board_columns WHERE board_id = ? ORDER BY position', [boardId], (err, columns) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Get cards for each column
            const columnPromises = columns.map(column => {
                return new Promise((resolve) => {
                    db.all(
                        `SELECT bc.*, c.first_name, c.last_name, c.email, c.company, c.status, 
                         c.address_line_1, c.city, c.state, c.industry, c.client_type
                        FROM board_cards bc
                        JOIN contacts c ON bc.contact_id = c.id
                        WHERE bc.board_column_id = ?
                        ORDER BY bc.position`,
                        [column.id],
                        (err, cards) => {
                            if (err) {
                                resolve([]);
                            } else {
                                resolve(cards);
                            }
                        }
                    );
                });
            });
            
            Promise.all(columnPromises).then(cardArrays => {
                columns.forEach((column, index) => {
                    column.cards = cardArrays[index];
                });
                res.json({ ...board, columns });
            });
        });
    });
});

// POST /api/v1/boards/
router.post('/', (req, res) => {
    const db = getDatabase();
    const { name, description, color } = req.body;
    
    db.run(
        'INSERT INTO boards (name, description, color) VALUES (?, ?, ?)',
        [name, description || null, color || '#1E40AF'],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Board created successfully' });
        }
    );
});

// DELETE /api/v1/boards/:id
router.delete('/:id', (req, res) => {
    const db = getDatabase();
    const boardId = req.params.id;
    
    db.run('DELETE FROM boards WHERE id = ?', [boardId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Board deleted successfully' });
    });
});

// POST /api/v1/boards/:id/columns
router.post('/:id/columns', (req, res) => {
    const db = getDatabase();
    const boardId = req.params.id;
    const { name, position, color } = req.body;
    
    db.run(
        'INSERT INTO board_columns (board_id, name, position, color) VALUES (?, ?, ?, ?)',
        [boardId, name, position || 0, color || null],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Column created successfully' });
        }
    );
});

// DELETE /api/v1/boards/columns/:id
router.delete('/columns/:id', (req, res) => {
    const db = getDatabase();
    const columnId = req.params.id;
    
    db.run('DELETE FROM board_columns WHERE id = ?', [columnId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Column deleted successfully' });
    });
});

// POST /api/v1/boards/columns/:id/cards
router.post('/columns/:id/cards', (req, res) => {
    const db = getDatabase();
    const columnId = req.params.id;
    const { contact_id, position } = req.body;
    
    // Check if contact already exists on this board
    db.get(
        `SELECT bc.id FROM board_cards bc
        JOIN board_columns bcol ON bc.board_column_id = bcol.id
        WHERE bcol.board_id = (SELECT board_id FROM board_columns WHERE id = ?)
        AND bc.contact_id = ?`,
        [columnId, contact_id],
        (err, existingCard) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (existingCard) {
                return res.status(400).json({ error: 'Contact already exists on this board' });
            }
            
            db.run(
                'INSERT INTO board_cards (board_column_id, contact_id, position) VALUES (?, ?, ?)',
                [columnId, contact_id, position || 0],
                function(err) {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    res.status(201).json({ id: this.lastID, message: 'Card created successfully' });
                }
            );
        }
    );
});

// PUT /api/v1/boards/cards/:id
router.put('/cards/:id', (req, res) => {
    const db = getDatabase();
    const cardId = req.params.id;
    const { board_column_id, position } = req.body;
    
    db.run(
        'UPDATE board_cards SET board_column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [board_column_id, position || 0, cardId],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: 'Card updated successfully' });
        }
    );
});

// DELETE /api/v1/boards/cards/:id
router.delete('/cards/:id', (req, res) => {
    const db = getDatabase();
    const cardId = req.params.id;
    
    db.run('DELETE FROM board_cards WHERE id = ?', [cardId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Card deleted successfully' });
    });
});

module.exports = router;

