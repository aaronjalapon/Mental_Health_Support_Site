// Redirect functions for services
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

// Social media link handling
document.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Check if social media links are ready before opening
        if (link.getAttribute('href') === '#') {
            e.preventDefault();
            alert('Coming soon!');
        }
    });
});
