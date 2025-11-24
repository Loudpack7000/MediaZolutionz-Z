// Contact Fields Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// Helper function to generate field key from name
function generateFieldKey(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

// GET /api/v1/contact-fields/
router.get('/', (req, res) => {
    const db = getDatabase();
    const includeInactive = req.query.include_inactive === 'true';
    const query = includeInactive 
        ? 'SELECT * FROM contact_field_definitions ORDER BY display_order, name'
        : 'SELECT * FROM contact_field_definitions WHERE is_active = 1 ORDER BY display_order, name';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const fields = rows.map(row => ({
            ...row,
            is_required: Boolean(row.is_required),
            is_active: Boolean(row.is_active),
            options: row.options ? JSON.parse(row.options) : null
        }));
        res.json(fields);
    });
});

// POST /api/v1/contact-fields/
router.post('/', (req, res) => {
    const db = getDatabase();
    const { name, field_key, field_type, is_required, section, display_order, options, placeholder, help_text } = req.body;
    
    const finalFieldKey = field_key || generateFieldKey(name);
    const optionsJson = options ? JSON.stringify(options) : null;
    
    db.run(
        `INSERT INTO contact_field_definitions 
        (name, field_key, field_type, is_required, section, display_order, options, placeholder, help_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, finalFieldKey, field_type, is_required ? 1 : 0, section || 'custom', display_order || 0, optionsJson, placeholder, help_text],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Field created successfully' });
        }
    );
});

// PUT /api/v1/contact-fields/:id
router.put('/:id', (req, res) => {
    const db = getDatabase();
    const { name, field_type, is_required, section, display_order, options, placeholder, help_text } = req.body;
    const fieldId = req.params.id;
    
    const optionsJson = options ? JSON.stringify(options) : null;
    
    db.run(
        `UPDATE contact_field_definitions 
        SET name = ?, field_type = ?, is_required = ?, section = ?, display_order = ?, 
            options = ?, placeholder = ?, help_text = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [name, field_type, is_required ? 1 : 0, section, display_order || 0, optionsJson, placeholder, help_text, fieldId],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: 'Field updated successfully' });
        }
    );
});

// DELETE /api/v1/contact-fields/:id
router.delete('/:id', (req, res) => {
    const db = getDatabase();
    const fieldId = req.params.id;
    
    db.run('DELETE FROM contact_field_definitions WHERE id = ?', [fieldId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Field deleted successfully' });
    });
});

// POST /api/v1/contact-fields/apply-template
router.post('/apply-template', (req, res) => {
    const db = getDatabase();
    const { template_name } = req.body;
    
    if (template_name === 'roofing_adjusting') {
        const roofingFields = [
            { name: 'PA Contract', field_key: 'pa_contract', field_type: 'dropdown', section: 'industry_specific', options: ['Yes', 'No'] },
            { name: 'Work Types', field_key: 'work_types', field_type: 'multiselect', section: 'industry_specific', options: ['Roof', 'Siding', 'Gutter', 'Window/Screen', 'Interior'] },
            { name: 'Roof Type', field_key: 'roof_type', field_type: 'dropdown', section: 'industry_specific', options: ['3-Tab', 'Architectural', 'Flat Roof', 'Other', 'Wood Shake'] },
            { name: 'Insurance Carrier', field_key: 'insurance_carrier', field_type: 'text', section: 'industry_specific' },
            { name: 'Policy Number', field_key: 'policy_number', field_type: 'text', section: 'industry_specific' },
            { name: 'Claim Number', field_key: 'claim_number', field_type: 'text', section: 'industry_specific' },
            { name: 'Date of Loss', field_key: 'date_of_loss', field_type: 'date', section: 'industry_specific' },
            { name: 'Date of Filing', field_key: 'date_of_filing', field_type: 'date', section: 'industry_specific' },
            { name: 'Deductible', field_key: 'deductible', field_type: 'number', section: 'industry_specific' },
            { name: 'Code Upgrade', field_key: 'code_upgrade', field_type: 'text', section: 'industry_specific' },
            { name: 'Desk Adjuster Name', field_key: 'desk_adjuster_name', field_type: 'text', section: 'industry_specific' },
            { name: 'Desk Adjuster Phone', field_key: 'desk_adjuster_phone', field_type: 'phone', section: 'industry_specific' },
            { name: 'Due Time', field_key: 'due_time', field_type: 'datetime', section: 'industry_specific' }
        ];
        
        let inserted = 0;
        let skipped = 0;
        
        roofingFields.forEach((field, index) => {
            db.get('SELECT id FROM contact_field_definitions WHERE field_key = ?', [field.field_key], (err, row) => {
                if (!row) {
                    const optionsJson = field.options ? JSON.stringify(field.options) : null;
                    db.run(
                        `INSERT INTO contact_field_definitions 
                        (name, field_key, field_type, section, display_order, options)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [field.name, field.field_key, field.field_type, field.section, index, optionsJson],
                        function() {
                            inserted++;
                            if (inserted + skipped === roofingFields.length) {
                                res.json({ message: `Template applied: ${inserted} fields added, ${skipped} skipped` });
                            }
                        }
                    );
                } else {
                    skipped++;
                    if (inserted + skipped === roofingFields.length) {
                        res.json({ message: `Template applied: ${inserted} fields added, ${skipped} skipped` });
                    }
                }
            });
        });
    } else {
        res.status(400).json({ error: 'Unknown template name' });
    }
});

module.exports = router;

