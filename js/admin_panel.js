document.addEventListener('DOMContentLoaded', function() {
    // Mobile toggle functionality
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-toggle btn';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    document.body.appendChild(mobileToggle);
    
    mobileToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
    });

    // Date display functionality
    function updateDateTime() {
        const now = new Date();
        const dateElement = document.querySelector('.current-date');
        const dayElement = document.querySelector('.current-day');

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const dayOptions = { weekday: 'long' };

        dateElement.textContent = now.toLocaleDateString('en-US', options);
        dayElement.textContent = now.toLocaleDateString('en-US', dayOptions);
    }

    updateDateTime();
    // Update date every minute
    setInterval(updateDateTime, 60000);
});

// Sidebar toggle functionality
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    
    // Create mobile toggle button if it doesn't exist
    if (!document.querySelector('.mobile-toggle')) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-toggle btn';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(mobileToggle);
        
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            // Toggle aria-expanded for accessibility
            const isExpanded = sidebar.classList.contains('show');
            mobileToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnToggle = e.target.closest('.mobile-toggle');
            
            if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        }
    });

    // Close sidebar when window is resized above mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
        }
    });
}

// Chart initialization
function initCharts() {
    // Client Growth Chart
    const clientGrowth = new Chart(
        document.getElementById('clientGrowthChart'),
        {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Clients',
                    data: [65, 78, 90, 85, 99, 112],
                    borderColor: '#1e9160',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        }
    );

    // Session Distribution Chart
    const sessionDist = new Chart(
        document.getElementById('sessionDistChart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Individual', 'Group', 'Family', 'Couples'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#1e9160',
                        '#2fb344',
                        '#3cc04c',
                        '#4acd54'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        }
    );

    // Monthly Statistics Chart
    const monthlyStats = new Chart(
        document.getElementById('monthlyStatsChart'),
        {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sessions',
                    data: [120, 150, 180, 165, 190, 210],
                    backgroundColor: '#1e9160'
                },
                {
                    label: 'Active Clients',
                    data: [90, 100, 125, 130, 140, 150],
                    backgroundColor: '#2fb344'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}

// Handle logout functionality
function handleLogout() {
    fetch('/php/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to landing page after successful logout
                window.location.href = '/html/index.html';
            } else {
                console.error('Logout failed:', data.message);
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
}

// Initialize sidebar and charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize sidebar functionality if we're on mobile
    if (window.innerWidth <= 768) {
        initSidebar();
    }
    
    // Re-evaluate on resize
    window.addEventListener('resize', () => {
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (window.innerWidth > 768) {
            // Remove toggle button on desktop
            if (mobileToggle) mobileToggle.remove();
            // Ensure sidebar is visible
            document.querySelector('.sidebar').classList.remove('show');
        } else if (!mobileToggle) {
            // Re-initialize for mobile if toggle doesn't exist
            initSidebar();
        }
    });

    initCharts();
});
