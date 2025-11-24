// Clients List JavaScript

// Use existing API_BASE if defined, otherwise set it
if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = 'http://localhost:3000/api/v1';
}

let allClients = [];
let filteredClients = [];

// Load clients on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof loadClients === 'function') {
            loadClients();
        }
    });
} else {
    // DOM already loaded
    if (typeof loadClients === 'function') {
        loadClients();
    }
}

// Load clients from API
async function loadClients() {
    try {
        // Show loading state
        const table = document.getElementById('clientsTable');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('clientsTableBody');
        
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i> Loading clients...
                    </td>
                </tr>
            `;
        }
        
        const response = await fetch(`${window.API_BASE}/contacts/`);
        if (!response.ok) {
            throw new Error(`Failed to load clients: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Ensure we have an array
        allClients = Array.isArray(data) ? data : [];
        filteredClients = allClients;
        
        // Clear loading state
        if (tbody) {
            tbody.innerHTML = '';
        }
        
        if (allClients.length === 0) {
            // Show empty state, hide table
            if (table) table.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            // Show table, hide empty state
            if (table) table.style.display = 'table';
            if (emptyState) emptyState.style.display = 'none';
            renderClients();
        }
    } catch (error) {
        console.error('Error loading clients:', error);
        
        const table = document.getElementById('clientsTable');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('clientsTableBody');
        
        // Show error in table
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-state">
                        <i class="fas fa-exclamation-triangle"></i> Error loading clients: ${error.message}
                        <br><br>
                        <button class="btn btn-primary" onclick="loadClients()" style="margin-top: 12px;">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </td>
                </tr>
            `;
        }
        
        // Hide empty state on error
        if (emptyState) emptyState.style.display = 'none';
        if (table) table.style.display = 'table';
    }
}

// Render clients table
function renderClients() {
    const tbody = document.getElementById('clientsTableBody');
    
    if (filteredClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-state">
                    No clients match your search criteria
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredClients.map(client => {
        const displayName = client.display_name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client';
        const company = client.company || '-';
        const email = client.email || '-';
        const phone = client.main_phone || client.mobile_phone || '-';
        const status = client.status || 'Lead';
        const industry = client.industry || '-';
        
        return `
            <tr>
                <td class="client-name-cell" onclick="viewClient(${client.id})">
                    <div class="client-name">${escapeHtml(displayName)}</div>
                    ${client.first_name || client.last_name ? `<div class="client-display-name">${escapeHtml(`${client.first_name || ''} ${client.last_name || ''}`.trim())}</div>` : ''}
                </td>
                <td onclick="viewClient(${client.id})">${escapeHtml(company)}</td>
                <td onclick="viewClient(${client.id})">
                    <div>${escapeHtml(email)}</div>
                    ${phone !== '-' ? `<div style="font-size: 0.85rem; color: #64748b;">${escapeHtml(phone)}</div>` : ''}
                </td>
                <td onclick="viewClient(${client.id})">
                    <span class="status-badge ${status.replace(/\s+/g, '')}">${escapeHtml(status)}</span>
                </td>
                <td onclick="viewClient(${client.id})">${escapeHtml(industry)}</td>
                <td>
                    <div class="client-actions-menu" onclick="event.stopPropagation()">
                        <button class="menu-trigger" onclick="toggleClientMenu(${client.id}, event)" title="More actions">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="client-menu-dropdown" id="clientMenu${client.id}">
                            <a href="#" class="menu-item" onclick="viewClient(${client.id}); return false;">
                                <i class="fas fa-eye"></i>
                                <span>View Details</span>
                            </a>
                            <a href="#" class="menu-item" onclick="editClient(${client.id}); return false;">
                                <i class="fas fa-edit"></i>
                                <span>Edit</span>
                            </a>
                            <a href="#" class="menu-item" onclick="duplicateClient(${client.id}); return false;">
                                <i class="fas fa-copy"></i>
                                <span>Duplicate</span>
                            </a>
                            <div class="menu-divider"></div>
                            <a href="#" class="menu-item menu-item-danger" onclick="deleteClient(${client.id}); return false;">
                                <i class="fas fa-trash"></i>
                                <span>Delete</span>
                            </a>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter clients
function filterClients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const industryFilter = document.getElementById('industryFilter').value;
    
    filteredClients = allClients.filter(client => {
        const displayName = (client.display_name || `${client.first_name || ''} ${client.last_name || ''}`).toLowerCase();
        const company = (client.company || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = ((client.main_phone || '') + (client.mobile_phone || '')).toLowerCase();
        
        const matchesSearch = !searchTerm || 
            displayName.includes(searchTerm) ||
            company.includes(searchTerm) ||
            email.includes(searchTerm) ||
            phone.includes(searchTerm);
        
        const matchesStatus = !statusFilter || client.status === statusFilter;
        const matchesIndustry = !industryFilter || client.industry === industryFilter;
        
        return matchesSearch && matchesStatus && matchesIndustry;
    });
    
    renderClients();
}

// View client
function viewClient(clientId) {
    window.location.href = `/clients/${clientId}`;
}

// Toggle client menu
function toggleClientMenu(clientId, event) {
    event.stopPropagation();
    
    // Close all other menus
    document.querySelectorAll('.client-menu-dropdown').forEach(menu => {
        if (menu.id !== `clientMenu${clientId}`) {
            menu.classList.remove('show');
        }
    });
    
    // Toggle current menu
    const menu = document.getElementById(`clientMenu${clientId}`);
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Close menus when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.client-actions-menu')) {
        document.querySelectorAll('.client-menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Edit client
async function editClient(clientId) {
    // Close menu
    document.querySelectorAll('.client-menu-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
    
    try {
        // Fetch client data
        const response = await fetch(`${window.API_BASE}/contacts/${clientId}`);
        if (!response.ok) throw new Error('Failed to load client');
        
        const client = await response.json();
        
        // Populate form with client data
        document.getElementById('modalFirstName').value = client.first_name || '';
        document.getElementById('modalLastName').value = client.last_name || '';
        document.getElementById('modalCompany').value = client.company || '';
        document.getElementById('modalDisplayName').value = client.display_name || '';
        document.getElementById('modalEmail').value = client.email || '';
        document.getElementById('modalWebsite').value = client.website || '';
        document.getElementById('modalMainPhone').value = client.main_phone || '';
        document.getElementById('modalMobilePhone').value = client.mobile_phone || '';
        document.getElementById('modalWorkPhone').value = client.work_phone || '';
        document.getElementById('modalFax').value = client.fax || '';
        document.getElementById('modalAddress1').value = client.address_line_1 || '';
        document.getElementById('modalAddress2').value = client.address_line_2 || '';
        document.getElementById('modalPostalCode').value = client.postal_code || '';
        document.getElementById('modalCity').value = client.city || '';
        document.getElementById('modalState').value = client.state || '';
        document.getElementById('modalIndustryType').value = client.industry || '';
        document.getElementById('modalTextingOptOut').checked = false; // Add this field if needed
        
        // Set edit mode
        const modal = document.getElementById('createContactModal');
        const form = document.getElementById('createContactForm');
        const header = modal.querySelector('.modal-header h2');
        const submitBtn = modal.querySelector('.btn-modal-primary');
        
        form.dataset.editMode = 'true';
        form.dataset.clientId = clientId;
        header.textContent = 'Edit Contact';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Contact';
        
        // Open modal
        if (typeof openCreateContactModal === 'function') {
            openCreateContactModal();
        } else {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error loading client:', error);
        alert('Error loading client: ' + error.message);
    }
}

// Duplicate client
async function duplicateClient(clientId) {
    // Close menu
    document.querySelectorAll('.client-menu-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
    
    try {
        // Fetch client data
        const response = await fetch(`${window.API_BASE}/contacts/${clientId}`);
        if (!response.ok) throw new Error('Failed to load client');
        
        const client = await response.json();
        
        // Create new client with same data but new display name
        const duplicateData = {
            first_name: client.first_name,
            last_name: client.last_name,
            display_name: `${client.display_name} (Copy)`,
            company: client.company,
            email: client.email,
            website: client.website,
            main_phone: client.main_phone,
            mobile_phone: client.mobile_phone,
            work_phone: client.work_phone,
            fax: client.fax,
            address_line_1: client.address_line_1,
            address_line_2: client.address_line_2,
            city: client.city,
            state: client.state,
            postal_code: client.postal_code,
            industry: client.industry,
            status: 'Lead',
            custom_fields: JSON.stringify({})
        };
        
        const createResponse = await fetch(`${window.API_BASE}/contacts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicateData)
        });
        
        if (!createResponse.ok) throw new Error('Failed to duplicate client');
        
        alert('Client duplicated successfully!');
        loadClients();
    } catch (error) {
        console.error('Error duplicating client:', error);
        alert('Error duplicating client: ' + error.message);
    }
}

// Delete client
async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`${window.API_BASE}/contacts/${clientId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete client');
        
        alert('Client deleted successfully');
        loadClients();
    } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client: ' + error.message);
    }
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load clients on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadClients();
    });
} else {
    // DOM already loaded
    loadClients();
}

// Make functions globally available
window.loadClients = loadClients;
window.filterClients = filterClients;
window.viewClient = viewClient;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.duplicateClient = duplicateClient;
window.toggleClientMenu = toggleClientMenu;

