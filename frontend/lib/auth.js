// Authentication JavaScript

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId + 'Toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    if (successDiv) {
        successDiv.style.display = 'none';
    }
}

// Show success message
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        // Set logged in status
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        sessionStorage.setItem('userEmail', email);
        
        // For now, just redirect to clients (authentication can be added later)
        // In production, you would validate credentials here
        setTimeout(() => {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/clients';
            }, 1000);
        }, 500);
        
        // Uncomment below for actual authentication:
        /*
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/boards';
                }, 1000);
            } else {
                showError(data.error || 'Login failed. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            showError('Network error. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
        */
    });
}

