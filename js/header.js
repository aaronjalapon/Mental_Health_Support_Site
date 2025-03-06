document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
});

function initializeHeader() {
    setupBurgerMenu();
    setupDropdowns();
    setupAuthButton();
    checkSession();
    setupProfileModal();
}

function setupBurgerMenu() {
    const burgerMenu = document.getElementById("burgerMenu");
    const navLinks = document.getElementById("navLinks");

    if (burgerMenu && navLinks) {
        burgerMenu.addEventListener("click", () => {
            burgerMenu.classList.toggle("active");
            navLinks.classList.toggle("show");
        });
    }
}

function setupDropdowns() {
    const selfHelpBtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const userDropdown = document.querySelector('.user-dropdown');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownLogout = document.querySelector('.dropdown-logout');

    if (selfHelpBtn && dropdownContent) {
        selfHelpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
    }

    if (dropdownBtn && dropdownLogout) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownLogout.classList.toggle('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (!e.target.matches('.dropbtn') && dropdownContent) {
            dropdownContent.classList.remove('show');
        }
        if (!userDropdown?.contains(e.target) && dropdownLogout) {
            dropdownLogout.classList.remove('show');
        }
    });
}

function setupAuthButton() {
    const authButton = document.getElementById('btn-login');
    if (authButton) {
        authButton.addEventListener('click', function() {
            if (authButton.textContent === 'Log In') {
                window.location.href = '/html/login.php';
            }
        });
    }

    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', handleLogout);
    });
}

function checkSession() {
    fetch('/php/check_session.php')
        .then(response => response.json())
        .then(data => {
            const authButton = document.getElementById('btn-login');
            const userDropdown = document.querySelector('.user-dropdown');
            const dropdownLogout = document.querySelector('.dropdown-logout');
            
            if (data.loggedIn) {
                // Hide login button and show user dropdown
                authButton.style.display = 'none';
                userDropdown.style.display = 'block';
                
                // Update welcome message
                const username = data.user.username;
                const dropdownBtn = document.querySelector('.dropdown-btn');
                dropdownBtn.innerHTML = `<i class="fas fa-user"></i> Welcome, ${username}`;

                // Remove existing event listeners
                dropdownBtn.replaceWith(dropdownBtn.cloneNode(true));
                
                // Re-add event listener to the new button
                const newDropdownBtn = document.querySelector('.dropdown-btn');
                newDropdownBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdownLogout.classList.toggle('show');
                });

                // Ensure document click listener is set
                document.addEventListener('click', (e) => {
                    if (!userDropdown.contains(e.target)) {
                        dropdownLogout.classList.remove('show');
                    }
                });
            } else {
                authButton.style.display = 'block';
                userDropdown.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

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

function setupProfileModal() {
    const profileLink = document.querySelector('a.dropdown-item:not([onclick="handleLogout()"])');
    const modal = document.getElementById('editProfileModal');
    
    if (!modal) return; // Guard clause if modal doesn't exist
    
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.edit-cancel-btn');
    const form = document.getElementById('editProfileForm');

    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            openProfileModal();
        });
    }

    function openProfileModal() {
        modal.style.display = 'flex';
        loadProfileData();
    }

    function closeModal() {
        modal.style.display = 'none';
        if (form) form.reset();
    }

    // Close modal handlers
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                const response = await fetch('/php/update_profile.php', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to update profile');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Profile updated successfully!');
                    closeModal();
                    // Refresh session data
                    const sessionResponse = await fetch('/php/check_session.php');
                    const sessionData = await sessionResponse.json();
                    if (sessionData.loggedIn) {
                        const dropdownBtn = document.querySelector('.dropdown-btn');
                        dropdownBtn.innerHTML = `<i class="fas fa-user"></i> Welcome, ${sessionData.user.username}`;
                    }
                } else {
                    throw new Error(data.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Failed to update profile');
            }
        });
    }
}

// Add profile data loading functionality
async function loadProfileData() {
    const form = document.getElementById('editProfileForm');
    if (!form) return;

    const formInputs = form.querySelectorAll('input, select');
    formInputs.forEach(input => input.disabled = true);

    try {
        const response = await fetch('/php/get_user_data.php');
        const data = await response.json();
        
        if (data.success) {
            formInputs.forEach(input => {
                input.disabled = false;
                if (data.user[input.name]) {
                    input.value = data.user[input.name];
                }
            });
        } else {
            alert('Failed to load profile data');
            closeModal();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load profile data');
        closeModal();
    }
}

function redirectToGuidedMeditations() {
    fetch('/php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                window.location.href = '/html/guided_meditation.php';
            } else {
                window.location.href = '/html/login.php';
                alert('Please log in first.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function redirectToAppointment() {
    fetch('/php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                window.location.href = '/html/book_appointment.php';
            } else {
                window.location.href = '/html/login.php';
                alert('Please log in first.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function redirectToCommunity() {
    fetch('/php/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                window.location.href = '/html/community.php';
            } else {
                window.location.href = '/html/login.php';
                alert('Please log in first.');
            }
        })
        .catch(error => console.error('Error:', error));
}
