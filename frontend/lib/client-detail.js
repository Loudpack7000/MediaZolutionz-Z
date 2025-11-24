// Client Detail JavaScript

const API_BASE = 'http://localhost:3000/api/v1';
let currentClientId = null;
let currentClient = null;

// Check authentication and hide Boards if not logged in
function checkAuthAndHideBoards() {
    // Simple check - in production, use actual session/auth check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
    
    const boardsNavItem = document.getElementById('boardsNavItem');
    if (boardsNavItem) {
        boardsNavItem.style.display = isLoggedIn ? 'block' : 'none';
    }
    
    // Also check in other pages
    document.querySelectorAll('[href="/boards.html"], [href="boards.html"]').forEach(link => {
        if (!isLoggedIn) {
            link.closest('.nav-item')?.style.setProperty('display', 'none');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndHideBoards();
    const clientId = window.location.pathname.split('/').pop();
    currentClientId = clientId;
    loadClientDetails();
    loadStats();
    setupTabSwitching();
    setupActivityForm();
});

// Load client details
async function loadClientDetails() {
    try {
        const response = await fetch(`${API_BASE}/contacts/${currentClientId}`);
        if (!response.ok) throw new Error('Failed to load client');
        
        currentClient = await response.json();
        renderClientInfo();
    } catch (error) {
        console.error('Error loading client:', error);
        alert('Error loading client: ' + error.message);
    }
}

// Render client information
function renderClientInfo() {
    if (!currentClient) return;
    
    // Header
    document.getElementById('clientDisplayName').textContent = currentClient.display_name || 
        `${currentClient.first_name || ''} ${currentClient.last_name || ''}`.trim() || 'Unnamed Client';
    
    const statusBadge = document.getElementById('clientStatus');
    statusBadge.textContent = currentClient.status || 'Lead';
    statusBadge.className = `status-badge ${(currentClient.status || 'Lead').replace(/\s+/g, '')}`;
    
    document.getElementById('clientCompany').textContent = currentClient.company || '-';
    document.getElementById('clientIndustry').textContent = currentClient.industry || '-';
    
    // Overview Tab Info
    document.getElementById('infoEmail').textContent = currentClient.email || '-';
    document.getElementById('infoPhone').textContent = currentClient.main_phone || currentClient.mobile_phone || '-';
    document.getElementById('infoWebsite').innerHTML = currentClient.website ? 
        `<a href="${currentClient.website}" target="_blank">${currentClient.website}</a>` : '-';
    
    const addressParts = [
        currentClient.address_line_1,
        currentClient.address_line_2,
        currentClient.city,
        currentClient.state,
        currentClient.postal_code,
        currentClient.country
    ].filter(Boolean);
    document.getElementById('infoAddress').textContent = addressParts.length > 0 ? addressParts.join(', ') : '-';
    
    document.getElementById('infoClientType').textContent = currentClient.client_type || '-';
    document.getElementById('infoIndustry').textContent = currentClient.industry || '-';
    document.getElementById('infoLeadSource').textContent = currentClient.lead_source || '-';
    document.getElementById('infoCommunication').textContent = currentClient.preferred_communication_method || '-';
    
    // Website Design
    if (currentClient.current_website_url || currentClient.current_website_platform) {
        document.getElementById('infoCurrentWebsite').innerHTML = currentClient.current_website_url ? 
            `<a href="${currentClient.current_website_url}" target="_blank">${currentClient.current_website_url}</a>` : '-';
        document.getElementById('infoPlatform').textContent = currentClient.current_website_platform || '-';
        document.getElementById('infoBudget').textContent = currentClient.project_budget_range || '-';
        document.getElementById('infoTimeline').textContent = currentClient.timeline_preference || '-';
    } else {
        document.getElementById('websiteCard').style.display = 'none';
    }
    
    // Social Media
    if (currentClient.social_media_platforms) {
        try {
            const platforms = JSON.parse(currentClient.social_media_platforms);
            document.getElementById('infoPlatforms').textContent = platforms.length > 0 ? platforms.join(', ') : '-';
        } catch (e) {
            document.getElementById('infoPlatforms').textContent = '-';
        }
        document.getElementById('infoPostingFreq').textContent = currentClient.posting_frequency_preference || '-';
        document.getElementById('infoContentStyle').textContent = currentClient.content_style_preference || '-';
    } else {
        document.getElementById('socialCard').style.display = 'none';
    }
    
    // Notes
    document.getElementById('clientDescription').textContent = currentClient.description || 'No description provided.';
    document.getElementById('clientNotes').textContent = currentClient.notes || 'No notes yet.';
}

// Load stats
async function loadStats() {
    try {
        // Load projects count
        const projectsResponse = await fetch(`${API_BASE}/projects/?client_id=${currentClientId}`);
        if (projectsResponse.ok) {
            const projects = await projectsResponse.json();
            document.getElementById('projectsCount').textContent = projects.length || 0;
        }
        
        // Load tasks count
        const tasksResponse = await fetch(`${API_BASE}/tasks/?client_id=${currentClientId}`);
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            document.getElementById('tasksCount').textContent = tasks.length || 0;
        }
        
        // Load activities count
        const activitiesResponse = await fetch(`${API_BASE}/activities/client/${currentClientId}`);
        if (activitiesResponse.ok) {
            const activities = await activitiesResponse.json();
            document.getElementById('activitiesCount').textContent = activities.length || 0;
        }
        
        // Load documents count
        const docsResponse = await fetch(`${API_BASE}/documents/client/${currentClientId}`);
        if (docsResponse.ok) {
            const docs = await docsResponse.json();
            document.getElementById('documentsCount').textContent = docs.length || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Tab switching
function setupTabSwitching() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Load tab data
    if (tabName === 'projects') loadProjects();
    if (tabName === 'tasks') loadTasks();
    if (tabName === 'activity') loadActivities();
    if (tabName === 'documents') loadDocuments();
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects/?client_id=${currentClientId}`);
        if (!response.ok) throw new Error('Failed to load projects');
        
        const projects = await response.json();
        const container = document.getElementById('projectsList');
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-folder"></i></div>
                    <h3>No Projects Yet</h3>
                    <p>Create your first project for this client</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = projects.map(project => `
            <div class="project-card" onclick="viewProject(${project.id})">
                <h3>${escapeHtml(project.name)}</h3>
                <p style="color: #64748b; margin: 8px 0;">${escapeHtml(project.description || 'No description')}</p>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <span class="status-badge ${(project.status || 'Planning').replace(/\s+/g, '')}">${escapeHtml(project.status || 'Planning')}</span>
                    <span style="color: #64748b; font-size: 0.9rem;">${project.project_type || '-'}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Load tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks/?client_id=${currentClientId}`);
        if (!response.ok) throw new Error('Failed to load tasks');
        
        const tasks = await response.json();
        const container = document.getElementById('tasksKanban');
        
        const columns = ['To Do', 'In Progress', 'Review', 'Completed'];
        const tasksByStatus = {};
        columns.forEach(col => tasksByStatus[col] = []);
        
        tasks.forEach(task => {
            const status = task.status || 'To Do';
            if (tasksByStatus[status]) {
                tasksByStatus[status].push(task);
            } else {
                tasksByStatus['To Do'].push(task);
            }
        });
        
        container.innerHTML = columns.map(column => `
            <div class="task-column">
                <div class="task-column-header">${column} (${tasksByStatus[column].length})</div>
                ${tasksByStatus[column].map(task => `
                    <div class="task-card" onclick="viewTask(${task.id})">
                        <div style="font-weight: 600; margin-bottom: 8px;">${escapeHtml(task.title)}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">${escapeHtml(task.description || '')}</div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Load activities
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE}/activities/client/${currentClientId}`);
        if (!response.ok) throw new Error('Failed to load activities');
        
        const activities = await response.json();
        const container = document.getElementById('activityTimeline');
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-history"></i></div>
                    <h3>No Activities Yet</h3>
                    <p>Start tracking communication with this client</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.reverse().map(activity => {
            const date = new Date(activity.created_at);
            return `
                <div class="activity-item">
                    <div class="activity-header">
                        <span class="activity-type">${escapeHtml(activity.activity_type)}</span>
                        <span class="activity-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
                    </div>
                    ${activity.subject ? `<div style="font-weight: 600; margin-bottom: 8px; color: #1e293b;">${escapeHtml(activity.subject)}</div>` : ''}
                    <div class="activity-content">${escapeHtml(activity.content)}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

// Load documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/documents/client/${currentClientId}`);
        if (!response.ok) throw new Error('Failed to load documents');
        
        const documents = await response.json();
        const container = document.getElementById('documentsList');
        
        if (documents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-file"></i></div>
                    <h3>No Documents Yet</h3>
                    <p>Upload documents to keep them organized</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = documents.map(doc => `
            <div class="document-card">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <i class="fas fa-file" style="font-size: 2rem; color: #667eea;"></i>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 4px;">${escapeHtml(doc.original_filename)}</h3>
                        <div style="font-size: 0.85rem; color: #64748b;">${doc.category || 'Uncategorized'}</div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">
                    ${formatFileSize(doc.file_size)} • ${new Date(doc.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Setup activity form
function setupActivityForm() {
    document.getElementById('activityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            activity_type: document.getElementById('activityType').value,
            subject: document.getElementById('activitySubject').value || null,
            content: document.getElementById('activityContent').value,
            client_id: currentClientId
        };
        
        try {
            const response = await fetch(`${API_BASE}/activities/client/${currentClientId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Failed to create activity');
            
            closeActivityModal();
            loadActivities();
            loadStats();
        } catch (error) {
            console.error('Error creating activity:', error);
            alert('Error creating activity: ' + error.message);
        }
    });
}

// Modal functions
function addActivity() {
    document.getElementById('activityModal').classList.add('show');
}

function closeActivityModal() {
    document.getElementById('activityModal').classList.remove('show');
    document.getElementById('activityForm').reset();
}

function createProject() {
    alert('Project creation coming soon!');
}

function createTask() {
    alert('Task creation coming soon!');
}

function uploadDocument() {
    alert('Document upload coming soon!');
}

function editClient() {
    alert('Client editing coming soon!');
}

function viewProject(id) {
    alert('Project detail page coming soon!');
}

function viewTask(id) {
    alert('Task detail coming soon!');
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('activityModal');
    if (e.target === modal) {
        closeActivityModal();
    }
});

