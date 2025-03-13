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
    <title>Book Appointment - MindSpace</title>
    <!-- Move Poppins font import before other CSS files -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/css/header.css">
    <link rel="stylesheet" href="/css/book_appointment.css">
    <link rel="icon" href="/images/Logo.svg" type="image/x-icon">

</head>
<body>
    

    <?php include $_SERVER['DOCUMENT_ROOT'] . '/components/header.php'; ?>

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
                                <h3>Select Time:</h3>
                                <div class="time-slots">
                                    <div class="time-slot">
                                        <input type="radio" id="time-9" name="appointmentTime" value="09:00:00">
                                        <label for="time-9">9:00 AM to 10:00 AM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-10" name="appointmentTime" value="10:00:00">
                                        <label for="time-10">10:00 AM to 11:00 AM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-11" name="appointmentTime" value="11:00:00">
                                        <label for="time-11">11:00 AM to 12:00 PM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-12" name="appointmentTime" value="12:00:00">
                                        <label for="time-12">12:00 PM to 1:00 PM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-13" name="appointmentTime" value="13:00:00">
                                        <label for="time-13">1:00 PM to 2:00 PM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-14" name="appointmentTime" value="14:00:00">
                                        <label for="time-14">2:00 PM to 3:00 PM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-15" name="appointmentTime" value="15:00:00">
                                        <label for="time-15">3:00 PM to 4:00 PM</label>
                                    </div>
                                    <div class="time-slot">
                                        <input type="radio" id="time-16" name="appointmentTime" value="16:00:00">
                                        <label for="time-16">4:00 PM to 5:00 PM</label>
                                    </div>
                                </div>
                                <small class="form-text">Each session is 1-hour long</small>
                            </div>
                        </div>
                    </div>
                </div>

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
                <p>Your appointment request has been submitted and is awaiting the therapist's approval.<br>
                    You will receive an email notification once your schedule is confirmed.</p>

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

   
    <script src="../js/book_appointment.js"></script>
</body>
</html>
