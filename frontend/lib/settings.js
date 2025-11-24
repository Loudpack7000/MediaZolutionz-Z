// Settings JavaScript

let fields = [];
let editingFieldId = null;
const API_BASE = 'http://localhost:3000/api/v1';

// Load fields on page load
document.addEventListener('DOMContentLoaded', () => {
    setupProfileForm();
    setupFormHandlers();
    
    // Load profile tab by default
    showProfileTab();
});

// Load fields from API
async function loadFields() {
    try {
        const response = await fetch(`${API_BASE}/contact-fields/`);
        if (!response.ok) throw new Error('Failed to load fields');
        
        fields = await response.json();
        renderFieldsTable();
    } catch (error) {
        console.error('Error loading fields:', error);
        showNotification('Error loading fields', 'error');
    }
}

// Render fields table
function renderFieldsTable() {
    const tbody = document.getElementById('fieldsTableBody');
    
    if (fields.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-message">
                        <i class="fas fa-database"></i>
                        <p>No fields defined yet. Click "Add Field" to create your first custom field.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = fields.map(field => `
        <tr>
            <td class="field-name-cell">
                <span class="field-name">${escapeHtml(field.name)}</span>
                <span class="field-key">${escapeHtml(field.field_key)}</span>
            </td>
            <td>
                <span class="type-badge">${escapeHtml(field.field_type)}</span>
            </td>
            <td>
                <span class="section-name">${formatSectionName(field.section)}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editField(${field.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteField(${field.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Format section name
function formatSectionName(section) {
    return section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Generate field key from name
function generateFieldKey(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

// Update field key when name changes
function updateFieldKey() {
    const nameInput = document.getElementById('fieldName');
    const keyInput = document.getElementById('fieldKey');
    
    if (!editingFieldId && nameInput.value) {
        keyInput.value = generateFieldKey(nameInput.value);
    }
}

// Toggle options field based on field type
function toggleOptionsField() {
    const fieldType = document.getElementById('fieldType').value;
    const optionsGroup = document.getElementById('optionsGroup');
    const optionsInput = document.getElementById('fieldOptions');
    
    if (fieldType === 'dropdown' || fieldType === 'multiselect') {
        optionsGroup.style.display = 'block';
        optionsInput.required = true;
    } else {
        optionsGroup.style.display = 'none';
        optionsInput.required = false;
        optionsInput.value = '';
    }
}

// Open add field form
function openAddFieldForm() {
    editingFieldId = null;
    document.getElementById('fieldForm').reset();
    document.getElementById('fieldFormContainer').style.display = 'block';
    document.getElementById('fieldKey').readOnly = false;
    document.getElementById('fieldSubmitBtn').textContent = 'Create Field';
    toggleOptionsField();
    
    // Scroll to form
    document.getElementById('fieldFormContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Cancel field form
function cancelFieldForm() {
    editingFieldId = null;
    document.getElementById('fieldForm').reset();
    document.getElementById('fieldFormContainer').style.display = 'none';
}

// Edit field
function editField(fieldId) {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    
    editingFieldId = fieldId;
    document.getElementById('fieldName').value = field.name;
    document.getElementById('fieldKey').value = field.field_key;
    document.getElementById('fieldKey').readOnly = true;
    document.getElementById('fieldType').value = field.field_type;
    document.getElementById('fieldSection').value = field.section;
    document.getElementById('fieldPlaceholder').value = field.placeholder || '';
    document.getElementById('fieldHelpText').value = field.help_text || '';
    document.getElementById('fieldRequired').checked = field.is_required;
    
    if (field.options && Array.isArray(field.options)) {
        document.getElementById('fieldOptions').value = field.options.join(', ');
    } else {
        document.getElementById('fieldOptions').value = '';
    }
    
    toggleOptionsField();
    document.getElementById('fieldFormContainer').style.display = 'block';
    document.getElementById('fieldSubmitBtn').textContent = 'Update Field';
    
    document.getElementById('fieldFormContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Delete field
async function deleteField(fieldId) {
    if (!confirm('Are you sure you want to delete this field?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/contact-fields/${fieldId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete field');
        
        showNotification('Field deleted successfully', 'success');
        loadFields();
    } catch (error) {
        console.error('Error deleting field:', error);
        showNotification('Error deleting field', 'error');
    }
}

// Setup profile form handler
function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
        });
    }
}

// Setup form handlers
function setupFormHandlers() {
    const fieldForm = document.getElementById('fieldForm');
    if (!fieldForm) return;
    
    fieldForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('fieldName').value,
            field_key: document.getElementById('fieldKey').value,
            field_type: document.getElementById('fieldType').value,
            section: document.getElementById('fieldSection').value,
            placeholder: document.getElementById('fieldPlaceholder').value || null,
            help_text: document.getElementById('fieldHelpText').value || null,
            is_required: document.getElementById('fieldRequired').checked
        };
        
        const optionsValue = document.getElementById('fieldOptions').value;
        if (optionsValue) {
            formData.options = optionsValue.split(',').map(opt => opt.trim()).filter(opt => opt);
        }
        
        try {
            let response;
            if (editingFieldId) {
                response = await fetch(`${API_BASE}/contact-fields/${editingFieldId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_BASE}/contact-fields/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save field');
            }
            
            showNotification(
                editingFieldId ? 'Field updated successfully' : 'Field created successfully',
                'success'
            );
            
            cancelFieldForm();
            loadFields();
        } catch (error) {
            console.error('Error saving field:', error);
            showNotification(error.message || 'Error saving field', 'error');
        }
    });
}

// Tab switching functions
function showProfileTab() {
    document.getElementById('profileTab').style.display = 'block';
    document.getElementById('teamMembersTab').style.display = 'none';
    document.getElementById('contactFieldsTab').style.display = 'none';
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('a[href="#profile"]').classList.add('active');
    
    // Load profile data
    loadProfile();
}

// Load team members
async function loadTeamMembers() {
    try {
        const tbody = document.getElementById('teamMembersTableBody');
        
        // Show loading state
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-message">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading team members...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        const response = await fetch(`${API_BASE}/users/`);
        if (!response.ok) {
            throw new Error(`Failed to load team members: ${response.status} ${response.statusText}`);
        }
        
        const users = await response.json();
        
        // Clear loading state
        if (tbody) {
            if (users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-message">
                                <i class="fas fa-users"></i>
                                <p>No team members found.</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = users.map(user => {
                    const fullName = user.full_name || 'N/A';
                    const email = user.email || 'N/A';
                    const username = user.username || 'N/A';
                    const role = user.role || 'user';
                    const status = user.is_active ? 'Active' : 'Inactive';
                    const statusClass = user.is_active ? 'status-active' : 'status-inactive';
                    const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
                    
                    return `
                        <tr>
                            <td><strong>${escapeHtml(fullName)}</strong></td>
                            <td>${escapeHtml(email)}</td>
                            <td>${escapeHtml(username)}</td>
                            <td><span class="role-badge role-${role}">${escapeHtml(role)}</span></td>
                            <td><span class="status-badge ${statusClass}">${escapeHtml(status)}</span></td>
                            <td>${escapeHtml(joinedDate)}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error loading team members:', error);
        const tbody = document.getElementById('teamMembersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Error loading team members: ${escapeHtml(error.message)}</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

function showTeamMembersTab() {
    document.getElementById('profileTab').style.display = 'none';
    document.getElementById('teamMembersTab').style.display = 'block';
    document.getElementById('contactFieldsTab').style.display = 'none';
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('a[href="#team-members"]').classList.add('active');
    
    // Load team members
    loadTeamMembers();
}

function showContactFieldsTab() {
    document.getElementById('profileTab').style.display = 'none';
    document.getElementById('teamMembersTab').style.display = 'none';
    document.getElementById('contactFieldsTab').style.display = 'block';
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    const fieldsLink = document.querySelector('a[href="#contact-fields"]');
    if (fieldsLink) fieldsLink.classList.add('active');
    
    // Load fields if not already loaded
    if (typeof loadFields === 'function') {
        loadFields();
    }
}

// Load profile data
async function loadProfile() {
    try {
        // Get user email from localStorage
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        
        if (userEmail) {
            document.getElementById('profileEmail').value = userEmail;
        }
        
        // Load saved profile from localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                if (document.getElementById('profileFirstName')) document.getElementById('profileFirstName').value = profile.first_name || '';
                if (document.getElementById('profileLastName')) document.getElementById('profileLastName').value = profile.last_name || '';
                if (document.getElementById('profilePhone')) document.getElementById('profilePhone').value = profile.phone || '';
                if (document.getElementById('profileCompany')) document.getElementById('profileCompany').value = profile.company || '';
                if (document.getElementById('profileJobTitle')) document.getElementById('profileJobTitle').value = profile.job_title || '';
                if (document.getElementById('profileWebsite')) document.getElementById('profileWebsite').value = profile.website || '';
                if (document.getElementById('profileAddress1')) document.getElementById('profileAddress1').value = profile.address_line_1 || '';
                if (document.getElementById('profileAddress2')) document.getElementById('profileAddress2').value = profile.address_line_2 || '';
                if (document.getElementById('profileCity')) document.getElementById('profileCity').value = profile.city || '';
                if (document.getElementById('profileState')) document.getElementById('profileState').value = profile.state || '';
                if (document.getElementById('profileZip')) document.getElementById('profileZip').value = profile.zip_code || '';
                if (document.getElementById('profileTimezone')) document.getElementById('profileTimezone').value = profile.timezone || '';
                if (document.getElementById('profileEmailNotifications')) document.getElementById('profileEmailNotifications').checked = profile.email_notifications || false;
                if (document.getElementById('profileAss')) document.getElementById('profileAss').checked = profile.ass || false;
                if (document.getElementById('profileTitties')) document.getElementById('profileTitties').checked = profile.titties || false;
            } catch (e) {
                console.error('Error loading saved profile:', e);
            }
        }
        
        // TODO: Fetch full profile from API when backend endpoint is ready
        // const response = await fetch(`${API_BASE}/users/me`);
        // if (response.ok) {
        //     const profile = await response.json();
        //     // Populate form fields
        // }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Save profile
async function saveProfile() {
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);
    
    const profileData = {
        first_name: formData.get('firstName') || null,
        last_name: formData.get('lastName') || null,
        email: formData.get('email'),
        phone: formData.get('phone') || null,
        company: formData.get('company') || null,
        job_title: formData.get('jobTitle') || null,
        website: formData.get('website') || null,
        address_line_1: formData.get('addressLine1') || null,
        address_line_2: formData.get('addressLine2') || null,
        city: formData.get('city') || null,
        state: formData.get('state') || null,
        zip_code: formData.get('zipCode') || null,
        timezone: formData.get('timezone') || null,
        email_notifications: formData.get('emailNotifications') === 'on',
        ass: formData.get('ass') === 'on',
        titties: formData.get('titties') === 'on'
    };
    
    try {
        // TODO: Update when backend endpoint is ready
        // const response = await fetch(`${API_BASE}/users/me`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(profileData)
        // });
        
        // For now, just save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        localStorage.setItem('userEmail', profileData.email);
        
        showNotification('Profile saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple alert for now - can be enhanced with toast notifications
    alert(message);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.showProfileTab = showProfileTab;
window.showTeamMembersTab = showTeamMembersTab;
window.showContactFieldsTab = showContactFieldsTab;

