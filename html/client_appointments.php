<?php
session_start();
// Check if user is logged in (but allow both admin and client)
if(!isset($_SESSION['unique_id'])) {
    header("Location: ../html/login.php");
    exit();
}

// Optional: You can add role-specific features
$isAdmin = $_SESSION['role'] === 'admin';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Appointments - MindSpace</title>

    <link rel="stylesheet" href="/css/client_appointments.css">
    <link rel="stylesheet" href="/css/community.css">
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
                <a href="book_appointment.html" class="btn btn-primary">
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
                <a href="book_appointment.html" class="btn btn-primary">Book Your First Session</a>
            </div>
        </div>
    </div>

    <!-- Cancellation Modal -->
    <div id="cancellationModal" class="modal">
        <div class="modal-content">
            <h2>Cancel Appointment</h2>
            <p>Are you sure you want to cancel this appointment?</p>
            <p class="appointment-info"></p>
            <div class="form-group">
                <label for="cancellationReason">Reason for cancellation (optional):</label>
                <textarea id="cancellationReason"></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn btn-danger" id="confirmCancel">Yes, Cancel</button>
                <button class="btn btn-secondary" onclick="closeModal()">No, Keep</button>
            </div>
        </div>
    </div>

    <script src="/js/landing_page.js"></script>
    <script src="/js/client_appointments.js"></script>
</body>
</html>
