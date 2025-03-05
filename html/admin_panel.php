<?php
session_start();
if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../html/login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <link rel="stylesheet" href="/css/admin_panel.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <?php include dirname(__DIR__) . '/components/admin_sidebar.php'; ?>
        
        <main class="main-content">
            <div class="content-header">
                <h1>Dashboard Overview</h1>
                <div class="header-actions">
                    <div class="date-display">
                        <h3 class="current-date"></h3>
                        <h4 class="current-day"></h4>
                    </div>
                </div>
            </div>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Total Clients</h3>
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card-value">1,234</div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Active Sessions</h3>
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-value">56</div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Messages</h3>
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="card-value">89</div>
                </div>
            </div>

            <div class="charts-container">
                <div class="chart-card">
                    <h3>Client Growth</h3>
                    <canvas id="clientGrowthChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Session Distribution</h3>
                    <canvas id="sessionDistChart"></canvas>
                </div>
            </div>
            
            <div class="charts-container">
                <div class="chart-card full-width">
                    <h3>Monthly Statistics</h3>
                    <canvas id="monthlyStatsChart"></canvas> 
                </div>
            </div>
        </main>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/js/landing_page.js"></script>
    <script src="/js/admin_panel.js"></script>
</body>
</html>
