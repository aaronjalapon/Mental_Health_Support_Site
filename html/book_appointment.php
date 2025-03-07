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
    <title>Book Appointment - MindSpace</title>
    <!-- Move Poppins font import before other CSS files -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/css/header.css">
    <link rel="stylesheet" href="/css/book_appointment.css">
</head>
<body>
    

    <?php include '../components/header.php'; ?>

    <div class="page-container">
        <div class="booking-container">
            <div class="booking-header">
                <h1>Book Your Session</h1>
                <p>Schedule your appointment with one of our qualified therapists</p>
            </div>

            <div class="booking-content">
                <div class="view-appointments-section">
                    <a href="client_appointments.php" class="btn btn-secondary view-appointments-btn">
                        <i class="fas fa-calendar-check"></i> View My Appointments
                    </a>
                </div>
                <div class="appointment-scheduler" id="appointmentScheduler">
                    <h2>Schedule Your Session</h2>
                    <div class="scheduler-content">
                        <div class="date-picker">
                            <h3>Select Date & Time</h3>
                            <div class="calendar" id="appointmentCalendar">
                                <!-- Calendar will be populated by JavaScript -->
                            </div>
                            <div class="time-selection">
                                <label for="appointmentTime">Select Time:</label>
                                <input type="time" 
                                       id="appointmentTime" 
                                       class="form-input" 
                                       min="09:00" 
                                       max="17:00" 
                                       step="1800"
                                       required>
                                <small class="form-text">Available hours: 9:00 AM - 5:00 PM (maximum of 1-hour per session)</small>
                                <!-- <button type="button" id="checkAvailability" class="btn btn-secondary">
                                    Check Available Therapists
                                </button> -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- <div id="availabilityMessage" class="availability-message" style="display: none;">
                    <p>Showing therapists available on <span id="selectedDateTime"></span></p>
                </div> -->

                <div class="therapist-selection">
                    <h2>Select a Therapist</h2>
                    <div class="therapist-filters">
                        <input type="text" id="therapistSearch" placeholder="Search by name or specialization...">
                        <select id="specializationFilter">
                            <option value="">All Specializations</option>
                        </select>
                    </div>
                    <div class="therapist-list" id="therapistList">
                        <!-- Therapists will be populated here -->
                    </div>
                </div>
                <div class="appointment-scheduler" id="appointmentScheduler">
                    <form id="bookingForm" class="booking-form">
                        <h3>Session Details</h3>
                        <div class="form-group">
                            <label for="sessionType">Session Type</label>
                            <select id="sessionType" required>
                                <option value="video">Video Call</option>
                                <option value="voice">Voice Call</option>
                                <option value="chat">Chat Session</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="notes">Notes (Optional)</label>
                            <textarea id="notes" rows="3"></textarea>
                        </div>

                        <div class="booking-summary">
                            <h3>Booking Summary</h3>
                            <div id="bookingSummary">
                                <!-- Summary will be populated here -->
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="booking-btn booking-btn-primary">Confirm Booking</button>
                            <button type="button" class="booking-btn booking-btn-secondary" id="cancelBooking">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    
    <!-- Update modal structure with consistent function name -->
    <div id="confirmationModal" class="booking-modal-overlay">
        <div class="booking-modal-wrapper">
            <div class="booking-modal-container">
                <div class="booking-modal-header">
                    <h2>Booking Confirmed!</h2>
                </div>
                <div class="booking-modal-body">
                    <p>Your appointment is waiting for the therapist's approval.<br></p>
                    <div id="appointmentDetails" class="booking-details">
                        <!-- Appointment details will be shown here -->
                    </div>
                    <div class="booking-modal-actions">
                        <button class="booking-btn booking-btn-primary" onclick="window.closeModal()">Done</button>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Update script paths to use relative paths -->
   
    <script src="../js/book_appointment.js"></script>
</body>
</html>
