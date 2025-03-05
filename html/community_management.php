<?php
session_start();
// Check if user is logged in and is admin
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
    <title>Community Management - Admin Panel</title>
    <link rel="stylesheet" href="/css/admin_panel.css">
    <link rel="stylesheet" href="/css/community_management.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <?php include dirname(__DIR__) . '/components/admin_sidebar.php'; ?>
        <main class="main-content">
            <div class="content-header">
                <h1>Community Management</h1>
                <div class="header-actions">
                    <div class="date-display">
                        <h3 class="current-date"></h3>
                        <h4 class="current-day"></h4>
                    </div>
                </div>
            </div>

            <div class="management-tabs">
                <button class="tab-btn active" data-tab="posts">Posts</button>
                <button class="tab-btn" data-tab="users">Users</button>
                <button class="tab-btn" data-tab="reports">Reports</button>
            </div>

            <div class="tab-content active" id="posts-tab">
                <div class="management-filters">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="search-input" placeholder="Search posts...">
                    </div>
                    <select class="status-filter">
                        <option value="all">All Posts</option>
                        <option value="active">Active</option>
                        <option value="hidden">Hidden</option>
                        <option value="flagged">Flagged</option>
                    </select>
                </div>
                <div class="posts-list">
                    <!-- Posts will be dynamically inserted here -->
                </div>
            </div>

            <div class="tab-content" id="users-tab">
                <div class="management-filters">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="search-input" placeholder="Search users...">
                    </div>
                    <select class="status-filter">
                        <option value="all">All Users</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
                <div class="users-list">
                    <!-- Users will be dynamically inserted here -->
                </div>
            </div>

            <div class="tab-content" id="reports-tab">
                <div class="management-filters">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="search-input" placeholder="Search reports...">
                    </div>
                    <select class="status-filter">
                        <option value="all">All Reports</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>
                <div class="reports-list">
                    <!-- Reports will be dynamically inserted here -->
                </div>
            </div>
        </main>
    </div>

    <!-- Modal templates -->
    <div class="modal" id="actionModal" style="display: none;">
        <div class="modal-content">
            <h2 class="modal-title">Take Action</h2>
            <div class="modal-body">
                <!-- Dynamic content will be inserted here -->
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-primary" data-action="confirm">Confirm</button>
            </div>
        </div>
    </div>

    <script src="/js/admin_panel.js"></script>
    <script src="/js/community_management.js"></script>
</body>
</html>
