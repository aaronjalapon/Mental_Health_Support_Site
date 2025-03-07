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
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load appointments');
            }
            
            if (result.data.length === 0) {
                showEmptyState();
            } else {
                renderAppointments(result.data);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Failed to load appointments');
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
            
            const statusIcon = {
                'pending': 'fa-clock',
                'upcoming': 'fa-calendar-check',
                'completed': 'fa-check-circle',
                'cancelled': 'fa-times-circle',
                'rejected': 'fa-times-circle'
            }[status] || 'fa-calendar';
    
            const sessionIcon = {
                'video': 'fa-video',
                'voice': 'fa-microphone',
                'chat': 'fa-comments'
            }[sessionType.toLowerCase()] || 'fa-video';
    
            return `
                <div class="appointment-card" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <h3>Session with ${therapistName}</h3>
                        <span class="appointment-status status-${status}">
                            <i class="fas ${statusIcon}"></i> ${status}
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
                </div>
            `;
        }).join('');
    
        hideEmptyState();
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
            const sessionIcon = {
                video: 'fa-video',
                voice: 'fa-microphone',
                chat: 'fa-comments'
            }[appointment.session_type.toLowerCase()] || 'fa-video';

            actions = `
                <button class="appointment-btn appointment-btn-primary join-session" data-id="${appointment.id}" data-type="${appointment.session_type}">
                    <i class="fas ${sessionIcon}"></i> Join Session
                </button>
                <button class="appointment-btn appointment-btn-secondary reschedule" data-id="${appointment.id}">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
            `;
        }

        // Add cancel button for pending and upcoming appointments
        actions += `
            <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;

        return `<div class="appointment-actions">${actions}</div>`;
    }

    function attachActionListeners() {
        // Join session button
        document.querySelectorAll('.join-session').forEach(button => {
            button.addEventListener('click', handleJoinSession);
        });

        // Reschedule button
        document.querySelectorAll('.reschedule').forEach(button => {
            button.addEventListener('click', handleReschedule);
        });

        // Cancel button
        document.querySelectorAll('.cancel').forEach(button => {
            button.addEventListener('click', handleCancel);
        });
    }

    async function handleJoinSession(event) {
        const appointmentId = event.target.dataset.id;
        const sessionType = event.target.dataset.type;
        
        // Redirect based on session type
        let sessionPath;
        switch(sessionType.toLowerCase()) {
            case 'video':
                sessionPath = 'video_session.php';
                break;
            case 'voice':
                sessionPath = 'voice_session.php';
                break;
            case 'chat':
                sessionPath = 'chat_session.php';
                break;
            default:
                showError('Invalid session type');
                return;
        }
        
        window.location.href = `../html/${sessionPath}?id=${appointmentId}`;
    }

    function handleReschedule(event) {
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
        // Implement error notification
        alert(message);
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

    // Modal functions
    function showCancellationModal(appointmentId) {
        const modal = document.getElementById('cancellationModal');
        const appointmentCard = document.querySelector(`.appointment-card[data-id="${appointmentId}"]`);
        
        if (!modal || !appointmentCard) return;
        
        // Get appointment details
        const therapistName = appointmentCard.querySelector('h3').textContent;
        const date = appointmentCard.querySelector('.detail-value').textContent;
        const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
        
        // Update appointment info
        const appointmentInfo = modal.querySelector('.cancel-appointment-info');
        appointmentInfo.innerHTML = `
            <p><strong>${therapistName}</strong></p>
            <p><i class="fas fa-calendar"></i> ${date}</p>
            <p><i class="fas fa-clock"></i> ${time}</p>
        `;
        
        // Show modal
        modal.classList.add('show');
        
        // Setup event listeners
        document.getElementById('confirmCancel').onclick = () => {
            // Add confirmation alert
            if (confirm("Are you absolutely sure you want to cancel this appointment? This action cannot be undone.")) {
                const reason = document.getElementById('cancelReason').value.trim();
                cancelAppointment(appointmentId, reason);
            }
        };
        
        document.getElementById('keepAppointment').onclick = closeModal;
        
        // Focus on textarea
        document.getElementById('cancelReason').focus();
    }

    function closeModal() {
        const modal = document.getElementById('cancellationModal');
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.querySelector('#cancelReason').value = '';
        }, 300);
    }

    // Add event listener for clicking outside modal to close
    document.getElementById('cancellationModal').addEventListener('click', (event) => {
        if (event.target.id === 'cancellationModal') {
            closeModal();
        }
    });
});
