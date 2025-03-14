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
    <title>Client Management - MindSpace</title>
    <link rel="stylesheet" href="/css/admin_panel.css">
    <link rel="stylesheet" href="/css/client_management.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="icon" href="/images/Logo.svg" type="image/x-icon">
</head>
<body>
    <div class="admin-container">
     <?php include dirname(__DIR__) . '/components/admin_sidebar.php'; ?>
        <main class="main-content">
            <div class="content-header">
                <h1>Client Management</h1>
                <button class="btn btn-primary" id="addClientBtn">
                    <i class="fas fa-plus"></i> Add New Client
                </button>
            </div>

            <div class="management-filters">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" class="search-input" id="clientSearch" placeholder="Search clients...">
                </div>
                <select class="status-filter" id="statusFilter">
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="blocked">Blocked</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div id="clientFormModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Client</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addClientForm" enctype="multipart/form-data">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="firstName">First Name</label>
                                    <input type="text" class="form-input" id="firstName" name="firstName" placeholder="John" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name</label>
                                    <input type="text" class="form-input" id="lastName" name="lastName" placeholder="Doe" required>
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="username">Username</label>
                                    <input type="text" class="form-input" id="username" name="username" placeholder="johndoe123" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" class="form-input" id="email" name="email" placeholder="johndoe@email.com" required>
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="password">Password</label>
                                    <input type="password" class="form-input" id="password" name="password" placeholder="password123" required>
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password</label>
                                    <input type="password" class="form-input" id="confirmPassword" name="confirmPassword" placeholder="password123" required>
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="contact">Contact Number</label>
                                    <input type="tel" class="form-input" id="contact" name="contact" placeholder="09123456789" required>
                                </div>
                                <div class="form-group">
                                    <label for="pronouns">Pronouns</label>
                                    <select class="form-input" id="pronouns" name="pronouns" required>
                                        <option value="">Select pronouns</option>
                                        <option value="He/Him/His">He/Him/His</option>
                                        <option value="She/Her/Hers">She/Her/Hers</option>
                                        <option value="They/Them/Theirs">They/Them/Theirs</option>
                                        <option value="I prefer not to say">I prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="address">Address</label>
                                <input type="text" class="form-input" id="address" name="address" placeholder="Matina, Davao City" required>
                            </div>

                            <div class="form-group file-upload">
                                <input type="file" id="fileInput" name="fileInput" accept="image/jpeg,image/png" required>
                                <label for="fileInput" class="file-label">Choose Image</label>
                                <span class="file-name">Upload Valid ID</span>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Client</button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="client-list">
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="clientTableBody">
                            <!-- Client rows will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        <!-- Edit Client Modal -->
        <div id="editClientModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Client</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editClientForm">
                        <input type="hidden" id="editClientId" name="editClientId">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editFirstName">First Name</label>
                                <input type="text" class="form-input" id="editFirstName" name="editFirstName" required>
                            </div>
                            <div class="form-group">
                                <label for="editLastName">Last Name</label>
                                <input type="text" class="form-input" id="editLastName" name="editLastName" required>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editUsername">Username</label>
                                <input type="text" class="form-input" id="editUsername" name="editUsername" required>
                            </div>
                            <div class="form-group">
                                <label for="editEmail">Email</label>
                                <input type="email" class="form-input" id="editEmail" name="editEmail" required>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editContact">Contact Number</label>
                                <input type="tel" class="form-input" id="editContact" name="editContact" required>
                            </div>
                            <div class="form-group">
                                <label for="editPronouns">Pronouns</label>
                                <select class="form-input" id="editPronouns" name="editPronouns" required="">
                                    <option value="He/Him/His">He/Him/His</option>
                                    <option value="She/Her/Hers">She/Her/Hers</option>
                                    <option value="They/Them/Theirs">They/Them/Theirs</option>
                                    <option value="I prefer not to say">I prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="editAddress">Address</label>
                            <input type="text" class="form-input" id="editAddress" name="editAddress" required>
                        </div>

                        <div class="form-group">
                            <label for="editStatus">Status</label>
                            <select class="form-input" id="editStatus" name="editStatus" required>
                                <option value="approved">Approved</option>
                                <option value="blocked">Blocked</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <!-- Add ValidID display container -->
                        <div class="form-group">
                            <label>Current Valid ID</label>
                            <div class="valid-id-container">
                                <img id="currentValidId" src="" alt="Valid ID" class="valid-id-preview">
                            </div>
                            <div class="form-group file-upload">
                                <input type="file" id="editFileInput" name="ValidID" accept="image/jpeg,image/png">
                                <label for="editFileInput" class="file-label">Update Valid ID</label>
                                <span class="file-name">No file chosen</span>
                                <small class="help-text">Leave empty to keep existing ID</small>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary edit-cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
   
    <script src="/js/client_management.js"></script>
    <script src="/js/admin_sidebar.js"></script>
</body>
</html>