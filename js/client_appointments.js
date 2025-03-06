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
        list.style.display = 'block'; // Make sure list is visible
        document.getElementById('noAppointments').style.display = 'none';
        
        list.innerHTML = appointments.map(appointment => {
            const statusClass = appointment.status.toLowerCase();
            const sessionType = appointment.session_type.toLowerCase();
            
            const statusIcon = {
                pending: 'fa-clock',
                upcoming: 'fa-calendar-check',
                completed: 'fa-check-circle',
                cancelled: 'fa-times-circle'
            }[statusClass];

            const sessionIcon = {
                video: 'fa-video',
                voice: 'fa-microphone',
                chat: 'fa-comments'
            }[sessionType] || 'fa-video';

            return `
                <div class="appointment-card" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <h3>Session with ${appointment.therapist_name}</h3>
                        <span class="appointment-status status-${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${appointment.status}
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

        // Add event listeners for appointment actions
        attachActionListeners();
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

    // Helper functions
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
