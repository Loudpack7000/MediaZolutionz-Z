// Boards API Integration JavaScript

// Use existing API_BASE if defined, otherwise set it
if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = 'http://localhost:3000/api/v1';
}
const API_BASE = window.API_BASE;
let boards = [];
let currentBoard = null;
let currentBoardId = null;
let allContacts = [];
let availableContacts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBoards();
    setupEventListeners();
});

// Load boards from API
async function loadBoards() {
    try {
        const response = await fetch(`${API_BASE}/boards/`);
        if (!response.ok) throw new Error('Failed to load boards');
        
        boards = await response.json();
        
        if (boards.length === 0) {
            document.getElementById('emptyState').classList.add('show');
            document.getElementById('boardsList').style.display = 'none';
        } else {
            document.getElementById('emptyState').classList.remove('show');
            document.getElementById('boardsList').style.display = 'grid';
            renderBoards();
        }
    } catch (error) {
        console.error('Error loading boards:', error);
        alert('Error loading boards: ' + error.message);
    }
}

// Render boards list
function renderBoards() {
    const boardsList = document.getElementById('boardsList');
    boardsList.innerHTML = '';

    boards.forEach(board => {
        const boardCard = document.createElement('div');
        boardCard.className = 'board-card';
        boardCard.onclick = () => openBoard(board.id);
        
        boardCard.innerHTML = `
            <div class="board-card-header">
                <div>
                    <h3 class="board-card-title">${escapeHtml(board.name)}</h3>
                    ${board.description ? `<p class="board-card-description">${escapeHtml(board.description)}</p>` : ''}
                </div>
                <div class="board-card-actions">
                    <button class="board-action-btn" onclick="event.stopPropagation(); editBoard(${board.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="board-action-btn" onclick="event.stopPropagation(); deleteBoard(${board.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="board-card-stats">
                <div class="board-stat">
                    <i class="fas fa-columns"></i>
                    <span>View Board</span>
                </div>
            </div>
        `;
        
        boardsList.appendChild(boardCard);
    });
}

// Open board view
async function openBoard(boardId) {
    try {
        const response = await fetch(`${API_BASE}/boards/${boardId}`);
        if (!response.ok) throw new Error('Failed to load board');
        
        currentBoard = await response.json();
        currentBoardId = boardId;
        
        document.getElementById('boardsList').parentElement.parentElement.style.display = 'none';
        document.getElementById('boardView').style.display = 'block';
        document.getElementById('boardViewTitle').textContent = currentBoard.name;
        
        renderKanbanBoard(currentBoard);
    } catch (error) {
        console.error('Error opening board:', error);
        alert('Error loading board: ' + error.message);
    }
}

// Render Kanban board
function renderKanbanBoard(board) {
    const kanbanBoard = document.getElementById('kanbanBoard');
    kanbanBoard.innerHTML = '';

    if (!board.columns || board.columns.length === 0) {
        // Show empty state with add column button
        handleEmptyBoard(board.id);
        return;
    }

    board.columns.forEach((column, index) => {
        const columnElement = createColumnElement(column, index);
        kanbanBoard.appendChild(columnElement);
    });

    // Add column button
    const addColumnBtn = document.createElement('div');
    addColumnBtn.className = 'add-column-btn';
    addColumnBtn.innerHTML = '<i class="fas fa-plus"></i> Add Column';
    addColumnBtn.onclick = () => addColumn(board.id);
    kanbanBoard.appendChild(addColumnBtn);

    setupDragAndDrop();
}

// Show add column prompt when board has no columns
async function handleEmptyBoard(boardId) {
    const kanbanBoard = document.getElementById('kanbanBoard');
    if (kanbanBoard) {
        kanbanBoard.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #475569;">
                <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.6; color: #94a3b8;">
                    <i class="fas fa-columns"></i>
                </div>
                <h2 style="color: #1e293b; margin-bottom: 12px; font-size: 1.5rem; font-weight: 700;">No Columns Yet</h2>
                <p style="color: #64748b; margin-bottom: 24px; font-size: 1rem;">Add your first column to get started</p>
                <button onclick="addColumn(${boardId})" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
                    <i class="fas fa-plus"></i> Add Column
                </button>
            </div>
        `;
    }
}

// Create column element
function createColumnElement(column, index) {
    // Column colors based on index (JobNimbus style)
    const columnColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];
    const columnColor = column.color || columnColors[index % columnColors.length];
    
    const columnDiv = document.createElement('div');
    columnDiv.className = 'kanban-column';
    columnDiv.dataset.columnId = column.id;
    columnDiv.dataset.columnIndex = index;
    
    const header = document.createElement('div');
    header.className = 'kanban-column-header';
    header.style.backgroundColor = columnColor;
    header.style.color = 'white';
    header.style.borderRadius = '12px 12px 0 0';
    header.style.padding = '16px 20px';
    header.style.margin = '0';
    header.innerHTML = `
        <div class="kanban-column-title" style="color: white;">
            <span>${escapeHtml(column.name)}</span>
            <span class="kanban-column-count" style="background: rgba(255,255,255,0.2); color: white;">Contacts: ${column.cards?.length || 0}</span>
        </div>
        <div class="kanban-column-actions">
            <div class="column-dropdown">
                <button class="column-action-btn" onclick="toggleColumnMenu(${column.id})">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="column-dropdown-menu" id="columnMenu${column.id}" style="display: none;">
                    <a href="#" onclick="event.preventDefault(); openAddContactModal(${column.id}); return false;">
                        <i class="fas fa-plus"></i> Add Card
                    </a>
                    <a href="#" onclick="event.preventDefault(); deleteColumn(${column.id}); return false;">
                        <i class="fas fa-trash"></i> Delete Column
                    </a>
                </div>
            </div>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'kanban-column-content';
    content.dataset.columnId = column.id;

    if (column.cards && column.cards.length > 0) {
        column.cards.forEach(card => {
            const cardElement = createCardElement(card, column.id);
            content.appendChild(cardElement);
        });
    }

    // Add Card button
    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card-btn';
    addCardBtn.innerHTML = '<i class="fas fa-plus"></i> Add Card';
    addCardBtn.onclick = () => openAddContactModal(column.id);
    content.appendChild(addCardBtn);

    columnDiv.appendChild(header);
    columnDiv.appendChild(content);

    return columnDiv;
}

// Create card element from contact
function createCardElement(card, columnId) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'kanban-card';
    cardDiv.draggable = true;
    cardDiv.dataset.cardId = card.id;
    cardDiv.dataset.columnId = columnId;
    cardDiv.dataset.contactId = card.contact_id;

    const contact = card;
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact';
    const initials = getInitials(contact.first_name, contact.last_name);

    // Get address info
    const address = contact.address_line_1 ? 
        `${contact.address_line_1}${contact.city ? ` - ${contact.city}` : ''}` : 
        (contact.email || '');
    
    // Get project type/industry
    const projectType = contact.industry || contact.client_type || '';
    
    cardDiv.innerHTML = `
        <div class="kanban-card-header">
            <div class="kanban-card-title">${escapeHtml(fullName)}</div>
            <button class="card-delete-btn" onclick="event.stopPropagation(); deleteCard(${card.id})" title="Delete">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
        ${address ? `<div class="kanban-card-address">${escapeHtml(address)}</div>` : ''}
        ${projectType ? `<div class="kanban-card-type">${escapeHtml(projectType)}</div>` : ''}
        <div class="kanban-card-footer">
            <div class="kanban-card-assignee">${initials}</div>
            ${contact.status ? `<span class="status-badge">${escapeHtml(contact.status)}</span>` : ''}
        </div>
    `;

    cardDiv.addEventListener('click', (e) => {
        if (!e.target.closest('.card-delete-btn')) {
            // Navigate to contact detail (can be implemented later)
            console.log('View contact:', contact.id);
        }
    });

    return cardDiv;
}

// Get initials from name
function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (first + last) || 'PM';
}

// Show boards list
function showBoardsList() {
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('boardsList').parentElement.parentElement.style.display = 'block';
    currentBoardId = null;
    currentBoard = null;
    loadBoards();
}

// Setup drag and drop
function setupDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-column-content');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.kanban-column-content').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (draggedElement !== null) {
        const targetColumn = this.closest('.kanban-column');
        const targetColumnId = parseInt(targetColumn.dataset.columnId);
        const cardId = parseInt(draggedElement.dataset.cardId);
        const sourceColumnId = parseInt(draggedElement.dataset.columnId);

        if (sourceColumnId !== targetColumnId) {
            await moveCard(cardId, sourceColumnId, targetColumnId);
            this.insertBefore(draggedElement, this.querySelector('.add-card-btn'));
            draggedElement.dataset.columnId = targetColumnId;
        }
    }

    return false;
}

// Move card between columns
async function moveCard(cardId, sourceColumnId, targetColumnId) {
    try {
        const response = await fetch(`${API_BASE}/boards/cards/${cardId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                board_column_id: targetColumnId,
                position: 0
            })
        });

        if (!response.ok) throw new Error('Failed to move card');
        
        await openBoard(currentBoardId);
    } catch (error) {
        console.error('Error moving card:', error);
        alert('Error moving card: ' + error.message);
    }
}

// Add Board Modal
function openAddBoardModal() {
    closeAllModals();
    const modal = document.getElementById('addBoardModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        // Focus on board name input
        setTimeout(() => {
            const nameInput = document.getElementById('boardName');
            if (nameInput) nameInput.focus();
        }, 100);
    } else {
        console.error('addBoardModal not found!');
    }
}

function closeAddBoardModal() {
    const modal = document.getElementById('addBoardModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    const form = document.getElementById('addBoardForm');
    if (form) {
        form.reset();
        // Re-enable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Board';
        }
    }
}

// Add Contact Modal
let selectedColumnId = null;

async function openAddContactModal(columnId) {
    selectedColumnId = columnId;
    closeAllModals();
    
    try {
        // Load all contacts
        const response = await fetch(`${API_BASE}/contacts/`);
        if (!response.ok) throw new Error('Failed to load contacts');
        
        allContacts = await response.json();
        
        // Get contacts already on this board
        const boardResponse = await fetch(`${API_BASE}/boards/${currentBoardId}`);
        if (!boardResponse.ok) throw new Error('Failed to load board');
        
        const board = await boardResponse.json();
        const existingContactIds = new Set();
        board.columns.forEach(col => {
            if (col.cards) {
                col.cards.forEach(card => {
                    existingContactIds.add(card.contact_id);
                });
            }
        });
        
        // Filter out contacts already on board
        availableContacts = allContacts.filter(contact => !existingContactIds.has(contact.id));
        
        renderContactsList();
        document.getElementById('addContactModal').classList.add('show');
    } catch (error) {
        console.error('Error loading contacts:', error);
        alert('Error loading contacts: ' + error.message);
    }
}

function closeAddContactModal() {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    const searchInput = document.getElementById('contactSearch');
    if (searchInput) searchInput.value = '';
    selectedColumnId = null;
}

// Add Task Modal (placeholder)
function openAddTaskModal() {
    closeAllModals();
    alert('Add Task functionality coming soon!');
}

function closeAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function renderContactsList(filteredContacts = null) {
    const contactsList = document.getElementById('contactsList');
    const contactsToShow = filteredContacts || availableContacts;
    
    if (contactsToShow.length === 0) {
        contactsList.innerHTML = `
            <div class="empty-state">
                <p>No available contacts. <a href="/contacts/new">Create a new contact</a></p>
            </div>
        `;
        return;
    }
    
    contactsList.innerHTML = contactsToShow.map(contact => {
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact';
        return `
            <div class="contact-item" onclick="addContactToBoard(${contact.id})">
                <div class="contact-item-info">
                    <div class="contact-item-name">${escapeHtml(fullName)}</div>
                    ${contact.email ? `<div class="contact-item-email">${escapeHtml(contact.email)}</div>` : ''}
                    ${contact.company ? `<div class="contact-item-company">${escapeHtml(contact.company)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function filterContacts() {
    const searchTerm = document.getElementById('contactSearch').value.toLowerCase();
    const filtered = availableContacts.filter(contact => {
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const company = (contact.company || '').toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm) || company.includes(searchTerm);
    });
    renderContactsList(filtered);
}

// Add contact to board
async function addContactToBoard(contactId) {
    if (!selectedColumnId) return;
    
    try {
        const response = await fetch(`${API_BASE}/boards/columns/${selectedColumnId}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contact_id: contactId,
                position: 0
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add contact');
        }
        
        closeAddContactModal();
        await openBoard(currentBoardId);
    } catch (error) {
        console.error('Error adding contact:', error);
        alert('Error adding contact: ' + error.message);
    }
}

// Delete card
async function deleteCard(cardId) {
    if (!confirm('Are you sure you want to remove this contact from the board?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/boards/cards/${cardId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete card');
        
        await openBoard(currentBoardId);
    } catch (error) {
        console.error('Error deleting card:', error);
        alert('Error deleting card: ' + error.message);
    }
}

// Add column
async function addColumn(boardId) {
    const columnName = prompt('Enter column name:');
    if (!columnName || !columnName.trim()) return;
    
    // Column colors for selection
    const columnColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
    const randomColor = columnColors[Math.floor(Math.random() * columnColors.length)];

    try {
        const response = await fetch(`${API_BASE}/boards/${boardId}/columns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: columnName.trim(),
                position: 999,
                color: randomColor
            })
        });

        if (!response.ok) throw new Error('Failed to create column');
        
        await openBoard(boardId);
    } catch (error) {
        console.error('Error adding column:', error);
        alert('Error adding column: ' + error.message);
    }
}

// Delete column
async function deleteColumn(columnId) {
    if (!confirm('Are you sure you want to delete this column? All cards in this column will be removed.')) return;
    
    try {
        const response = await fetch(`${API_BASE}/boards/columns/${columnId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete column');
        
        await openBoard(currentBoardId);
    } catch (error) {
        console.error('Error deleting column:', error);
        alert('Error deleting column: ' + error.message);
    }
}

// Delete board
async function deleteBoard(boardId) {
    if (!confirm('Are you sure you want to delete this board?')) return;

    try {
        const response = await fetch(`${API_BASE}/boards/${boardId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete board');
        
        loadBoards();
    } catch (error) {
        console.error('Error deleting board:', error);
        alert('Error deleting board: ' + error.message);
    }
}

// Edit board
function editBoard(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const newName = prompt('Enter new board name:', board.name);
    if (newName && newName !== board.name) {
        // Update board via API (can be implemented)
        alert('Board editing via API coming soon');
    }
}

// Toggle column menu
function toggleColumnMenu(columnId) {
    const menu = document.getElementById(`columnMenu${columnId}`);
    document.querySelectorAll('.column-dropdown-menu').forEach(m => {
        if (m.id !== `columnMenu${columnId}`) m.style.display = 'none';
    });
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Form submissions
document.getElementById('addBoardForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('boardName').value.trim();
    const description = document.getElementById('boardDescription').value.trim();

    if (!name) {
        alert('Please enter a board name');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        // Create board
        const response = await fetch(`${API_BASE}/boards/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create board');
        }
        
        const result = await response.json();
        const boardId = result.id;
        
        // Create default columns with colors (JobNimbus style)
        const defaultColumns = [
            { name: 'Sales', position: 0, color: '#3B82F6' },
            { name: 'Production', position: 1, color: '#10B981' },
            { name: 'Billing', position: 2, color: '#EF4444' },
            { name: 'Completed', position: 3, color: '#F59E0B' }
        ];

        for (const col of defaultColumns) {
            await fetch(`${API_BASE}/boards/${boardId}/columns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(col)
            });
        }
        
        closeAddBoardModal();
        
        // Reload boards list
        await loadBoards();
        
        // Optionally open the new board
        setTimeout(() => {
            openBoard(boardId);
        }, 500);
    } catch (error) {
        console.error('Error creating board:', error);
        alert('Error creating board: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    toggleAddMenu(false);
}

function toggleAddMenu(show) {
    const menu = document.getElementById('addMenu');
    if (show === undefined) {
        menu.classList.toggle('show');
    } else {
        menu.classList.toggle('show', show);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    document.getElementById('userMenuBtn')?.addEventListener('click', function(e) {
        e.stopPropagation();
        const menu = document.getElementById('userDropdown');
        menu.classList.toggle('show');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/';
        }
    });
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions to global scope for onclick handlers
window.openAddBoardModal = openAddBoardModal;
window.closeAddBoardModal = closeAddBoardModal;
window.openAddContactModal = openAddContactModal;
window.closeAddContactModal = closeAddContactModal;
window.openAddTaskModal = openAddTaskModal;
window.closeAddTaskModal = closeAddTaskModal;
window.openBoard = openBoard;
window.showBoardsList = showBoardsList;
window.deleteBoard = deleteBoard;
window.editBoard = editBoard;
window.addColumn = addColumn;
window.deleteColumn = deleteColumn;
window.toggleColumnMenu = toggleColumnMenu;
window.deleteCard = deleteCard;
window.toggleAddMenu = toggleAddMenu;

