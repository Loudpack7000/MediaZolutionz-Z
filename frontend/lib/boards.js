// Boards Management JavaScript

// Board data structure
let boards = JSON.parse(localStorage.getItem('boards')) || [];
let currentBoardId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBoards();
    setupEventListeners();
    setupDragAndDrop();
});

// Load boards from localStorage
function loadBoards() {
    if (boards.length === 0) {
        document.getElementById('emptyState').classList.add('show');
        document.getElementById('boardsList').style.display = 'none';
    } else {
        document.getElementById('emptyState').classList.remove('show');
        document.getElementById('boardsList').style.display = 'grid';
        renderBoards();
    }
}

// Render boards list
function renderBoards() {
    const boardsList = document.getElementById('boardsList');
    boardsList.innerHTML = '';

    boards.forEach(board => {
        const taskCount = board.columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0);
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
                    <button class="board-action-btn" onclick="event.stopPropagation(); editBoard('${board.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="board-action-btn" onclick="event.stopPropagation(); deleteBoard('${board.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="board-card-stats">
                <div class="board-stat">
                    <i class="fas fa-columns"></i>
                    <span>${board.columns.length} Columns</span>
                </div>
                <div class="board-stat">
                    <i class="fas fa-tasks"></i>
                    <span>${taskCount} Tasks</span>
                </div>
            </div>
        `;
        
        boardsList.appendChild(boardCard);
    });
}

// Open board view
function openBoard(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    currentBoardId = boardId;
    document.getElementById('boardsList').parentElement.parentElement.style.display = 'none';
    document.getElementById('boardView').style.display = 'block';
    document.getElementById('boardViewTitle').textContent = board.name;
    
    renderKanbanBoard(board);
}

// Render Kanban board
function renderKanbanBoard(board) {
    const kanbanBoard = document.getElementById('kanbanBoard');
    kanbanBoard.innerHTML = '';

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

// Create column element
function createColumnElement(column, index) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'kanban-column';
    columnDiv.dataset.columnId = column.id;
    columnDiv.dataset.columnIndex = index;

    const header = document.createElement('div');
    header.className = 'kanban-column-header';
    header.innerHTML = `
        <div class="kanban-column-title">
            <span>${escapeHtml(column.name)}</span>
            <span class="kanban-column-count">${column.tasks?.length || 0}</span>
        </div>
        <div class="kanban-column-actions">
            <button class="column-action-btn" onclick="editColumn('${column.id}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="column-action-btn" onclick="deleteColumn('${column.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'kanban-column-content';
    content.dataset.columnId = column.id;

    if (column.tasks && column.tasks.length > 0) {
        column.tasks.forEach(task => {
            const taskElement = createTaskElement(task, column.id);
            content.appendChild(taskElement);
        });
    }

    columnDiv.appendChild(header);
    columnDiv.appendChild(content);

    return columnDiv;
}

// Create task element
function createTaskElement(task, columnId) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'kanban-card';
    taskDiv.draggable = true;
    taskDiv.dataset.taskId = task.id;
    taskDiv.dataset.columnId = columnId;

    const assigneeInitials = task.assignee || 'PM';
    const priorityClass = task.priority || 'medium';

    taskDiv.innerHTML = `
        <div class="kanban-card-header">
            <div class="kanban-card-title">${escapeHtml(task.title)}</div>
            <div class="kanban-card-assignee">${assigneeInitials}</div>
        </div>
        ${task.description ? `<div class="kanban-card-body">
            <p class="kanban-card-description">${escapeHtml(task.description)}</p>
        </div>` : ''}
        ${task.address ? `<div class="kanban-card-address">${escapeHtml(task.address)}</div>` : ''}
        <div class="kanban-card-footer">
            <div class="kanban-card-metrics">
                ${task.metrics ? task.metrics.map(m => `<span>${m}</span>`).join('') : ''}
            </div>
            <div class="kanban-card-priority ${priorityClass}">${priorityClass}</div>
        </div>
    `;

    taskDiv.addEventListener('click', (e) => {
        if (!e.target.closest('.kanban-card-assignee')) {
            editTask(task.id, columnId);
        }
    });

    return taskDiv;
}

// Show boards list
function showBoardsList() {
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('boardsList').parentElement.parentElement.style.display = 'block';
    currentBoardId = null;
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
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.kanban-column-content').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== null) {
        const targetColumn = this;
        const targetColumnId = targetColumn.dataset.columnId;
        const taskId = draggedElement.dataset.taskId;
        const sourceColumnId = draggedElement.dataset.columnId;

        if (sourceColumnId !== targetColumnId) {
            moveTask(taskId, sourceColumnId, targetColumnId);
            targetColumn.appendChild(draggedElement);
            draggedElement.dataset.columnId = targetColumnId;
        }

        this.classList.remove('drag-over');
    }

    return false;
}

// Move task between columns
function moveTask(taskId, sourceColumnId, targetColumnId) {
    const board = boards.find(b => b.id === currentBoardId);
    if (!board) return;

    const sourceColumn = board.columns.find(c => c.id === sourceColumnId);
    const targetColumn = board.columns.find(c => c.id === targetColumnId);
    
    if (!sourceColumn || !targetColumn) return;

    const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = sourceColumn.tasks.splice(taskIndex, 1)[0];
    targetColumn.tasks.push(task);

    updateColumnCounts();
    saveBoards();
}

// Update column counts
function updateColumnCounts() {
    const board = boards.find(b => b.id === currentBoardId);
    if (!board) return;

    board.columns.forEach(column => {
        const columnElement = document.querySelector(`[data-column-id="${column.id}"]`);
        if (columnElement) {
            const countElement = columnElement.querySelector('.kanban-column-count');
            if (countElement) {
                countElement.textContent = column.tasks?.length || 0;
            }
        }
    });
}

// Add Board Modal
function openAddBoardModal() {
    closeAllModals();
    document.getElementById('addBoardModal').classList.add('show');
}

function closeAddBoardModal() {
    document.getElementById('addBoardModal').classList.remove('show');
    document.getElementById('addBoardForm').reset();
}

// Add Task Modal
function openAddTaskModal() {
    closeAllModals();
    const boardSelect = document.getElementById('taskBoard');
    boardSelect.innerHTML = '<option value="">Choose a board...</option>';
    
    boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        if (currentBoardId && board.id === currentBoardId) {
            option.selected = true;
        }
        boardSelect.appendChild(option);
    });

    updateColumnSelect();
    document.getElementById('addTaskModal').classList.add('show');
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').classList.remove('show');
    document.getElementById('addTaskForm').reset();
}

// Add Contact Modal
function openAddContactModal() {
    closeAllModals();
    document.getElementById('addContactModal').classList.add('show');
}

function closeAddContactModal() {
    document.getElementById('addContactModal').classList.remove('show');
    document.getElementById('addContactForm').reset();
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    toggleAddMenu(false);
}

// Update column select based on board
document.getElementById('taskBoard')?.addEventListener('change', function() {
    updateColumnSelect();
});

function updateColumnSelect() {
    const boardSelect = document.getElementById('taskBoard');
    const columnSelect = document.getElementById('taskColumn');
    const boardId = boardSelect.value;

    columnSelect.innerHTML = '<option value="">Choose a column...</option>';

    if (boardId) {
        const board = boards.find(b => b.id === boardId);
        if (board) {
            board.columns.forEach(column => {
                const option = document.createElement('option');
                option.value = column.id;
                option.textContent = column.name;
                columnSelect.appendChild(option);
            });
        }
    }
}

// Form submissions
document.getElementById('addBoardForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('boardName').value;
    const description = document.getElementById('boardDescription').value;

    const newBoard = {
        id: generateId(),
        name: name,
        description: description,
        columns: [
            { id: generateId(), name: 'To Do', tasks: [] },
            { id: generateId(), name: 'In Progress', tasks: [] },
            { id: generateId(), name: 'Review', tasks: [] },
            { id: generateId(), name: 'Done', tasks: [] }
        ],
        createdAt: new Date().toISOString()
    };

    boards.push(newBoard);
    saveBoards();
    closeAddBoardModal();
    loadBoards();
});

document.getElementById('addTaskForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const boardId = document.getElementById('taskBoard').value;
    const columnId = document.getElementById('taskColumn').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignee = document.getElementById('taskAssignee').value;
    const priority = document.getElementById('taskPriority').value;

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    const newTask = {
        id: generateId(),
        title: title,
        description: description,
        assignee: assignee || 'PM',
        priority: priority,
        address: '',
        metrics: [],
        createdAt: new Date().toISOString()
    };

    column.tasks.push(newTask);
    saveBoards();

    if (currentBoardId === boardId) {
        renderKanbanBoard(board);
    }

    closeAddTaskModal();
});

document.getElementById('addContactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Store contacts in localStorage
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    
    const newContact = {
        id: generateId(),
        firstName: document.getElementById('contactFirstName').value,
        lastName: document.getElementById('contactLastName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        company: document.getElementById('contactCompany').value,
        createdAt: new Date().toISOString()
    };

    contacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    closeAddContactModal();
    alert('Contact added successfully!');
});

// Add column
function addColumn(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const columnName = prompt('Enter column name:');
    if (!columnName) return;

    const newColumn = {
        id: generateId(),
        name: columnName,
        tasks: []
    };

    board.columns.push(newColumn);
    saveBoards();
    renderKanbanBoard(board);
}

// Edit column
function editColumn(columnId) {
    const board = boards.find(b => b.id === currentBoardId);
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    const newName = prompt('Enter new column name:', column.name);
    if (!newName) return;

    column.name = newName;
    saveBoards();
    renderKanbanBoard(board);
}

// Delete column
function deleteColumn(columnId) {
    const board = boards.find(b => b.id === currentBoardId);
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    if (column.tasks.length > 0) {
        if (!confirm(`This column has ${column.tasks.length} task(s). Are you sure you want to delete it?`)) {
            return;
        }
    }

    const index = board.columns.findIndex(c => c.id === columnId);
    board.columns.splice(index, 1);
    saveBoards();
    renderKanbanBoard(board);
}

// Edit task
function editTask(taskId, columnId) {
    const board = boards.find(b => b.id === currentBoardId);
    if (!board) return;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    const task = column.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Simple edit - in production, use a modal
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle && newTitle !== task.title) {
        task.title = newTitle;
        saveBoards();
        renderKanbanBoard(board);
    }
}

// Delete board
function deleteBoard(boardId) {
    if (!confirm('Are you sure you want to delete this board?')) return;

    boards = boards.filter(b => b.id !== boardId);
    saveBoards();
    loadBoards();
}

// Edit board
function editBoard(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    const newName = prompt('Enter new board name:', board.name);
    if (newName && newName !== board.name) {
        board.name = newName;
        saveBoards();
        loadBoards();
    }
}

// Save boards to localStorage
function saveBoards() {
    localStorage.setItem('boards', JSON.stringify(boards));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle add menu
function toggleAddMenu(show) {
    const menu = document.getElementById('addMenu');
    if (show === undefined) {
        menu.classList.toggle('show');
    } else {
        menu.classList.toggle('show', show);
    }
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const addBtn = document.getElementById('addButton');
    const addMenu = document.getElementById('addMenu');
    const userBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userDropdown');

    if (addBtn && !addBtn.contains(e.target) && addMenu && !addMenu.contains(e.target)) {
        addMenu.classList.remove('show');
    }

    if (userBtn && !userBtn.contains(e.target) && userMenu && !userMenu.contains(e.target)) {
        userMenu.classList.remove('show');
    }
});

// User menu toggle
document.getElementById('userMenuBtn')?.addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('userDropdown');
    menu.classList.toggle('show');
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        // Clear session/localStorage if needed
        window.location.href = '/';
    }
});

// Setup event listeners
function setupEventListeners() {
    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });

    // Close modals on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Open board settings (placeholder)
function openBoardSettings() {
    alert('Board settings coming soon!');
}

