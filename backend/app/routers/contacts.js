// Contacts Router
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');

// GET /api/v1/contacts/
router.get('/', (req, res) => {
    const db = getDatabase();
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Database error fetching contacts:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Handle empty result
        if (!rows || rows.length === 0) {
            return res.json([]);
        }
        
        // Parse custom_fields safely
        const contacts = rows.map(row => {
            try {
                return {
                    ...row,
                    custom_fields: row.custom_fields ? JSON.parse(row.custom_fields) : {}
                };
            } catch (parseError) {
                console.warn('Error parsing custom_fields for contact', row.id, parseError);
                return {
                    ...row,
                    custom_fields: {}
                };
            }
        });
        
        res.json(contacts);
    });
});

// GET /api/v1/contacts/:id
router.get('/:id', (req, res) => {
    const db = getDatabase();
    const contactId = req.params.id;
    db.get('SELECT * FROM contacts WHERE id = ?', [contactId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({
            ...row,
            custom_fields: row.custom_fields ? JSON.parse(row.custom_fields) : {}
        });
    });
});

// POST /api/v1/contacts/
router.post('/', (req, res) => {
    const db = getDatabase();
    const {
        first_name, last_name, display_name, company, email, website, main_phone, mobile_phone, work_phone, fax,
        address_line_1, address_line_2, city, state, postal_code, country,
        client_type, industry, status, lead_source, description, notes,
        current_website_url, current_website_platform, website_goals, target_audience,
        brand_colors, brand_fonts, brand_guidelines_url, project_budget_range, timeline_preference,
        social_media_platforms, content_goals, posting_frequency_preference, content_style_preference,
        brand_voice_description, preferred_communication_method, custom_fields
    } = req.body;
    
    const customFieldsJson = custom_fields ? (typeof custom_fields === 'string' ? custom_fields : JSON.stringify(custom_fields)) : null;
    
    db.run(
        `INSERT INTO contacts (
            first_name, last_name, display_name, company, email, website, main_phone, mobile_phone, work_phone, fax,
            address_line_1, address_line_2, city, state, postal_code, country,
            client_type, industry, status, lead_source, description, notes,
            current_website_url, current_website_platform, website_goals, target_audience,
            brand_colors, brand_fonts, brand_guidelines_url, project_budget_range, timeline_preference,
            social_media_platforms, content_goals, posting_frequency_preference, content_style_preference,
            brand_voice_description, preferred_communication_method, custom_fields
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            first_name, last_name, display_name, company, email, website, main_phone, mobile_phone, work_phone, fax,
            address_line_1, address_line_2, city, state, postal_code, country,
            client_type, industry, status || 'Lead', lead_source, description, notes,
            current_website_url, current_website_platform, website_goals, target_audience,
            brand_colors, brand_fonts, brand_guidelines_url, project_budget_range, timeline_preference,
            social_media_platforms, content_goals, posting_frequency_preference, content_style_preference,
            brand_voice_description, preferred_communication_method, customFieldsJson
        ],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Client created successfully' });
        }
    );
});

// PUT /api/v1/contacts/:id
router.put('/:id', (req, res) => {
    const db = getDatabase();
    const contactId = req.params.id;
    const {
        first_name, last_name, display_name, company, email, website, main_phone, mobile_phone, work_phone, fax,
        address_line_1, address_line_2, city, state, postal_code, country,
        client_type, industry, status, lead_source, description, notes,
        current_website_url, current_website_platform, website_goals, target_audience,
        brand_colors, brand_fonts, brand_guidelines_url, project_budget_range, timeline_preference,
        social_media_platforms, content_goals, posting_frequency_preference, content_style_preference,
        brand_voice_description, preferred_communication_method, custom_fields
    } = req.body;
    
    const customFieldsJson = custom_fields ? (typeof custom_fields === 'string' ? custom_fields : JSON.stringify(custom_fields)) : null;
    
    db.run(
        `UPDATE contacts SET
            first_name = ?, last_name = ?, display_name = ?, company = ?, email = ?, website = ?, 
            main_phone = ?, mobile_phone = ?, work_phone = ?, fax = ?,
            address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, postal_code = ?, country = ?,
            client_type = ?, industry = ?, status = ?, lead_source = ?, description = ?, notes = ?,
            current_website_url = ?, current_website_platform = ?, website_goals = ?, target_audience = ?,
            brand_colors = ?, brand_fonts = ?, brand_guidelines_url = ?, project_budget_range = ?, timeline_preference = ?,
            social_media_platforms = ?, content_goals = ?, posting_frequency_preference = ?, content_style_preference = ?,
            brand_voice_description = ?, preferred_communication_method = ?, custom_fields = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
            first_name, last_name, display_name, company, email, website, main_phone, mobile_phone, work_phone, fax,
            address_line_1, address_line_2, city, state, postal_code, country,
            client_type, industry, status, lead_source, description, notes,
            current_website_url, current_website_platform, website_goals, target_audience,
            brand_colors, brand_fonts, brand_guidelines_url, project_budget_range, timeline_preference,
            social_media_platforms, content_goals, posting_frequency_preference, content_style_preference,
            brand_voice_description, preferred_communication_method, customFieldsJson,
            contactId
        ],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: 'Contact updated successfully' });
        }
    );
});

// DELETE /api/v1/contacts/:id
router.delete('/:id', (req, res) => {
    const db = getDatabase();
    const contactId = req.params.id;
    
    db.run('DELETE FROM contacts WHERE id = ?', [contactId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Contact deleted successfully' });
    });
});

module.exports = router;

