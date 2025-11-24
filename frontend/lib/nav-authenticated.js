// Authenticated Navigation - For logged-in pages
// This navigation should be used on: clients-list, boards, settings, client-detail, etc.

function renderAuthenticatedNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Clear existing items
    navMenu.innerHTML = '';
    
    // Authenticated navigation items
    const authNavItems = [
        { href: '/clients', text: 'Clients', id: 'clientsNavItem' },
        { href: '/boards', text: 'Boards', id: 'boardsNavItem', requiresAuth: true },
        { href: '/settings', text: 'Settings', id: 'settingsNavItem' }
    ];
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                       sessionStorage.getItem('isLoggedIn') === 'true';
    
    // Add authenticated nav items
    authNavItems.forEach(item => {
        // Skip items that require auth if not logged in
        if (item.requiresAuth && !isLoggedIn) return;
        
        const li = document.createElement('li');
        li.className = 'nav-item';
        if (item.id) li.id = item.id;
        if (item.requiresAuth && !isLoggedIn) {
            li.style.display = 'none';
        }
        
        const isActive = window.location.pathname.includes(item.href.replace('.html', ''));
        li.innerHTML = `<a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}">${item.text}</a>`;
        navMenu.appendChild(li);
    });
    
    // Add navigation actions (Plus button & User menu) - only if logged in
    if (isLoggedIn) {
        const actionsDiv = document.querySelector('.nav-actions') || document.createElement('div');
        actionsDiv.className = 'nav-actions';
        actionsDiv.id = 'navActions';
        actionsDiv.innerHTML = `
            <div class="nav-action-buttons">
                <button class="nav-add-btn" id="addButton" onclick="toggleAddMenu()">
                    <i class="fas fa-plus"></i>
                </button>
                <div class="add-menu" id="addMenu">
                    <a href="#" class="add-menu-item" onclick="openAddContactModal(); return false;">
                        <i class="fas fa-user-plus"></i>
                        <span>Add Contact</span>
                    </a>
                    <a href="#" class="add-menu-item" onclick="openAddTaskModal(); return false;">
                        <i class="fas fa-tasks"></i>
                        <span>Add Task</span>
                    </a>
                    <a href="#" class="add-menu-item" onclick="if(typeof openCreateBoardModal === 'function') { openCreateBoardModal(); } else if(typeof openAddBoardModal === 'function') { openAddBoardModal(); } return false;">
                        <i class="fas fa-columns"></i>
                        <span>Add Board</span>
                    </a>
                </div>
                <div class="user-menu-dropdown">
                    <button class="nav-user-btn" id="userMenuBtn" onclick="toggleUserMenu()">
                        <div class="user-avatar" id="userInitials">U</div>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown-menu" id="userDropdown">
                        <a href="#" class="dropdown-item">
                            <i class="fas fa-user"></i>
                            <span>Profile</span>
                        </a>
                        <a href="/settings" class="dropdown-item">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item" onclick="handleLogout(); return false;">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Insert actions after nav-menu
        const navContainer = document.querySelector('.nav-container');
        if (navContainer && !document.querySelector('.nav-actions')) {
            navContainer.appendChild(actionsDiv);
        }
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAuthenticatedNavigation);
} else {
    renderAuthenticatedNavigation();
}

