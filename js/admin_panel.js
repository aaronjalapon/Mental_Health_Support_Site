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
    const ctx = document.getElementById('clientGrowthChart');
    
    // Check if chart exists and destroy it
    if (window.clientGrowthChart) {
        window.clientGrowthChart.destroy();
    }

    window.clientGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Registered Clients',
                data: Array(12).fill(0),
                borderColor: '#1e9160',
                backgroundColor: 'rgba(30, 145, 96, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Clients: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Function to update chart data
function updateChartData(growthData) {
    if (window.clientGrowthChart) {
        // Map the data to the correct months
        const monthData = Array(12).fill(0);
        growthData.forEach((item, index) => {
            const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                .indexOf(item.month);
            if (monthIndex !== -1) {
                monthData[monthIndex] = item.count;
            }
        });

        // Update chart data
        window.clientGrowthChart.data.datasets[0].data = monthData;
        window.clientGrowthChart.update();
    }
}



// Function to fetch dashboard statistics
function fetchDashboardStats() {
    fetch('/php/admin/fetch_dashboard_stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update card values
                document.querySelector('.card-value[data-type="clients"]').textContent = data.data.totalClients;
                document.querySelector('.card-value[data-type="sessions"]').textContent = data.data.activeSessions;

                // Update chart with new data
                updateChartData(data.data.growthData);
            }
        })
        .catch(error => console.error('Error fetching dashboard stats:', error));
}

// Function to update client growth chart
function updateClientGrowthChart(growthData) {
    if (window.clientGrowthChart) {
        const data = Array(12).fill(0);
        growthData.forEach((item) => {
            const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(item.month);
            if (monthIndex !== -1) {
                data[monthIndex] = item.count;
            }
        });
        
        window.clientGrowthChart.data.datasets[0].data = data;
        window.clientGrowthChart.update();
    }
}

// Initialize dashboard with real data
document.addEventListener('DOMContentLoaded', function() {
    // Remove the separate initCharts() call since we'll initialize the chart when we get data
    if (window.innerWidth <= 768) {
        initSidebar();
    }
    
    // Re-evaluate on resize
    window.addEventListener('resize', () => {
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (window.innerWidth > 768) {
            if (mobileToggle) mobileToggle.remove();
            document.querySelector('.sidebar').classList.remove('show');
        } else if (!mobileToggle) {
            initSidebar();
        }
    });

    // Fetch data and initialize chart
    fetch('/php/admin/fetch_dashboard_stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update card values
                document.querySelector('.card-value[data-type="clients"]').textContent = data.data.totalClients;
                document.querySelector('.card-value[data-type="sessions"]').textContent = data.data.activeSessions;

                // Initialize and update chart with data
                const ctx = document.getElementById('clientGrowthChart');
                window.clientGrowthChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                            label: 'Registered Clients',
                            data: data.data.growthData.map(item => item.count),
                            borderColor: '#1e9160',
                            backgroundColor: 'rgba(30, 145, 96, 0.1)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Error:', error));

    // Refresh stats every 5 minutes
    setInterval(fetchDashboardStats, 300000);
});
