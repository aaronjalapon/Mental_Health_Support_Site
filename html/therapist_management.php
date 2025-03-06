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
    <title>Therapist Management - MindSpace</title>
    <link rel="stylesheet" href="/css/admin_panel.css">
    <link rel="stylesheet" href="/css/therapist_management.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <?php include dirname(__DIR__) . '/components/admin_sidebar.php'; ?>
        <main class="main-content">
            <div class="content-header">
                <h1>Therapist Management</h1>
                <button class="btn btn-primary" id="addTherapistBtn">
                    <i class="fas fa-plus"></i> Add New Therapist
                </button>
            </div>

            <div class="management-filters">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" class="search-input" id="therapistSearch" placeholder="Search therapists...">
                </div>
                <select class="status-filter" id="statusFilter">
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="OnLeave">On Leave</option>
                </select>
            </div>

            <div id="therapistFormModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Therapist</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addTherapistForm">
                            <div class="form-group">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-input" id="therapistFirstName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-input" id="therapistLastName" required>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="therapistEmail" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-input" id="therapistPhone">
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Specialization</label>
                                    <input type="text" class="form-input" id="therapistSpecialization" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Years of Experience</label>
                                    <input type="number" class="form-input" id="therapistExperience" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bio</label>
                                <textarea class="form-input" id="therapistBio"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Availability</label>
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
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Therapist</button>
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div id="editTherapistModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Therapist</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="editTherapistForm">
                            <input type="hidden" id="editTherapistId" name="editTherapistId" required>
                            <div class="form-group">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-input" id="editTherapistFirstName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-input" id="editTherapistLastName" required>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="editTherapistEmail" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-input" id="editTherapistPhone">
                                </div>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Specialization</label>
                                    <input type="text" class="form-input" id="editTherapistSpecialization" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Years of Experience</label>
                                    <input type="number" class="form-input" id="editTherapistExperience" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-input" id="editTherapistStatus" required>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="OnLeave">On Leave</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bio</label>
                                <textarea class="form-input" id="editTherapistBio"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Availability</label>
                                <div class="availability-section">
                                    <div class="available-days">
                                        <h4>Working Days</h4>
                                        <div class="days-btn-container">
                                            <input class="day-btn" id="editSunday" name="availableDays" type="checkbox" value="sunday" />
                                            <label class="day-label" for="editSunday">Su</label>

                                            <input class="day-btn" id="editMonday" name="availableDays" type="checkbox" value="monday" />
                                            <label class="day-label" for="editMonday">M</label>

                                            <input class="day-btn" id="editTuesday" name="availableDays" type="checkbox" value="tuesday" />
                                            <label class="day-label" for="editTuesday">T</label>

                                            <input class="day-btn" id="editWednesday" name="availableDays" type="checkbox" value="wednesday" />
                                            <label class="day-label" for="editWednesday">W</label>

                                            <input class="day-btn" id="editThursday" name="availableDays" type="checkbox" value="thursday" />
                                            <label class="day-label" for="editThursday">T</label>

                                            <input class="day-btn" id="editFriday" name="availableDays" type="checkbox" value="friday" />
                                            <label class="day-label" for="editFriday">F</label>

                                            <input class="day-btn" id="editSaturday" name="availableDays" type="checkbox" value="saturday" />
                                            <label class="day-label" for="editSaturday">S</label>
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
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                                <button type="button" class="btn btn-secondary edit-cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div class="therapist-list">
                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Specialization</th>
                                <th>Experience</th>
                                <th>Working Days</th>
                                <th>Working Hours</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="therapistTableBody">
                            <!-- Therapist rows will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    <script>
        // Add global error handler
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
            return false;
        };
    </script>
    <script src="../js/landing_page.js"></script>
    <script src="../js/admin_panel.js"></script>
    <script src="../js/therapist_management.js"></script>
    
</body>
</html>