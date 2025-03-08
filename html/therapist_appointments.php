<?php
session_start();
if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'therapist') {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Appointments - MindSpace Therapist</title>
    <link rel="stylesheet" href="/css/therapist_appointments.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../css/header.css">
</head>
<body>
    <div class="page-container">
        <div class="appointments-container">
            <div class="appointments-header">
                <h1>My Appointments</h1>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="manageAvailabilityBtn">
                        <i class="fas fa-clock"></i> Manage Availability
                    </button>
                    <button class="btn btn-danger" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>

            <div class="appointments-filters">
                <div class="filter-group">
                    <input type="text" id="searchClient" placeholder="Search client name...">
                    <select id="statusFilter">
                        <option value="all">All Status</option> 
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                        <option value="reschedule_pending">Waiting Client Response</option>
                        <option value="reschedule_requested">Client Requested Reschedule</option>
                    </select>
                    <select id="typeFilter">
                        <option value="all">All Types</option>
                        <option value="video">Video Call</option>
                        <option value="voice">Voice Call</option>
                        <option value="chat">Chat Session</option>
                    </select>
                    <input type="date" id="dateFilter">
                </div>
                <button id="clearFilters" class="btn btn-secondary">Clear Filters</button>
            </div>

            <div class="session-summary">
                <div class="summary-card">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Today's Sessions</h3>
                    <span class="count" id="todayCount">0</span>
                </div>
                <div class="summary-card">
                    <i class="fas fa-clock"></i>
                    <h3>Upcoming</h3>
                    <span class="count" id="upcomingCount">0</span>
                </div>
                <div class="summary-card">
                    <i class="fas fa-check-circle"></i>
                    <h3>Completed</h3>
                    <span class="count" id="completedCount">0</span>
                </div>
                <div class="summary-card">
                    <i class="fas fa-hourglass-half"></i>
                    <h3>Pending</h3>
                    <span class="count" id="pendingCount">0</span>
                </div>
            </div>

            <div id="appointmentsList" class="appointments-list">
                <!-- Appointment cards will be dynamically inserted here -->
                <template id="appointment-template">
                    <div class="appointment-card">
                        <div class="appointment-header">
                            <h3></h3>
                            <span class="appointment-status"></span>
                        </div>
                        <div class="appointment-details">
                            <div class="detail-item">
                                <span class="detail-label">Date</span>
                                <span class="detail-value date"></span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Time</span>
                                <span class="detail-value time"></span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Session Type</span>
                                <span class="detail-value type"></span>
                            </div>
                        </div>
                        <div class="appointment-actions">
                            <button class="btn btn-primary approve-appointment" data-id="${appointment.id}">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                                <i class="fas fa-calendar-alt"></i> Reschedule
                            </button>
                            <button class="btn btn-info message-client" data-id="${appointment.id}" data-client="${clientName}">
                                <i class="fas fa-comment"></i> Message Client
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <div id="noAppointments" class="appointments-empty" style="display: none;">
                <i class="fas fa-calendar-times"></i>
                <h2>No Appointments Found</h2>
                <p>You have no scheduled appointments matching your filters.</p>
            </div>
        </div>
    </div>

    <!-- Availability Management Modal -->
    <div id="availabilityModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Manage Availability</h2>
                <span class="close-modal">&times;</span>
            </div>
            <form id="availabilityForm">
                <div class="availability-section">
                    <div class="available-days">
                        <h4>Working Days</h4>
                        <div class="days-btn-container">
                            <input class="day-btn" id="sunday" name="availableDays" type="checkbox" value="sunday" />
                            <label class="day-label" for="sunday">Su</label>

                            <input class="day-btn" id="monday" name="availableDays" type="checkbox" value="monday" />
                            <label class="day-label" for="monday">M</label>

                            <input class="day-btn" id="tuesday" name="availableDays" type="checkbox" value="tuesday" />
                            <label class="day-label" for="tuesday">T</label>

                            <input class="day-btn" id="wednesday" name="availableDays" type="checkbox" value="wednesday" />
                            <label class="day-label" for="wednesday">W</label>

                            <input class="day-btn" id="thursday" name="availableDays" type="checkbox" value="thursday" />
                            <label class="day-label" for="thursday">Th</label>

                            <input class="day-btn" id="friday" name="availableDays" type="checkbox" value="friday" />
                            <label class="day-label" for="friday">F</label>

                            <input class="day-btn" id="saturday" name="availableDays" type="checkbox" value="saturday" />
                            <label class="day-label" for="saturday">Sa</label>
                        </div>
                    </div>
                    
                    <div class="available-hours">
                        <h4>Working Hours</h4>
                        <div class="hours-grid">
                            <div class="time-range">
                                <label>Start Time
                                    <input type="time" name="startTime" class="form-input" required>
                                </label>
                                <label>End Time
                                    <input type="time" name="endTime" class="form-input" required>
                                </label>
                            </div>
                            <div class="break-time">
                                <label>Break Time (optional)
                                    <div class="break-inputs">
                                        <input type="time" name="breakStart" class="form-input">
                                        <span>to</span>
                                        <input type="time" name="breakEnd" class="form-input">
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Save Availability</button>
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Message Modal -->
    <div id="messageModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Message Client</h2>
                <span class="close-modal">&times;</span>
            </div>
            <form id="messageForm">
                <div class="message-section">
                    <div class="client-info" id="messageClientInfo">
                        <!-- Client info will be populated dynamically -->
                    </div>
                    <div class="message-input">
                        <textarea 
                            id="messageText" 
                            placeholder="Type your message here..." 
                            required
                        ></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Send Message</button>
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Reschedule Modal -->
    <div id="rescheduleModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reschedule Appointment</h2>
                <span class="close-modal">&times;</span>
            </div>
            <form id="rescheduleForm">
                <div class="reschedule-section">
                    <div class="appointment-info" id="rescheduleInfo">
                        <!-- Appointment info will be populated dynamically -->
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
                        <textarea id="rescheduleNotes" placeholder="Add a note about rescheduling..."></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Confirm Reschedule</button>
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script src="../js/therapist_appointments.js"></script>
</body>
</html>
