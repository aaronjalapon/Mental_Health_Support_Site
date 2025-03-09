<?php
session_start();
// Check if user is logged in
if(!isset($_SESSION['unique_id'])) {
    header("Location: ../html/login.php");
    exit();
}

// Set role variable safely
$isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Appointments - MindSpace</title>

    <link rel="stylesheet" href="../css/client_appointments.css">
    <link rel="stylesheet" href="../css/community.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
   
    <?php include '../components/header.php'; ?>


    <div class="page-container">
        <div class="appointments-container">
            <div class="appointments-header">
                <h1>My Appointments</h1>
                <a href="#" onclick="redirectToAppointment()" class="appointment-btn appointment-btn-primary">
                    <i class="fas fa-plus"></i> Book New Session
                </a>
            </div>

            <div class="appointments-filters">
                <div class="filter-group">
                    <select id="statusFilter">
                        <option value="all">All Status</option> 
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                        <option value="cancellation_pending">Cancellation Pending</option>
                        <option value="reschedule_pending">Therapist Requested Reschedule</option>
                        <option value="reschedule_requested">Your Reschedule Request</option>
                    </select>
                    <select id="typeFilter">
                        <option value="all">All Types</option>
                        <option value="video">Video Call</option>
                        <option value="voice">Voice Call</option>
                        <option value="chat">Chat Session</option>
                    </select>
                    <input type="date" id="dateFilter">
                </div>
                <button class="btn btn-secondary" id="clearFilters">Clear Filters</button>
            </div>

            <div class="appointments-list" id="appointmentsList">
                <!-- Appointments will be loaded here -->
            </div>

            <div class="appointments-empty" id="noAppointments" style="display: none;">
                <i class="fas fa-calendar-times"></i>
                <p>No appointments found</p>
                <a href="#" onclick="redirectToAppointment()" class="btn btn-primary">Book Your First Session</a>
            </div>
        </div>
    </div>

    <!-- Cancellation Modal -->
    <div id="cancellationModal" class="cancel-appointment-modal">
        <div class="cancel-modal-content">
            <button type="button" class="modal-close">&times;</button>
            <div class="cancel-modal-header">
                <h2>Cancel Appointment</h2>
                <p>Are you sure you want to cancel this appointment?</p>
            </div>
            <div class="cancel-appointment-info">
                <!-- Appointment info will be populated dynamically -->
            </div>
            <div class="cancel-reason-group">
                <label for="cancelReason">Reason for cancellation (optional):</label>
                <textarea id="cancelReason" placeholder="Please provide a reason for cancellation..."></textarea>
            </div>
            <div class="cancel-modal-actions">
                <button type="button" id="confirmCancel" class="appointment-btn appointment-btn-danger">
                    Yes, Cancel Appointment
                </button>
                <button type="button" id="keepAppointment" class="appointment-btn appointment-btn-secondary">
                    No, Keep Appointment
                </button>
            </div>
        </div>
    </div>

    <!-- Reschedule Modal -->
    <div class="modal" id="rescheduleModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reschedule Appointment</h2>
                <span class="close-modal">×</span>
            </div>
            <form id="rescheduleForm">
                <div class="reschedule-section">
                    <!-- This div will be populated dynamically by JavaScript -->
                    <div class="appointment-info" id="rescheduleInfo">
                        <!-- Content will be inserted here by handleSuggestTime function -->
                    </div>
                    <div class="form-group">
                        <label for="newDate">New Date</label>
                        <input type="date" id="newDate" required>
                    </div>
                    <div class="form-group">
                        <label for="newTime">New Time</label>
                        <input type="time" id="newTime" required>
                    </div>
                    <div class="form-group">
                        <label for="rescheduleNotes">Notes (Optional)</label>
                        <textarea id="rescheduleNotes" placeholder="Add a note about why you need to reschedule..."></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="appointment-btn appointment-btn-primary">Send Request</button>
                    <button type="button" class="appointment-btn appointment-btn-secondary close-modal">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script src="../js/landing_page.js"></script>
    <script src="../js/client_appointments.js"></script>
</body>
</html>
