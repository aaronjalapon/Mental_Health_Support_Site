// Add these utility functions to global scope first
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return 'Not specified';
    try {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Not specified';
    }
}

// Keep your handleReschedule function in global scope
window.handleReschedule = async function(appointmentId) {
    // Try to get ID from event target if not passed directly
    const id = appointmentId || (event?.target?.closest('.reschedule-appointment')?.dataset?.id);
    
    if (!id) {
        showError('Appointment ID is missing');
        return;
    }

    try {
        const response = await fetch('../php/appointments/fetch_appointment_details.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId: id })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch appointment details');
        
        const appointment = data.appointment;
        const modal = document.getElementById('rescheduleModal');
        
        // Add null checks and default values
        const clientName = appointment.client_name || 'Not specified';
        const sessionType = appointment.session_type || 'video'; // Default to video if not set
        
        // Populate modal with appointment details including session type
        document.getElementById('rescheduleInfo').innerHTML = `
            <h4>Current Schedule</h4>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
            <p><strong>Session Type:</strong> ${formatSessionType(sessionType)}</p>
        `;

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newDate').min = today;
        document.getElementById('newDate').value = appointment.date || '';
        document.getElementById('newTime').value = appointment.time || '';
        document.getElementById('sessionType').value = sessionType;

        modal.style.display = 'block';

        // Handle form submission
        const form = document.getElementById('rescheduleForm');
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('../php/appointments/reschedule_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appointmentId: id,
                        newDate: document.getElementById('newDate').value,
                        newTime: document.getElementById('newTime').value,
                        sessionType: document.getElementById('sessionType').value,
                        notes: document.getElementById('rescheduleNotes').value
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Reschedule request sent successfully');
                    modal.style.display = 'none';
                    loadAppointments(); // Refresh appointments instead of page reload
                } else {
                    throw new Error(data.error || 'Failed to reschedule appointment');
                }
            } catch (error) {
                showError('Failed to reschedule appointment: ' + error.message);
            }
        };
    } catch (error) {
        showError('Failed to load appointment details: ' + error.message);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadAppointments();

    // Add event listeners
    document.getElementById('statusFilter').addEventListener('change', filterAppointments);
    document.getElementById('typeFilter').addEventListener('change', filterAppointments);
    document.getElementById('dateFilter').addEventListener('change', filterAppointments);
    document.getElementById('searchClient').addEventListener('input', filterAppointments);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('manageAvailabilityBtn').addEventListener('click', handleAvailabilityModal);
    document.getElementById('availabilityForm').addEventListener('submit', handleAvailabilitySubmit);

    // Modal elements
    const modal = document.getElementById('availabilityModal');
    const manageAvailabilityBtn = document.getElementById('manageAvailabilityBtn');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Show modal when manage availability button is clicked
    manageAvailabilityBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    // Close modal when clicking the close button or cancel button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function filterAppointments() {
        const statusValue = document.getElementById('statusFilter').value.toLowerCase();
        const typeValue = document.getElementById('typeFilter').value.toLowerCase();
        const dateValue = document.getElementById('dateFilter').value;
        const searchValue = document.getElementById('searchClient').value.toLowerCase();

        loadAppointments({
            status: statusValue,
            type: typeValue,
            date: dateValue,
            search: searchValue
        });
    }

    async function loadAppointments(filters = {}) {
        try {
            const response = await fetch('../php/appointments/fetch_therapist_appointments.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            });

            const result = await response.json();
            
            if (result.success) {
                renderAppointments(result.data);
                updateSummaryCount(result.data);
            } else {
                throw new Error(result.error || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Failed to load appointments');
            showEmptyState();
        }
    }

    function updateSummaryCount(appointments) {
        const today = new Date().toISOString().split('T')[0];
        
        const todayCount = appointments.filter(app => 
            app.date === today).length;
        
        const upcomingCount = appointments.filter(app => 
            app.status.toLowerCase() === 'upcoming').length;
        
        const completedCount = appointments.filter(app => 
            app.status.toLowerCase() === 'completed').length;
        
        const pendingCount = appointments.filter(app => 
            app.status.toLowerCase() === 'pending').length;

        document.getElementById('todayCount').textContent = todayCount;
        document.getElementById('upcomingCount').textContent = upcomingCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('pendingCount').textContent = pendingCount;
    }

    function showEmptyState() {
        const appointmentsList = document.getElementById('appointmentsList');
        const noAppointments = document.getElementById('noAppointments');
        
        if (appointmentsList) appointmentsList.style.display = 'none';
        if (noAppointments) noAppointments.style.display = 'flex';
    }

    function hideEmptyState() {
        const appointmentsList = document.getElementById('appointmentsList');
        const noAppointments = document.getElementById('noAppointments');
        
        if (appointmentsList) appointmentsList.style.display = 'flex';
        if (noAppointments) noAppointments.style.display = 'none';
    }

    function renderAppointments(appointments) {
        const list = document.getElementById('appointmentsList');
        
        if (!appointments || appointments.length === 0) {
            showEmptyState();
            return;
        }

        list.innerHTML = appointments.map(appointment => {
            const status = appointment.status.toLowerCase();
            const statusText = (status === 'reschedule_pending') 
                ? (appointment.reschedule_by === 'therapist' ? 'Waiting Client Response' : 'Therapist Requested Reschedule')
                : formatStatus(status);
                
            const statusIcon = {
                'pending': 'fa-clock',
                'upcoming': 'fa-calendar-check',
                'completed': 'fa-check-circle',
                'cancelled': 'fa-times-circle',
                'rejected': 'fa-times-circle',
                'reschedule_pending': 'fa-calendar-alt',    // Updated icon
                'reschedule_requested': 'fa-calendar-alt'   // Updated icon
            }[status] || 'fa-calendar-check';

            const sessionTypeIcon = {
                'video': 'fa-video',
                'voice': 'fa-microphone',
                'chat': 'fa-comments'
            }[appointment.session_type.toLowerCase()] || 'fa-video';

            let buttons = '';
        
            // Add buttons for pending status
            if (status === 'pending') {
                buttons = `
                    <div class="btn-container">
                        <button class="appointment-btn appointment-btn-primary approve-appointment" data-id="${appointment.id}">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="appointment-btn appointment-btn-secondary reschedule-appointment" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Reschedule
                        </button>
                        <button class="btn btn-info message-client" 
                            data-id="${appointment.id}" 
                            data-client="${appointment.client_name}"
                            data-client-id="${appointment.client_id}">
                            <i class="fas fa-comment"></i> Message Client
                        </button>
                    </div>`;
            }

            return `
                <div class="appointment-card" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <h3>Session with ${appointment.client_name}</h3>
                        <span class="appointment-status status-${status}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                    </div>
                    <div class="appointment-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${formatDate(appointment.date)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${formatTime(appointment.time)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas ${sessionTypeIcon}"></i>
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${formatSessionType(appointment.session_type)}</span>
                        </div>
                    </div>
                    ${appointment.status === 'cancellation_pending' ? `
                        <div class="cancellation-notice">
                            <p><strong>Client Requested Cancellation</strong></p>
                            <p><strong>Reason:</strong> ${appointment.cancellation_reason || 'No reason provided'}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="btn btn-danger" onclick="handleCancellationResponse(${appointment.id}, 'approve')">
                                <i class="fas fa-check"></i> Approve Cancellation
                            </button>
                            <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                                <i class="fas fa-calendar-alt"></i> Suggest Reschedule
                            </button>
                        </div>
                    ` : ''}
                    <div class="btn-container">
                        ${buttons}
                        ${renderAppointmentActions(appointment)}
                    </div>
                </div>
            `;
        }).join('');

        hideEmptyState();
        attachActionListeners();
    }

    function renderAppointmentActions(appointment) {
        const status = appointment.status.toLowerCase();
        let actions = '';

        switch(status) {
            case 'reschedule_pending':
                if (appointment.reschedule_by === 'therapist') {
                    actions = `
                        <div class="reschedule-notice">
                            <p>Your Reschedule Request:</p>
                            <p><strong>New Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                            <p><strong>New Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                            <p><strong>Proposed Session Type:</strong> ${formatSessionType(appointment.proposed_session_type || appointment.session_type)}</p>
                            <p><strong>Your Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                            <p class="status-note">Waiting for client's response...</p>
                        </div>`;
                }
                break;

            case 'reschedule_requested':
                actions = `
                    <div class="reschedule-notice">
                        <p>Client has requested to reschedule to:</p>
                        <p><strong>New Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                        <p><strong>New Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                        <p><strong>Proposed Session Type:</strong> ${formatSessionType(appointment.proposed_session_type || appointment.session_type)}</p>
                        <p><strong>Client's Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-primary accept-reschedule" data-id="${appointment.id}">
                            <i class="fas fa-check"></i> Accept New Schedule
                        </button>
                        <button class="btn btn-secondary suggest-time" data-id="${appointment.id}">
                            <i class="fas fa-clock"></i> Suggest Different Time
                        </button>
                        <button class="btn btn-danger cancel-appointment" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>
                    </div>`;
                break;

            case 'upcoming':
                actions = `
                    <div class="btn-container">
                        <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Reschedule
                        </button>
                        <button class="btn btn-danger cancel-appointment" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-info message-client" 
                            data-id="${appointment.id}" 
                            data-client="${appointment.client_name}"
                            data-client-id="${appointment.client_id}">
                            <i class="fas fa-comment"></i> Message Client
                        </button>
                    </div>`;
                break;

            // ...rest of the cases...
        }

        return actions;
    }

    function getSessionTypeIcon(type) {
        const icons = {
            'video': 'fa-video',
            'voice': 'fa-phone',
            'chat': 'fa-comments'
        };
        return icons[type.toLowerCase()] || 'fa-calendar-check';
    }

    function formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'upcoming': 'Upcoming',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'rejected': 'Rejected',
            'cancellation_pending': 'Cancellation Pending', 
            'reschedule_pending': 'Waiting Client Response', // Updated text
            'reschedule_requested': 'Client Requested Reschedule' // Added for clarity
        };
        return statusMap[status.toLowerCase()] || status;
    }

    // Add this function to fix the error
    function formatSessionType(type) {
        const types = {
            'video': 'Video Call',
            'voice': 'Voice Call',
            'chat': 'Chat Session'
        };
        return types[type.toLowerCase()] || type;
    }

    function attachActionListeners() {
        document.querySelectorAll('.approve-appointment').forEach(btn => 
            btn.addEventListener('click', handleApprove));
        document.querySelectorAll('.reschedule-appointment').forEach(btn => 
            btn.addEventListener('click', handleReschedule));
        document.querySelectorAll('.cancel-appointment').forEach(btn => 
            btn.addEventListener('click', handleCancel));
        document.querySelectorAll('.message-client').forEach(btn => 
            btn.addEventListener('click', handleMessage));
        document.querySelectorAll('.accept-reschedule').forEach(btn => 
            btn.addEventListener('click', handleAcceptReschedule));
        document.querySelectorAll('.suggest-time').forEach(btn => 
            btn.addEventListener('click', handleReschedule));
    }

    async function handleApprove(event) {
        const appointmentId = event.currentTarget.dataset.id;
        if (confirm('Are you sure you want to approve this appointment?')) {
            try {
                const response = await fetch('../php/appointments/approve_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appointmentId })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Appointment approved successfully');
                    loadAppointments(); // Refresh the appointments list
                } else {
                    throw new Error(data.error || 'Failed to approve appointment');
                }
            } catch (error) {
                showError('Failed to approve appointment: ' + error.message);
            }
        }
    }

    async function handleReschedule(event) {
        // Get appointment ID and prevent default if it's an event
        if (event.preventDefault) event.preventDefault();
        
        const appointmentId = event.currentTarget?.dataset?.id;
        if (!appointmentId) {
            showError('Could not find appointment ID');
            return;
        }
    
        try {
            const response = await fetch('../php/appointments/fetch_appointment_details.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId })
            });
            
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to fetch appointment details');
            
            const appointment = data.appointment;
            const modal = document.getElementById('rescheduleModal');
    
            // Add defensive checks for all properties
            const clientName = appointment?.client_name || 'Not specified';
            const sessionType = appointment?.session_type || 'video';
            const currentDate = appointment?.date || '';
            const currentTime = appointment?.time || '';
            
            // Check if this is a response to client's reschedule request
            const isClientRequest = appointment?.status?.toLowerCase() === 'reschedule_requested' && 
                                  appointment?.reschedule_by === 'client';
    
            // Prepare display content based on request type
            let modalContent = `
                <h4>Current Schedule</h4>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Date:</strong> ${formatDate(currentDate)}</p>
                <p><strong>Time:</strong> ${formatTime(currentTime)}</p>
                <p><strong>Session Type:</strong> ${formatSessionType(sessionType)}</p>`;
    
            // Add client's requested schedule if exists
            if (isClientRequest && appointment.proposed_date) {
                modalContent += `
                    <div class="reschedule-notice">
                        <h4>Client's Requested Schedule</h4>
                        <p><strong>Proposed Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                        <p><strong>Proposed Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                        <p><strong>Proposed Session Type:</strong> ${formatSessionType(appointment.proposed_session_type || sessionType)}</p>
                        ${appointment.reschedule_notes ? `<p><strong>Client's Note:</strong> ${appointment.reschedule_notes}</p>` : ''}
                    </div>`;
            }
    
            // Update modal content
            document.getElementById('rescheduleInfo').innerHTML = modalContent;
    
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newDate').min = today;
            
            // Pre-fill form with appropriate values
            if (isClientRequest && appointment.proposed_date) {
                // Use client's proposed values if available
                document.getElementById('newDate').value = appointment.proposed_date;
                document.getElementById('newTime').value = appointment.proposed_time;
                document.getElementById('sessionType').value = appointment.proposed_session_type || sessionType;
            } else {
                // Use current values
                document.getElementById('newDate').value = currentDate;
                document.getElementById('newTime').value = currentTime;
                document.getElementById('sessionType').value = sessionType;
            }
    
            // Show modal
            modal.style.display = 'block';
    
            // Handle form submission
            setupRescheduleFormSubmit(appointment);
    
        } catch (error) {
            console.error('Reschedule error:', error);
            showError('Failed to load appointment details: ' + error.message);
        }
    }
    
    // Update the setupRescheduleFormSubmit function to handle null values
    function setupRescheduleFormSubmit(appointment) {
        const form = document.getElementById('rescheduleForm');
        if (!form) return;
    
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            try {
                // Add defensive check for appointment.id
                const appointmentId = appointment?.id;
                if (!appointmentId) throw new Error('Invalid appointment ID');
    
                const response = await fetch('../php/appointments/reschedule_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appointmentId: appointmentId,
                        newDate: document.getElementById('newDate').value,
                        newTime: document.getElementById('newTime').value,
                        sessionType: document.getElementById('sessionType').value,
                        notes: document.getElementById('rescheduleNotes').value
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Reschedule request sent successfully');
                    document.getElementById('rescheduleModal').style.display = 'none';
                    loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to reschedule appointment');
                }
            } catch (error) {
                showError('Failed to reschedule appointment: ' + error.message);
            }
        };
    }
    

    async function handleCancel(event) {
        const appointmentId = event.target.closest('.cancel-appointment').dataset.id;
        showCancellationModal(appointmentId);
    }

    async function handleAvailabilityModal() {
        try {
            const modal = document.getElementById('availabilityModal');
            modal.style.display = 'block';
    
            const response = await fetch('../php/appointments/fetch_therapist_availability.php');
            if (!response.ok) {
                throw new Error(`Failed to fetch availability: ${response.statusText}`);
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to load availability');
            }
    
            populateAvailabilityForm(data.availability);
        } catch (error) {
            console.error('Error loading availability:', error);
            showError('Failed to load availability settings: ' + error.message);
        }
    }
    
    async function handleAvailabilitySubmit(event) {
        event.preventDefault();
        
        try {
            const form = event.target;
            const selectedDays = Array.from(form.querySelectorAll('input[name="availableDays"]:checked')).map(cb => cb.value);
            
            if (selectedDays.length === 0) {
                throw new Error('Please select at least one working day');
            }
    
            const formData = {
                days: selectedDays,
                hours: {
                    start: form.querySelector('input[name="startTime"]').value,
                    end: form.querySelector('input[name="endTime"]').value,
                    break: {
                        start: form.querySelector('input[name="breakStart"]').value || null,
                        end: form.querySelector('input[name="breakEnd"]').value || null
                    }
                }
            };
    
            const response = await fetch('../php/appointments/update_therapist_availability.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to update availability');
            }
    
            showSuccess('Availability updated successfully');
            document.getElementById('availabilityModal').style.display = 'none';
            
        } catch (error) {
            console.error('Error updating availability:', error);
            showError(error.message);
        }
    }

    // Helper functions for date/time formatting and error handling
    function formatDate(dateString) {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(timeString) {
        if (!timeString) return 'Not specified';
        try {
            return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Not specified';
        }
    }

    function showEmptyState() {
        document.getElementById('appointmentsList').style.display = 'none';
        document.getElementById('noAppointments').style.display = 'block';
    }

    function handleMessage(event) {
        const appointmentId = event.currentTarget.dataset.id;
        const clientName = event.currentTarget.dataset.client;
        const clientId = event.currentTarget.dataset.clientId; // Get clientId from dataset
        
        // Show modal and populate client info
        document.getElementById('messageClientInfo').innerHTML = `
            <p>Appointment ID: ${appointmentId}</p>
            <p>Client ID: ${clientId}</p>
            <h4>To: ${clientName}</h4>
        `;
        
        const messageModal = document.getElementById('messageModal');
        messageModal.style.display = 'block';
        
        // Clear previous message
        document.getElementById('messageText').value = '';

        // Add form submit handler
        document.getElementById('messageForm').onsubmit = async function(e) {
            e.preventDefault();
            
            const message = document.getElementById('messageText').value.trim();
            if (!message) return;

            try {
                const response = await fetch('../php/appointments/send_message_to_client.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        appointmentId: appointmentId,
                        message: message
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    showSuccess('Message sent successfully');
                    messageModal.style.display = 'none';
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                showError(error.message);
            }
        };
    }

    // Add message modal close handlers
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    function clearFilters() {
        document.getElementById('searchClient').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('dateFilter').value = '';
        loadAppointments();
    }

    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                const response = await fetch('../php/logout.php');
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = 'login.php';
                } else {
                    throw new Error(data.message || 'Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                showError('Failed to logout. Please try again.');
            }
        }
    });
});

function handleMessageClient(event) {
    const appointmentId = event.currentTarget.dataset.id;
    const appointmentCard = event.currentTarget.closest('.appointment-card');
    const clientName = appointmentCard.querySelector('h3').textContent.replace('Session with ', '');
    
    // Populate client info in modal
    document.getElementById('messageClientInfo').innerHTML = `
        <h4>To: ${clientName}</h4>
        <p>Appointment ID: ${appointmentId}</p>
    `;
    
    // Show modal
    const messageModal = document.getElementById('messageModal');
    messageModal.style.display = 'block';
    
    // Clear previous message
    document.getElementById('messageText').value = '';
}

// Add this after your DOMContentLoaded event listener
document.getElementById('messageForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = document.getElementById('messageText').value;
    const clientInfo = document.getElementById('messageClientInfo');
    const appointmentId = clientInfo.querySelector('p').textContent.split(': ')[1];
    
    try {
        // Here you would normally send the message to your backend
        // For now, we'll just show a success message
        showSuccess('Message sent successfully');
        document.getElementById('messageModal').style.display = 'none';
    } catch (error) {
        showError('Failed to send message');
    }
});

// Add message modal close handlers to your existing modal handlers
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

function clearFilters() {
    document.getElementById('searchClient').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    loadAppointments();
}

async function handleAcceptReschedule(event) {
    const appointmentId = event.currentTarget.dataset.id;
    
    if (confirm('Are you sure you want to accept this reschedule request?')) {
        try {
            const response = await fetch('../php/appointments/accept_reschedule.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId })
            });
            
            const data = await response.json();
            if (data.success) {
                showSuccess('Reschedule request accepted successfully');
                loadAppointments(); // Refresh the appointments list
            } else {
                throw new Error(data.error || 'Failed to accept reschedule request');
            }
        } catch (error) {
            showError('Failed to accept reschedule request: ' + error.message);
        }
    }
}

async function handleCancellationResponse(appointmentId, action) {
    if (!confirm('Are you sure you want to ' + (action === 'approve' ? 'approve this cancellation?' : 'reject this cancellation?'))) {
        return;
    }

    try {
        const response = await fetch('../php/appointments/respond_to_cancellation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                appointmentId,
                action
            })
        });

        const data = await response.json();
        if (data.success) {
            loadAppointments(); // Refresh the appointments list
            showNotification(data.message, 'success');
        } else {
            throw new Error(data.error || 'Failed to process cancellation');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleReschedule(event) {
    // Get appointment ID and prevent default if it's an event
    if (event.preventDefault) event.preventDefault();
    
    const appointmentId = event.currentTarget?.dataset?.id;
    if (!appointmentId) {
        showError('Could not find appointment ID');
        return;
    }

    try {
        const response = await fetch('../php/appointments/fetch_appointment_details.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointmentId })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch appointment details');
        
        const appointment = data.appointment;
        const modal = document.getElementById('rescheduleModal');

        // Add defensive checks for all properties
        const clientName = appointment?.client_name || 'Not specified';
        const sessionType = appointment?.session_type || 'video';
        const currentDate = appointment?.date || '';
        const currentTime = appointment?.time || '';
        
        // Check if this is a response to client's reschedule request
        const isClientRequest = appointment?.status?.toLowerCase() === 'reschedule_requested' && 
                              appointment?.reschedule_by === 'client';

        // Prepare display content based on request type
        let modalContent = `
            <h4>Current Schedule</h4>
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Date:</strong> ${formatDate(currentDate)}</p>
            <p><strong>Time:</strong> ${formatTime(currentTime)}</p>
            <p><strong>Session Type:</strong> ${formatSessionType(sessionType)}</p>`;

        // Add client's requested schedule if exists
        if (isClientRequest && appointment.proposed_date) {
            modalContent += `
                <div class="reschedule-notice">
                    <h4>Client's Requested Schedule</h4>
                    <p><strong>Proposed Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                    <p><strong>Proposed Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                    <p><strong>Proposed Session Type:</strong> ${formatSessionType(appointment.proposed_session_type || sessionType)}</p>
                    ${appointment.reschedule_notes ? `<p><strong>Client's Note:</strong> ${appointment.reschedule_notes}</p>` : ''}
                </div>`;
        }

        // Update modal content
        document.getElementById('rescheduleInfo').innerHTML = modalContent;

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newDate').min = today;
        
        // Pre-fill form with appropriate values
        if (isClientRequest && appointment.proposed_date) {
            // Use client's proposed values if available
            document.getElementById('newDate').value = appointment.proposed_date;
            document.getElementById('newTime').value = appointment.proposed_time;
            document.getElementById('sessionType').value = appointment.proposed_session_type || sessionType;
        } else {
            // Use current values
            document.getElementById('newDate').value = currentDate;
            document.getElementById('newTime').value = currentTime;
            document.getElementById('sessionType').value = sessionType;
        }

        // Show modal
        modal.style.display = 'block';

        // Handle form submission
        setupRescheduleFormSubmit(appointment);

    } catch (error) {
        console.error('Reschedule error:', error);
        showError('Failed to load appointment details: ' + error.message);
    }
}

function setupRescheduleFormSubmit(appointment) {
    const form = document.getElementById('rescheduleForm');
    if (!form) return;

    form.onsubmit = async function(e) {
        e.preventDefault();
        
        try {
            // Add defensive check for appointment.id
            const appointmentId = appointment?.id;
            if (!appointmentId) throw new Error('Invalid appointment ID');

            const response = await fetch('../php/appointments/reschedule_appointment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    appointmentId: appointmentId,
                    newDate: document.getElementById('newDate').value,
                    newTime: document.getElementById('newTime').value,
                    sessionType: document.getElementById('sessionType').value,
                    notes: document.getElementById('rescheduleNotes').value
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showSuccess('Reschedule request sent successfully');
                document.getElementById('rescheduleModal').style.display = 'none';
                loadAppointments();
            } else {
                throw new Error(data.error || 'Failed to reschedule appointment');
            }
        } catch (error) {
            showError('Failed to reschedule appointment: ' + error.message);
        }
    };
}

// Add this helper function if it doesn't exist
function formatSessionType(type) {
    if (!type) return 'Video Call'; // Default value
    const types = {
        'video': 'Video Call',
        'voice': 'Voice Call',
        'chat': 'Chat Session'
    };
    return types[type.toLowerCase()] || 'Video Call';
}

// ...existing code...

function showCancellationModal(appointmentId) {
    // Instead of creating a new modal, use the existing one in the HTML
    const modal = document.getElementById('cancelModal');
    if (!modal) return;

    const appointmentCard = document.querySelector(`.appointment-card[data-id="${appointmentId}"]`);
    if (!appointmentCard) return;

    const clientName = appointmentCard.querySelector('h3').textContent.replace('Session with ', '');
    const date = appointmentCard.querySelector('.detail-value').textContent;
    const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;

    // Update the modal content
    const appointmentInfo = modal.querySelector('.cancel-appointment-info');
    if (appointmentInfo) {
        appointmentInfo.innerHTML = `
            <p><strong>Session with ${clientName}</strong></p>
            <p><i class="fas fa-calendar"></i> ${date}</p>
            <p><i class="fas fa-clock"></i> ${time}</p>
        `;
    }

    // Show modal
    modal.style.display = 'flex';

    // Setup event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const keepBtn = modal.querySelector('#therapistKeepAppointment');
    const confirmBtn = modal.querySelector('#therapistConfirmCancel');

    const closeModal = () => {
        modal.style.display = 'none';
        const reasonInput = document.getElementById('therapistCancelReason');
        if (reasonInput) reasonInput.value = '';
    };

    closeBtn.onclick = closeModal;
    keepBtn.onclick = closeModal;
    confirmBtn.onclick = async () => {
        const reason = document.getElementById('therapistCancelReason').value.trim();
        await handleCancellationResponse(appointmentId, 'approve', reason);
        closeModal();
    };

    // Handle outside click
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// ...rest of existing code...

function populateAvailabilityForm(availability) {
    try {
        console.log('Populating form with availability:', availability); // Debug log

        // Reset all checkboxes first
        document.querySelectorAll('input[name="availableDays"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Check the days that are available
        if (Array.isArray(availability.days)) {
            availability.days.forEach(day => {
                const checkbox = document.querySelector(`input[name="availableDays"][value="${day}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }

        // Set working hours with null checks
        const hours = availability.hours || {};
        
        // Set start time
        const startTimeInput = document.querySelector('input[name="startTime"]');
        if (startTimeInput && hours.start) {
            startTimeInput.value = hours.start;
        }

        // Set end time
        const endTimeInput = document.querySelector('input[name="endTime"]');
        if (endTimeInput && hours.end) {
            endTimeInput.value = hours.end;
        }

        // Set break times
        const breakTimes = hours.break || {};
        
        // Set break start
        const breakStartInput = document.querySelector('input[name="breakStart"]');
        if (breakStartInput && breakTimes.start) {
            breakStartInput.value = breakTimes.start;
        }

        // Set break end
        const breakEndInput = document.querySelector('input[name="breakEnd"]');
        if (breakEndInput && breakTimes.end) {
            breakEndInput.value = breakTimes.end;
        }

    } catch (error) {
        console.error('Error populating availability form:', error);
        showError('Failed to populate availability form');
    }
}

// Update handleAvailabilityModal to include better error handling
async function handleAvailabilityModal() {
    try {
        const modal = document.getElementById('availabilityModal');
        if (!modal) throw new Error('Modal element not found');

        modal.style.display = 'block';

        const response = await fetch('../php/appointments/fetch_therapist_availability.php');
        if (!response.ok) {
            throw new Error(`Failed to fetch availability: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to load availability');
        }

        console.log('Received availability data:', data); // Debug log
        populateAvailabilityForm(data.availability);

    } catch (error) {
        console.error('Error in handleAvailabilityModal:', error);
        showError('Failed to load availability settings: ' + error.message);
    }
}

// ...existing code...

async function handleAvailabilitySubmit(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const selectedDays = Array.from(form.querySelectorAll('input[name="availableDays"]:checked')).map(cb => cb.value);
        
        if (selectedDays.length === 0) {
            throw new Error('Please select at least one working day');
        }

        const formData = {
            days: selectedDays,
            hours: {
                start: form.querySelector('input[name="startTime"]').value,
                end: form.querySelector('input[name="endTime"]').value,
                break: {
                    start: form.querySelector('input[name="breakStart"]').value || null,
                    end: form.querySelector('input[name="breakEnd"]').value || null
                }
            }
        };

        // Add validation for working hours
        if (!formData.hours.start || !formData.hours.end) {
            throw new Error('Please set your working hours');
        }

        // Validate that end time is after start time
        if (formData.hours.start >= formData.hours.end) {
            throw new Error('End time must be after start time');
        }

        // Validate break times if provided
        if (formData.hours.break.start && formData.hours.break.end) {
            if (formData.hours.break.start >= formData.hours.break.end) {
                throw new Error('Break end time must be after break start time');
            }
            if (formData.hours.break.start <= formData.hours.start || 
                formData.hours.break.end >= formData.hours.end) {
                throw new Error('Break time must be within working hours');
            }
        }

        const response = await fetch('../php/appointments/update_therapist_availability.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to update availability');
        }

        showSuccess('Availability updated successfully');
        document.getElementById('availabilityModal').style.display = 'none';
        
    } catch (error) {
        console.error('Error updating availability:', error);
        showError(error.message);
    }
}

// ...existing code...
