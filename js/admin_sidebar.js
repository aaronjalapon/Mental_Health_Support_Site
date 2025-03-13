// Handle logout functionality
function handleLogout(event) {
    event.preventDefault();
    
    if (!confirm('Are you sure you want to log out?')) {
        return;
    }
    
    fetch('/php/logout.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                sessionStorage.clear();
                localStorage.clear();
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

// Add event listener to all logout links
document.addEventListener('DOMContentLoaded', function() {
    const logoutLinks = document.querySelectorAll('a[onclick*="handleLogout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', handleLogout);
    });
});
