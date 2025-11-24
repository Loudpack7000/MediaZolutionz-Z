// Board Modal JavaScript - Simple JobNimbus Style

// Use existing API_BASE if defined, otherwise set it
if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = 'http://localhost:3000/api/v1';
}

// Open modal
function openCreateBoardModal() {
    const modal = document.getElementById('createBoardModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on board name input
        setTimeout(() => {
            const nameInput = document.getElementById('modalBoardName');
            if (nameInput) nameInput.focus();
        }, 100);
    }
}

// Close modal
function closeCreateBoardModal() {
    const modal = document.getElementById('createBoardModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // Reset form
    const form = document.getElementById('createBoardForm');
    if (form) {
        form.reset();
        // Reset color to default
        const colorInput = document.getElementById('modalBoardColor');
        if (colorInput) colorInput.value = '#10B981';
    }
}

// Submit form
async function submitCreateBoard(event) {
    event.preventDefault();
    
    const form = document.getElementById('createBoardForm');
    const formData = new FormData(form);
    
    const boardName = formData.get('boardName')?.trim();
    const boardColor = formData.get('boardColor') || '#10B981';
    
    if (!boardName) {
        alert('Please enter a board name');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    
    try {
        // Create board
        const response = await fetch(`${window.API_BASE}/boards/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: boardName,
                color: boardColor
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create board');
        }
        
        const result = await response.json();
        const boardId = result.id;
        
        // Don't create default columns - user will add them as needed
        closeCreateBoardModal();
        
        // Reload boards list
        if (typeof loadBoards === 'function') {
            await loadBoards();
        }
        
        // Optionally open the new board
        setTimeout(() => {
            if (typeof openBoard === 'function') {
                openBoard(boardId);
            }
        }, 500);
    } catch (error) {
        console.error('Error creating board:', error);
        alert('Error creating board: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Expose functions globally
window.openCreateBoardModal = openCreateBoardModal;
window.closeCreateBoardModal = closeCreateBoardModal;
window.submitCreateBoard = submitCreateBoard;

// Also support old function names for compatibility
window.openAddBoardModal = openCreateBoardModal;
window.closeAddBoardModal = closeCreateBoardModal;

