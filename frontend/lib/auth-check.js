// Authentication Check - Separate public vs authenticated navigation

// Determine if current page is a public landing page
function isPublicPage() {
    const publicPages = ['/', '/home', '/login', '/register'];
    const currentPath = window.location.pathname;
    return publicPages.includes(currentPath) || currentPath === '/';
}

// Determine if current page requires authentication
function isAuthenticatedPage() {
    const authPages = ['/clients', '/boards', '/settings', '/contacts/new', '/clients/new'];
    const currentPath = window.location.pathname;
    return authPages.some(page => currentPath.startsWith(page));
}

// Check if user is logged in
function checkAuthAndUpdateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                       sessionStorage.getItem('isLoggedIn') === 'true';
    
    const isPublic = isPublicPage();
    const isAuth = isAuthenticatedPage();
    
    // If on authenticated page but not logged in, redirect to login
    if (isAuth && !isLoggedIn) {
        window.location.href = '/login';
        return;
    }
    
    // Update navigation based on page type
    if (isPublic) {
        // Public pages: Hide authenticated nav items, show public nav
        hideAuthenticatedNavItems();
    } else if (isAuth) {
        // Authenticated pages: Hide public nav items, show authenticated nav
        hidePublicNavItems();
        
        // Show/hide Boards link
        const boardsNavItem = document.getElementById('boardsNavItem');
        if (boardsNavItem) {
            boardsNavItem.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        // Show/hide navigation actions (Plus button & User menu)
        const navActions = document.getElementById('navActions');
        if (navActions) {
            navActions.style.display = isLoggedIn ? 'flex' : 'none';
        }
    }
}

// Hide authenticated navigation items on public pages
function hideAuthenticatedNavItems() {
    const authNavSelectors = [
        'a[href="/clients"]',
        'a[href*="boards"]',
        'a[href="/settings"]',
        '#navActions',
        '.nav-actions'
    ];
    
    authNavSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const navItem = el.closest('.nav-item') || el;
            if (navItem && navItem !== el) {
                navItem.style.display = 'none';
            } else {
                el.style.display = 'none';
            }
        });
    });
}

// Hide public navigation items on authenticated pages
function hidePublicNavItems() {
    const publicNavSelectors = [
        'a[href="#packages"]',
        'a[href="#services"]',
        'a[href="#about"]',
        'a[href="#contact"]',
        'a[href="/login"].nav-login-btn'
    ];
    
    publicNavSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const navItem = el.closest('.nav-item');
            if (navItem) {
                navItem.style.display = 'none';
            }
        });
    });
}

// Legacy function name for backwards compatibility
function checkAuthAndHideBoards() {
    checkAuthAndUpdateNavigation();
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthAndUpdateNavigation);
} else {
    checkAuthAndUpdateNavigation();
}

// Also run after a short delay to catch dynamically loaded content
setTimeout(checkAuthAndUpdateNavigation, 100);

