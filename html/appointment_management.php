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
    <title>Appointment Management - MindSpace</title>
    <link rel="stylesheet" href="/css/admin_panel.css">
    <link rel="stylesheet" href="/css/appointment_management.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <button class="mobile-toggle" id="mobileMenuToggle">
            <i class="fas fa-bars"></i>
        </button>
        <?php include dirname(__DIR__) . '/components/admin_sidebar.php'; ?>

        <main class="main-content">
            <div class="content-header">
                <h1>Appointment Management</h1>
                <button class="btn btn-primary" id="addAppointmentBtn">
                    <i class="fas fa-plus"></i> Schedule Appointment
                </button>
            </div>

            <div class="appointment-filters">
                <div class="filter-group">
                    <input type="text" class="form-input" placeholder="Search appointments..." id="searchAppointments">
                </div>
                <div class="filter-group">
                    <select class="form-input" id="filterTherapist">
                        <option value="">All Therapists</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select class="form-input" id="filterStatus">
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            <div class="quick-actions">
                <button class="quick-action-btn" data-period="today">Today</button>
                <button class="quick-action-btn" data-period="tomorrow">Tomorrow</button>
                <button class="quick-action-btn" data-period="week">This Week</button>
            </div>

            <div class="calendar-container">
                <div class="calendar-header" id="calendarToggle">
                    <h2>Calendar View</h2>
                    <i class="fas fa-chevron-up collapse-icon"></i>
                </div>
                <div class="calendar-content" id="calendarContent">
                    <div class="appointment-calendar">
                        <!-- Calendar view will be implemented with JavaScript -->
                    </div>
                </div>
            </div>

            <div id="appointmentFormModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Schedule Appointment</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addAppointmentForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Client</label>
                                    <div class="filter-dropdown">
                                        <input type="text" class="form-input" name="client" id="clientInput" placeholder="Search client..." required>
                                        <div class="dropdown-list" id="clientDropdown">
                                            <!-- Dropdown items will be populated by JS -->
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Therapist</label>
                                    <div class="filter-dropdown">
                                        <input type="text" class="form-input" name="therapist" id="therapistInput" placeholder="Search therapist..." required>
                                        <div class="dropdown-list" id="therapistDropdown">
                                            <!-- Dropdown items will be populated by JS -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Time</label>
                                    <input type="time" class="form-input" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Session Type</label>
                                <select class="form-input" required>
                                    <option value="video">Video Call</option>
                                    <option value="voice">Voice Call</option>
                                    <option value="chat">Chat Session</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" rows="3"></textarea>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Appointment</button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Add Edit Modal -->
            <div id="editAppointmentModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Appointment</h2>
                        <span class="close-modal" id="closeEditModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="editAppointmentForm">
                            <input type="hidden" id="editAppointmentId">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Client</label>
                                    <div class="filter-dropdown">
                                        <input type="text" class="form-input" name="client" id="clientInput" placeholder="Search client..." required>
                                        <div class="dropdown-list" id="clientDropdown">
                                            <!-- Dropdown items will be populated by JS -->
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Therapist</label>
                                    <div class="filter-dropdown">
                                        <input type="text" class="form-input" name="therapist" id="therapistInput" placeholder="Search therapist..." required>
                                        <div class="dropdown-list" id="therapistDropdown">
                                            <!-- Dropdown items will be populated by JS -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-input" name="date" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Time</label>
                                    <input type="time" class="form-input" name="time" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Session Type</label>
                                <select class="form-input" name="sessionType" required>
                                    <option value="Video Call">Video Call</option>
                                    <option value="Voice Call">Voice Call</option>
                                    <option value="Chat Session">Chat Session</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" name="notes" rows="3"></textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-input" name="status" required>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Update Appointment</button>
                                <button type="button" class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Therapist</th>
                            <th>Date & Time</th>
                            <th>Session Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="appointmentTableBody">
                        <!-- Will be populated by JavaScript -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    <script src="/js/landing_page.js"></script>
    <script src="/js/admin_panel.js"></script>
    <script src="/js/appointment_management.js"></script>
   
</body>
</html>
