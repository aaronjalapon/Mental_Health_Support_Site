window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);  

    // Setup intersection observer for animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    const oberserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            } else {
                entry.target.classList.remove('animate');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((element) =>
        oberserver.observe(element));
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

// Add these redirect functions
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

