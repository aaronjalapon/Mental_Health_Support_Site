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
            const statusIcon = {
                'pending': 'fa-clock',
                'upcoming': 'fa-calendar-check',
                'completed': 'fa-check-circle',
                'cancelled': 'fa-times-circle',
                'rejected': 'fa-times-circle'
            }[status] || 'fa-calendar-check';

            const sessionIcon = {
                'video': 'fa-video',
                'voice': 'fa-microphone',
                'chat': 'fa-comments'
            }[appointment.session_type.toLowerCase()] || 'fa-video';

            return `
                <div class="appointment-card" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <h3>Session with ${appointment.client_name}</h3>
                        <span class="appointment-status status-${status}">
                            <i class="fas ${statusIcon}"></i> ${formatStatus(status)}
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
                            <i class="fas ${sessionIcon}"></i>
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${formatSessionType(appointment.session_type)}</span>
                        </div>
                    </div>
                    ${renderAppointmentActions(appointment)}
                </div>
            `;
        }).join('');

        hideEmptyState();
        attachActionListeners();
    }

    function renderAppointmentActions(appointment) {
        const status = appointment.status.toLowerCase();
        const actions = [];

        switch(status) {
            case 'pending':
                actions.push(`
                    <button class="btn btn-primary approve-appointment" data-id="${appointment.id}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                        <i class="fas fa-calendar-alt"></i> Reschedule
                    </button>
                    <button class="btn btn-info message-client" 
                        data-id="${appointment.id}" 
                        data-client="${appointment.client_name}"
                        data-client-id="${appointment.client_id}">
                        <i class="fas fa-comment"></i> Message Client
                    </button>
                `);
                break;
            case 'upcoming':
                actions.push(`
                    <button class="btn btn-primary start-session" data-id="${appointment.id}" data-type="${appointment.session_type}">
                        <i class="fas fa-play"></i> Start Session
                    </button>
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
                `);
                break;
            case 'completed':
                actions.push(`
                    <button class="btn btn-info message-client" 
                        data-id="${appointment.id}" 
                        data-client="${appointment.client_name}"
                        data-client-id="${appointment.client_id}">
                        <i class="fas fa-comment"></i> Message Client
                    </button>
                `);
                break;
        }
        
        return actions.length ? `<div class="appointment-actions">${actions.join('')}</div>` : '';
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
            'rejected': 'Rejected'
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
        document.querySelectorAll('.start-session').forEach(btn => 
            btn.addEventListener('click', handleStartSession));
        document.querySelectorAll('.reschedule-appointment').forEach(btn => 
            btn.addEventListener('click', handleReschedule));
        document.querySelectorAll('.cancel-appointment').forEach(btn => 
            btn.addEventListener('click', handleCancel));
        document.querySelectorAll('.message-client').forEach(btn => 
            btn.addEventListener('click', handleMessage));
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

    async function handleStartSession(event) {
        const appointmentId = event.currentTarget.dataset.id;
        const sessionType = event.currentTarget.dataset.type;
        
        if (confirm('Are you sure you want to start this session?')) {
            try {
                const response = await fetch('../php/appointments/start_session.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appointmentId, sessionType })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Session started successfully');
                    loadAppointments(); // Refresh the appointments list
                } else {
                    throw new Error(data.error || 'Failed to start session');
                }
            } catch (error) {
                showError('Failed to start session: ' + error.message);
            }
        }
    }

    async function handleReschedule(event) {
        const appointmentId = event.currentTarget.dataset.id;
        // Show reschedule modal or date picker
        const newDate = prompt('Enter new date (YYYY-MM-DD):');
        const newTime = prompt('Enter new time (HH:MM):');
        const notes = prompt('Add a note for rescheduling (optional):');
        
        if (newDate && newTime) {
            try {
                const response = await fetch('../php/appointments/reschedule_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appointmentId,
                        newDate,
                        newTime,
                        notes
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Appointment rescheduled successfully');
                    loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to reschedule appointment');
                }
            } catch (error) {
                showError('Failed to reschedule appointment: ' + error.message);
            }
        }
    }

    async function handleCancel(event) {
        const appointmentId = event.currentTarget.dataset.id;
        const reason = prompt('Please provide a reason for cancellation:');
        
        if (reason && confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const response = await fetch('../php/appointments/cancel_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appointmentId,
                        reason
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Appointment cancelled successfully');
                    loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to cancel appointment');
                }
            } catch (error) {
                showError('Failed to cancel appointment: ' + error.message);
            }
        }
    }

    async function handleAvailabilityModal() {
        try {
            toggleAvailabilityModal(true); // Show modal first for better UX

            const response = await fetch('../php/appointments/fetch_therapist_availability.php');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            if (data.success) {
                populateAvailabilityForm(data.availability);
            } else {
                throw new Error(data.error || 'Failed to load availability');
            }
        } catch (error) {
            console.error('Error loading availability:', error);
            showError('Failed to load availability settings');
            toggleAvailabilityModal(false);
        }
    }

    function toggleAvailabilityModal(show) {
        const modal = document.getElementById('availabilityModal');
        if (show) {
            modal.style.display = 'flex';
            // Use requestAnimationFrame to ensure the display change has taken effect
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
        } else {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match the transition duration
        }
    }

    function populateAvailabilityForm(availability = {}) {
        const form = document.getElementById('availabilityForm');
        
        // Reset form first
        form.reset();
        
        // Set working days
        if (availability.days && Array.isArray(availability.days)) {
            availability.days.forEach(day => {
                const checkbox = form.querySelector(`input[value="${day}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Set working hours with null checks
        const hours = availability.hours || {};
        form.querySelector('input[name="startTime"]').value = hours.start || '';
        form.querySelector('input[name="endTime"]').value = hours.end || '';
        
        // Set break times with null checks
        const breakTimes = hours.break || {};
        form.querySelector('input[name="breakStart"]').value = breakTimes.start || '';
        form.querySelector('input[name="breakEnd"]').value = breakTimes.end || '';
    }

    async function handleAvailabilitySubmit(event) {
        event.preventDefault();
        
        // Validate form
        const form = event.target;
        const selectedDays = form.querySelectorAll('input[name="availableDays"]:checked');
        const startTime = form.querySelector('input[name="startTime"]').value;
        const endTime = form.querySelector('input[name="endTime"]').value;
        
        if (selectedDays.length === 0) {
            showError('Please select at least one working day');
            return;
        }
        
        if (!startTime || !endTime) {
            showError('Please set your working hours');
            return;
        }
        
        const formData = {
            days: Array.from(selectedDays).map(cb => cb.value),
            hours: {
                start: startTime,
                end: endTime,
                break: {
                    start: form.querySelector('input[name="breakStart"]').value || null,
                    end: form.querySelector('input[name="breakEnd"]').value || null
                }
            }
        };

        try {
            const response = await fetch('../php/appointments/update_therapist_availability.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Availability updated successfully');
                toggleAvailabilityModal(false);
            } else {
                throw new Error(result.error || 'Failed to update availability');
            }
        } catch (error) {
            console.error('Error updating availability:', error);
            showError('Failed to update availability: ' + error.message);
        }
    }

    // Helper functions for date/time formatting and error handling
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(timeString) {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function showError(message) {
        // Implement error notification
        alert(message);
    }

    function showSuccess(message) {
        // Implement success notification
        alert(message);
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
