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
    <link rel="icon" href="/images/Logo.svg" type="image/x-icon">
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
                <div class="filter-group">
                    <input type="date" class="form-input" id="filterDate">
                </div>
            </div>

            <div class="calendar-container">
                <div class="calendar-header" id="calendarToggle">
                    <h2>Calendar View</h2>
                    <i class="fas fa-chevron-up collapse-icon"></i>
                </div>
                <div class="calendar-content" id="calendarContent">
                    <div class="appointment-calendar">
                        <div class="calendar-controls">
                            <div class="calendar-navigation">
                                <button class="btn btn-secondary" id="prevMonth">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <h3>March 2025</h3>
                                <button class="btn btn-secondary" id="nextMonth">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="calendar-wrapper">
                            <div class="calendar-weekdays">
                                <div class="weekday">Sun</div>
                                <div class="weekday">Mon</div>
                                <div class="weekday">Tue</div>
                                <div class="weekday">Wed</div>
                                <div class="weekday">Thu</div>
                                <div class="weekday">Fri</div>
                                <div class="weekday">Sat</div>
                            </div>
                            <div class="calendar-grid">
                                <!-- Calendar grid will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="appointmentFormModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Schedule New Appointment</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addAppointmentForm">
                            <div class="form-group">
                                <label>Client</label>
                                <div class="filter-dropdown">
                                    <input type="text" id="clientInput" class="form-input" placeholder="Search client..." required>
                                    <div id="clientDropdown" class="dropdown-list"></div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Therapist</label>
                                <div class="filter-dropdown">
                                    <input type="text" id="therapistInput" class="form-input" placeholder="Search therapist..." required>
                                    <div id="therapistDropdown" class="dropdown-list"></div>
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" name="date" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Time</label>
                                    <input type="time" name="time" class="form-input" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Session Type</label>
                                <select name="sessionType" class="form-input" required>
                                    <option value="video">Video Call</option>
                                    <option value="voice">Voice Call</option>
                                    <option value="chat">Chat Session</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea name="notes" class="form-input" rows="3"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary">Schedule Appointment</button>
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
                                    <option value="video">Video Call</option>
                                    <option value="voice">Voice Call</option>
                                    <option value="chat">Chat Session</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Notes</label>
                                <textarea class="form-input" name="notes" rows="3"></textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-input" name="status" required>
                                    <option value="pending">Pending</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    
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
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/js/appointment_management.js"></script>
    <script src="/js/admin_sidebar.js"></script>
</body>
</html>
