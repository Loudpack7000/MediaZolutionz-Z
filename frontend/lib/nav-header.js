// Consistent Navigation Header - Plus Button & User Menu

// Toggle Add Menu (Plus Button)
function toggleAddMenu() {
    const menu = document.getElementById('addMenu');
    const userMenu = document.getElementById('userDropdown');
    
    if (menu) {
        menu.classList.toggle('show');
    }
    
    // Close user menu if open
    if (userMenu && userMenu.classList.contains('show')) {
        userMenu.classList.remove('show');
    }
}

// Toggle User Menu
function toggleUserMenu() {
    const menu = document.getElementById('userDropdown');
    const addMenu = document.getElementById('addMenu');
    
    if (menu) {
        menu.classList.toggle('show');
    }
    
    // Close add menu if open
    if (addMenu && addMenu.classList.contains('show')) {
        addMenu.classList.remove('show');
    }
}

// Close menus when clicking outside
document.addEventListener('click', function(e) {
    const addMenu = document.getElementById('addMenu');
    const addButton = document.getElementById('addButton');
    const userMenu = document.getElementById('userDropdown');
    const userButton = document.getElementById('userMenuBtn');
    
    if (addMenu && addButton && !addMenu.contains(e.target) && !addButton.contains(e.target)) {
        addMenu.classList.remove('show');
    }
    
    if (userMenu && userButton && !userMenu.contains(e.target) && !userButton.contains(e.target)) {
        userMenu.classList.remove('show');
    }
});

// Add Contact Modal
function openAddContactModal() {
    // Close menus
    const addMenu = document.getElementById('addMenu');
    if (addMenu) addMenu.classList.remove('show');
    
    // Open the create contact modal
    if (typeof openCreateContactModal === 'function') {
        openCreateContactModal();
    } else {
        // Try to open modal directly
        const modal = document.getElementById('createContactModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            // Setup auto display name if function exists
            if (typeof setupAutoDisplayName === 'function') {
                setupAutoDisplayName();
            }
        } else {
            // Navigate to clients page if modal doesn't exist
            window.location.href = '/clients';
        }
    }
}

// Add Task (placeholder)
function openAddTaskModal() {
    const addMenu = document.getElementById('addMenu');
    if (addMenu) addMenu.classList.remove('show');
    alert('Add Task functionality coming soon!');
}

// Add Board
function openAddBoardModal() {
    const addMenu = document.getElementById('addMenu');
    if (addMenu) addMenu.classList.remove('show');
    
    // Use the new board modal function
    if (typeof window.openCreateBoardModal === 'function') {
        window.openCreateBoardModal();
    } else if (typeof window.openAddBoardModal === 'function') {
        window.openAddBoardModal();
    } else {
        // Navigate to boards page if modal not available
        window.location.href = '/boards';
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
}

// Get user initials for avatar
function getUserInitials() {
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'User';
    const parts = userEmail.split('@')[0].split('.');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userEmail.substring(0, 2).toUpperCase();
}

// Initialize user menu on page load
document.addEventListener('DOMContentLoaded', function() {
    const userInitials = document.getElementById('userInitials');
    if (userInitials) {
        userInitials.textContent = getUserInitials();
    }
});

// Make functions globally available
window.toggleAddMenu = toggleAddMenu;
window.toggleUserMenu = toggleUserMenu;
window.openAddContactModal = openAddContactModal;
window.openAddTaskModal = openAddTaskModal;
window.openAddBoardModal = openAddBoardModal;
window.handleLogout = handleLogout;

