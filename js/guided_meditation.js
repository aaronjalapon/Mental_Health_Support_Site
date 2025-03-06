document.addEventListener('DOMContentLoaded', function() {
    // Check session status when page loads
    checkSession();

    // Handle smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Setup authentication button
    const authButton = document.getElementById('btn-login');
    const userDropdown = document.querySelector('.user-dropdown');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-logout');

    if (authButton) {
        authButton.addEventListener('click', function() {
            if (authButton.textContent === 'Log In') {
                window.location.href = '/html/login.php';
            }
        });
    }

    // Handle dropdown functionality
    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener('click', () => {
            dropdownContent.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', (event) => {
            if (!event.target.matches('.dropdown-btn')) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                }
            }
        });
    }
});

// Session checking function
function checkSession() {
    fetch('/php/check_session.php')
        .then(response => response.json())
        .then(data => {
            const authButton = document.getElementById('btn-login');
            const userDropdown = document.querySelector('.user-dropdown');
            
            if (data.loggedIn) {
                authButton.style.display = 'none';
                userDropdown.style.display = 'block';
                
                const username = data.user.username;
                const dropdownBtn = document.querySelector('.dropdown-btn');
                dropdownBtn.innerHTML = `<i class="fas fa-user"></i> Welcome, ${username}`;
            } else {
                authButton.style.display = 'block';
                userDropdown.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Logout handling
function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    
    fetch('/php/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/index.php';
            } else {
                throw new Error(data.message || 'Logout failed');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
            window.location.href = '/index.php';
        });
}
