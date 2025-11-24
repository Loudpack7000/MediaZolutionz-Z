// Public Navigation - For landing pages (not logged in)
// This navigation should be used on: index.html, login.html, register.html

function renderPublicNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Clear existing items
    navMenu.innerHTML = '';
    
    // Public navigation items
    const publicNavItems = [
        { href: '#packages', text: 'Packages' },
        { href: '#services', text: 'Services' },
        { href: '#about', text: 'About' },
        { href: '#contact', text: 'Contact' }
    ];
    
    // Add public nav items
    publicNavItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `<a href="${item.href}" class="nav-link">${item.text}</a>`;
        navMenu.appendChild(li);
    });
    
    // Add login button
    const loginLi = document.createElement('li');
    loginLi.className = 'nav-item';
    loginLi.innerHTML = `
        <a href="/login" class="nav-link nav-login-btn">
            <i class="fas fa-sign-in-alt"></i>
            Login
        </a>
    `;
    navMenu.appendChild(loginLi);
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderPublicNavigation);
} else {
    renderPublicNavigation();
}

