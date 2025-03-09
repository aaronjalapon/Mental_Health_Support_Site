document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadAppointments();

    // Add event listeners
    document.getElementById('statusFilter').addEventListener('change', filterAppointments);
    document.getElementById('typeFilter').addEventListener('change', filterAppointments); // Add this line
    document.getElementById('dateFilter').addEventListener('change', filterAppointments);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    async function loadAppointments(status = 'all', type = 'all', date = '') {
        try {
            let url = '../php/appointments/fetch_appointments.php';
            
            // Add query parameters if filters are active
            const params = new URLSearchParams();
            if (status !== 'all') params.append('status', status);
            if (type !== 'all') params.append('type', type);
            if (date) params.append('date', date);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                console.error('Server Error:', result.error);
                throw new Error(result.error || 'Failed to load appointments');
            }
            
            if (!result.data || result.data.length === 0) {
                showEmptyState();
            } else {
                renderAppointments(result.data);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Failed to load appointments: ' + error.message);
            showEmptyState();
        }
    }

    function renderAppointments(appointments) {
        const list = document.getElementById('appointmentsList');
        
        if (!appointments || appointments.length === 0) {
            showEmptyState();
            return;
        }
    
        list.innerHTML = appointments.map(appointment => {
            // Add null checks and default values
            const therapistName = appointment.therapist_name || 'Not Assigned';
            const status = (appointment.status || 'pending').toLowerCase();
            const sessionType = appointment.session_type || 'video';
            const appointmentDate = appointment.date ? formatDate(appointment.date) : 'Date not set';
            const appointmentTime = appointment.time ? formatTime(appointment.time) : 'Time not set';
            
            // Update status text based on who requested the reschedule
            const statusText = (status === 'reschedule_pending' && appointment.reschedule_by === 'therapist') 
                ? 'Therapist Requested Reschedule'
                : (status === 'reschedule_requested' && appointment.reschedule_by === 'client')
                ? 'Your Reschedule Request'
                : formatStatus(status);

            const statusIcon = {
                'pending': 'fa-clock',
                'upcoming': 'fa-calendar-check',
                'completed': 'fa-check-circle',
                'cancelled': 'fa-times-circle',
                'rejected': 'fa-times-circle',
                'reschedule_pending': 'fa-calendar-alt',
                'reschedule_requested': 'fa-calendar-alt'
            }[status] || 'fa-calendar';

            const sessionIcon = {
                'video': 'fa-video',
                'voice': 'fa-microphone',
                'chat': 'fa-comments'
            }[sessionType.toLowerCase()] || 'fa-video';

            let proposedScheduleInfo = '';
            if (appointment.proposed_date && appointment.proposed_time) {
                proposedScheduleInfo = `
                    <div class="reschedule-info">
                        <p><strong>Proposed Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                        <p><strong>Proposed Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                        ${appointment.reschedule_notes ? 
                            `<p><strong>${appointment.reschedule_by === 'therapist' ? "Therapist's" : 'Your'} Note:</strong> ${appointment.reschedule_notes}</p>` 
                            : ''
                        }
                    </div>
                `;
            }
    
            let actions = '';
            if (status === 'reschedule_pending') {
                actions = `
                    <div class="reschedule-notice">
                        <p>Therapist has requested to reschedule to:</p>
                        <p><strong>New Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                        <p><strong>New Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                        <p><strong>Therapist's Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="appointment-btn appointment-btn-primary agree-reschedule" data-id="${appointment.id}">
                            <i class="fas fa-check"></i> Agree to Schedule
                        </button>
                        <button class="appointment-btn appointment-btn-secondary suggest-time" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Suggest Different Time
                        </button>
                        <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>
                    </div>`;
            }

            return `
                <div class="appointment-card" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <h3>Session with ${therapistName}</h3>
                        <span class="appointment-status status-${status}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                    </div>
                    <div class="appointment-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${appointmentDate}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${appointmentTime}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas ${sessionIcon}"></i>
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${formatSessionType(sessionType)}</span>
                        </div>
                    </div>
                    ${renderAppointmentActions(appointment)}
                    ${actions}
                </div>
            `;
        }).join('');
    
        hideEmptyState();

        // Initialize buttons after rendering - ONLY USE THIS ONE
        initializeAppointmentButtons();
    }

    function renderAppointmentActions(appointment) {
        // Don't show actions for completed or cancelled appointments
        if (appointment.status.toLowerCase() === 'completed' || 
            appointment.status.toLowerCase() === 'cancelled') {
            return '';
        }

        // Show different actions based on status
        let actions = '';
        
        if (appointment.status.toLowerCase() === 'upcoming') {
            actions = `
                <button class="appointment-btn appointment-btn-secondary reschedule" data-id="${appointment.id}">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                    <i class="fas fa-times"></i> Cancel Appointment
                </button>
            `;
        } else if (appointment.status.toLowerCase() === 'reschedule_requested') {
            if (appointment.reschedule_by === 'therapist' && appointment.status === 'reschedule_requested') {
                // Show as reschedule_pending in client view when therapist requests
                status = 'reschedule_pending';
                actions = `
                    <div class="reschedule-notice">
                        <p>Therapist has requested to reschedule to:</p>
                        <p><strong>New Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                        <p><strong>New Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                        <p><strong>Therapist's Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="appointment-btn appointment-btn-primary agree-reschedule" data-id="${appointment.id}">
                            <i class="fas fa-check"></i> Agree to Schedule
                        </button>
                        <button class="appointment-btn appointment-btn-secondary suggest-time" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Suggest Different Time
                        </button>
                        <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>
                    </div>`;
            } else if (appointment.reschedule_by === 'client' && appointment.status === 'reschedule_requested') {
                actions = `
                    <div class="reschedule-notice">
                        <p>You have requested to reschedule to:</p>
                        <p><strong>New Date:</strong> ${formatDate(appointment.proposed_date)}</p>
                        <p><strong>New Time:</strong> ${formatTime(appointment.proposed_time)}</p>
                        <p><strong>Your Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="appointment-btn appointment-btn-secondary suggest-time" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Suggest Different Time
                        </button>
                        <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>
                    </div>`;
            }
        } else if (appointment.status.toLowerCase() === 'pending') {
            actions = `
                <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                    <i class="fas fa-times"></i> Cancel Appointment
                </button>
            `;
        }

        return `<div class="appointment-actions">${actions}</div>`;
    }

    function attachActionListeners() {
        // Remove join session event listener
        document.querySelectorAll('.reschedule').forEach(button => {
            button.addEventListener('click', handleReschedule);
        });

        document.querySelectorAll('.cancel').forEach(button => {
            button.addEventListener('click', handleCancel);
        });
    }

    // Remove handleJoinSession function since it's no longer needed

    async function handleReschedule(event) {
        const appointmentId = event.target.dataset.id;
        window.location.href = `book_appointment.html?reschedule=${appointmentId}`;
    }

    function handleCancel(event) {
        const appointmentId = event.target.closest('.cancel').dataset.id;
        showCancellationModal(appointmentId);
    }

    async function cancelAppointment(appointmentId, reason) {
        try {
            const response = await fetch('../php/appointments/cancel_appointment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: parseInt(appointmentId),
                    reason: reason
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to cancel appointment');
            }

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Appointment cancelled successfully
            `;
            document.querySelector('.appointments-container').insertBefore(
                successMessage, 
                document.querySelector('.appointments-list')
            );

            // Reload appointments and close modal
            await loadAppointments();
            closeModal();

            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);

        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showError(error.message || 'Failed to cancel appointment');
        }
    }

    async function handleAgreeReschedule(event) {
        const appointmentId = event.currentTarget.dataset.id;
        
        if (confirm('Are you sure you want to accept this schedule?')) {
            try {
                const response = await fetch('../php/appointments/accept_reschedule.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appointmentId })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('New schedule accepted successfully');
                    loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to accept schedule');
                }
            } catch (error) {
                showError('Failed to accept schedule: ' + error.message);
            }
        }
    }

    function renderRescheduleInfo(appointment) {
        // Determine header text based on who initiated the reschedule
        const headerText = appointment.reschedule_by === 'therapist' ? 
            "Therapist's Requested Schedule" : 
            "Current Schedule";

        return `
            <h4>${headerText}</h4>
            <p><strong>Therapist:</strong> ${appointment.therapist_name}</p>
            <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
        `;
    }

    async function handleSuggestTime(event) {
        const appointmentId = event.currentTarget.dataset.id;
        try {
            // Get the appointment card and reschedule notice directly
            const appointmentCard = event.currentTarget.closest('.appointment-card');
            const rescheduleNotice = appointmentCard.querySelector('.reschedule-notice');
            const therapistName = appointmentCard.querySelector('h3').textContent.replace('Session with ', '');
            
            // Get the requested date and time from the reschedule notice
            const requestedDate = rescheduleNotice.querySelector('p:nth-child(2)').textContent.replace('New Date:', '').trim();
            const requestedTime = rescheduleNotice.querySelector('p:nth-child(3)').textContent.replace('New Time:', '').trim();
            const therapistNote = rescheduleNotice.querySelector('p:nth-child(4)').textContent.replace("Therapist's Note:", '').trim();

            // Show the modal with the therapist's requested schedule
            const modal = document.getElementById('rescheduleModal');
            document.getElementById('rescheduleInfo').innerHTML = `
                <h4>Therapist's Requested Schedule</h4>
                <p><strong>Therapist:</strong> ${therapistName}</p>
                <p><strong>Proposed Date:</strong> ${requestedDate}</p>
                <p><strong>Proposed Time:</strong> ${requestedTime}</p>
                <p><strong>Therapist's Note:</strong> ${therapistNote}</p>
            `;

            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newDate').min = today;
            
            // Show modal
            modal.style.display = 'block';
        } catch (error) {
            showError('Failed to load appointment details: ' + error.message);
        }
    }

    function showSuccess(message) {
        // Create success notification element
        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add modal close handlers
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    function filterAppointments() {
        const status = document.getElementById('statusFilter').value;
        const type = document.getElementById('typeFilter').value;
        const date = document.getElementById('dateFilter').value;
        loadAppointments(status, type, date);
    }

    function clearFilters() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('dateFilter').value = '';
        loadAppointments();
    }

    function showEmptyState() {
        document.getElementById('appointmentsList').style.display = 'none';
        document.getElementById('noAppointments').style.display = 'block';
    }

    function hideEmptyState() {
        document.getElementById('appointmentsList').style.display = 'block';
        document.getElementById('noAppointments').style.display = 'none';
    }

    // Helper functions
    function formatDate(dateString) {
        if (!dateString) return 'Date not set';
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
        if (!timeString) return 'Time not set';
        try {
            return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Invalid Time';
        }
    }

    function showError(message) {
        // Create error notification element
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add helper function for capitalization
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Update the session type display formatting
    function formatSessionType(type) {
        const types = {
            'video': 'Video Call',
            'voice': 'Voice Call',
            'chat': 'Chat Session'
        };
        return types[type] || type;
    }

    // Add helper function for status formatting
    function formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'upcoming': 'Upcoming',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'rejected': 'Rejected',
            'cancellation_pending': 'Cancellation Pending',  // Add this line
            'reschedule_pending': 'Therapist Requested Reschedule',
            'reschedule_requested': 'Your Reschedule Request'
        };
        return statusMap[status.toLowerCase()] || status;
    }

    // Modal functions
    function showCancellationModal(appointmentId) {
        const modal = document.getElementById('cancellationModal');
        if (!modal) return;

        const appointmentCard = document.querySelector(`.appointment-card[data-id="${appointmentId}"]`);
        if (!appointmentCard) return;

        // Get appointment details
        const therapistName = appointmentCard.querySelector('h3').textContent;
        const date = appointmentCard.querySelector('.detail-value').textContent;
        const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
        
        // Update modal content
        const appointmentInfo = modal.querySelector('.cancel-appointment-info');
        if (appointmentInfo) {
            appointmentInfo.innerHTML = `
                <p><strong>${therapistName}</strong></p>
                <p><i class="fas fa-calendar"></i> ${date}</p>
                <p><i class="fas fa-clock"></i> ${time}</p>
            `;
        }

        // Show modal
        modal.style.display = 'flex';
        
        // Remove any existing event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const keepBtn = document.getElementById('keepAppointment');
        const confirmBtn = document.getElementById('confirmCancel');
        
        // Clear old event listeners
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        keepBtn.replaceWith(keepBtn.cloneNode(true));
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        
        // Get fresh references
        const newCloseBtn = modal.querySelector('.modal-close');
        const newKeepBtn = document.getElementById('keepAppointment');
        const newConfirmBtn = document.getElementById('confirmCancel');
        
        // Setup new event handlers
        const closeModal = () => {
            modal.style.display = 'none';
            const reasonInput = document.getElementById('cancelReason');
            if (reasonInput) reasonInput.value = '';
        };

        // Attach new event listeners
        newCloseBtn.onclick = closeModal;
        newKeepBtn.onclick = closeModal;
        newConfirmBtn.onclick = () => {
            const reason = document.getElementById('cancelReason')?.value?.trim() || '';
            cancelAppointment(appointmentId, reason);
        };

        // Handle click outside modal
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    // Initialize event listeners for the buttons
    function initializeAppointmentButtons() {
        // Cancel buttons
        document.querySelectorAll('.cancel').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const appointmentId = this.dataset.id;
                if (appointmentId) {
                    showCancellationModal(appointmentId);
                }
            });
        });

        // Reschedule buttons
        document.querySelectorAll('.reschedule').forEach(button => {
            button.removeEventListener('click', handleReschedule); // Remove existing
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const appointmentId = this.dataset.id;
                showRescheduleModal(this, appointmentId);
            });
        });

        // Agree reschedule buttons
        document.querySelectorAll('.agree-reschedule').forEach(btn =>
            btn.addEventListener('click', handleAgreeReschedule));
        
        // Suggest time buttons
        document.querySelectorAll('.suggest-time').forEach(btn =>
            btn.addEventListener('click', handleSuggestTime));
    }

    // Add these modal handler functions
    function showCancelModal(event) {
        const appointmentId = event.currentTarget.dataset.id;
        const appointmentCard = event.currentTarget.closest('.appointment-card');
        const date = appointmentCard.querySelector('.detail-value').textContent;
        const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
        
        const modal = document.getElementById('cancellationModal');
        const infoDiv = modal.querySelector('.cancel-appointment-info');
        
        infoDiv.innerHTML = `
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
        `;
        
        modal.dataset.appointmentId = appointmentId;
        modal.style.display = 'flex';

        // Add submit handler for the cancel form
        document.getElementById('cancelForm').onsubmit = async function(e) {
            e.preventDefault();
            const reason = document.getElementById('cancelReason').value;
            await handleCancellation(appointmentId, reason);
        };
    }

    function showRescheduleModal(button, appointmentId) {
        const appointmentCard = button.closest('.appointment-card');
        if (!appointmentCard) return;
        
        const modal = document.getElementById('rescheduleModal');
        if (!modal) return;
        
        const date = appointmentCard.querySelector('.detail-value').textContent;
        const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
        
        const infoDiv = modal.querySelector('#rescheduleInfo');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <p><strong>Current Date:</strong> ${date}</p>
                <p><strong>Current Time:</strong> ${time}</p>
            `;
        }
        
        // Set minimum date as today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newDate').min = today;
        
        modal.dataset.appointmentId = appointmentId;
        modal.style.display = 'flex';

        // Add submit handler for the reschedule form
        document.getElementById('rescheduleForm').onsubmit = async function(e) {
            e.preventDefault();
            await handleReschedule(appointmentId);
        };
    }

    async function handleCancellation(appointmentId, reason) {
        try {
            const response = await fetch('../php/appointments/cancel_appointment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: appointmentId,
                    reason: reason
                })
            });

            const data = await response.json();
            if (data.success) {
                document.getElementById('cancellationModal').style.display = 'none';
                document.getElementById('cancelReason').value = '';
                loadAppointments(); // Refresh the appointments list
                showSuccess('Appointment cancelled successfully');
            } else {
                showError(data.error || 'Failed to cancel appointment');
            }
        } catch (error) {
            showError('Error cancelling appointment');
            console.error(error);
        }
    }

    async function handleReschedule(appointmentId) {
        const newDate = document.getElementById('newDate').value;
        const newTime = document.getElementById('newTime').value;
        const notes = document.getElementById('rescheduleNotes').value;

        try {
            const response = await fetch('../php/appointments/reschedule_appointment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: appointmentId,
                    newDate: newDate,
                    newTime: newTime,
                    notes: notes
                })
            });

            const data = await response.json();
            if (data.success) {
                document.getElementById('rescheduleModal').style.display = 'none';
                document.getElementById('rescheduleForm').reset();
                loadAppointments(); // Refresh the appointments list
                showSuccess('Reschedule request sent successfully');
            } else {
                showError(data.error || 'Failed to reschedule appointment');
            }
        } catch (error) {
            showError('Error rescheduling appointment');
            console.error(error);
        }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('cancel-appointment-modal')) {
            closeModal();
        }
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Close modal when clicking close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            this.closest('.cancel-appointment-modal').style.display = 'none';
        });
    });

    // Initialize the page
    loadAppointments();
});

// Update the close button handlers to be more defensive
function closeModal() {
    const modal = document.getElementById('cancellationModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    
    // Clear the form inputs
    const reasonInput = document.getElementById('cancelReason');
    if (reasonInput) reasonInput.value = '';
}

// Remove the old close button handlers and replace with this:
document.addEventListener('DOMContentLoaded', function() {
    // ...existing initialization code...

    // Single unified close handler
    document.addEventListener('click', function(event) {
        // Handle clicks on close buttons
        if (event.target.classList.contains('close-modal')) {
            const modal = event.target.closest('.modal, .cancel-appointment-modal');
            if (modal) modal.style.display = 'none';
        }
        
        // Handle clicks on modal background
        if (event.target.classList.contains('cancel-appointment-modal') || 
            event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }

        // Handle keep appointment button
        if (event.target.id === 'keepAppointment') {
            closeModal();
        }
    });

    // ...rest of existing code...
});

document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...

    // Single modal close handler
    document.addEventListener('click', function(event) {
        // Close modal when clicking outside
        if (event.target.classList.contains('cancel-appointment-modal')) {
            const modal = document.getElementById('cancellationModal');
            if (modal) modal.style.display = 'none';
        }

        // Close modal when clicking close button
        if (event.target.classList.contains('modal-close')) {
            const modal = event.target.closest('.cancel-appointment-modal');
            if (modal) modal.style.display = 'none';
        }

        // Handle keep appointment button
        if (event.target.id === 'keepAppointment') {
            const modal = document.getElementById('cancellationModal');
            if (modal) modal.style.display = 'none';
        }
    });

    // Remove old modal close handlers
    function closeModal() {
        const modal = document.getElementById('cancellationModal');
        if (modal) {
            modal.style.display = 'none';
            const reasonInput = document.getElementById('cancelReason');
            if (reasonInput) reasonInput.value = '';
        }
    }

    // ...existing code...
});

// Remove all other modal-related event listeners
document.removeEventListener('click', window.modalClickHandler);
window.modalClickHandler = function(event) {
    // Single unified close handler
    if (event.target.classList.contains('cancel-appointment-modal')) {
        const modal = document.getElementById('cancellationModal');
        if (modal) modal.style.display = 'none';
    }
};
document.addEventListener('click', window.modalClickHandler);

// Remove conflicting event listeners
document.removeEventListener('click', window.modalClickHandler);

// Single unified close handler
window.modalClickHandler = function(event) {
    if (event.target.classList.contains('cancel-appointment-modal')) {
        const modal = document.getElementById('cancellationModal');
        if (modal) modal.style.display = 'none';
    }

    if (event.target.classList.contains('modal-close')) {
        const modal = event.target.closest('.cancel-appointment-modal');
        if (modal) modal.style.display = 'none';
    }

    if (event.target.id === 'keepAppointment') {
        const modal = document.getElementById('cancellationModal');
        if (modal) modal.style.display = 'none';
    }
};

document.addEventListener('click', window.modalClickHandler);

// Update showCancellationModal function
function showCancellationModal(appointmentId) {
    const modal = document.getElementById('cancellationModal');
    if (!modal) return;

    const appointmentCard = document.querySelector(`.appointment-card[data-id="${appointmentId}"]`);
    if (!appointmentCard) return;

    // Get appointment details
    const therapistName = appointmentCard.querySelector('h3').textContent;
    const date = appointmentCard.querySelector('.detail-value').textContent;
    const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
    
    // Update modal content
    const appointmentInfo = modal.querySelector('.cancel-appointment-info');
    if (appointmentInfo) {
        appointmentInfo.innerHTML = `
            <p><strong>${therapistName}</strong></p>
            <p><i class="fas fa-calendar"></i> ${date}</p>
            <p><i class="fas fa-clock"></i> ${time}</p>
        `;
    }

    // Show modal
    modal.style.display = 'flex';
    
    // Remove any existing event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const keepBtn = document.getElementById('keepAppointment');
    const confirmBtn = document.getElementById('confirmCancel');
    
    // Clear old event listeners
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    keepBtn.replaceWith(keepBtn.cloneNode(true));
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    
    // Get fresh references
    const newCloseBtn = modal.querySelector('.modal-close');
    const newKeepBtn = document.getElementById('keepAppointment');
    const newConfirmBtn = document.getElementById('confirmCancel');
    
    // Setup new event handlers
    const closeModal = () => {
        modal.style.display = 'none';
        const reasonInput = document.getElementById('cancelReason');
        if (reasonInput) reasonInput.value = '';
    };

    // Attach new event listeners
    newCloseBtn.onclick = closeModal;
    newKeepBtn.onclick = closeModal;
    newConfirmBtn.onclick = () => {
        const reason = document.getElementById('cancelReason')?.value?.trim() || '';
        cancelAppointment(appointmentId, reason);
    };

    // Handle click outside modal
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// Remove old close button handlers
document.querySelectorAll('.close-modal').forEach(button => {
    button.removeEventListener('click', null);
});
