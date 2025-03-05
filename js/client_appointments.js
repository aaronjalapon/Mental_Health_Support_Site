document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadAppointments();

    // Add event listeners
    document.getElementById('statusFilter').addEventListener('change', filterAppointments);
    document.getElementById('dateFilter').addEventListener('change', filterAppointments);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    async function loadAppointments() {
        try {
            const response = await fetch('../php/appointments/fetch_appointments.php');
            const appointments = await response.json();
            
            if (appointments.length === 0) {
                showEmptyState();
            } else {
                renderAppointments(appointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Failed to load appointments');
        }
    }

    function renderAppointments(appointments) {
        const list = document.getElementById('appointmentsList');
        list.innerHTML = appointments.map(appointment => `
            <div class="appointment-card" data-id="${appointment.id}">
                <div class="appointment-header">
                    <h3>Session with ${appointment.therapist_name}</h3>
                    <span class="appointment-status status-${appointment.status.toLowerCase()}">
                        ${appointment.status}
                    </span>
                </div>
                <div class="appointment-details">
                    <div class="detail-item">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${formatDate(appointment.date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Time</span>
                        <span class="detail-value">${formatTime(appointment.time)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Session Type</span>
                        <span class="detail-value">${appointment.session_type}</span>
                    </div>
                </div>
                ${renderAppointmentActions(appointment)}
            </div>
        `).join('');

        // Add event listeners for appointment actions
        attachActionListeners();
    }

    function renderAppointmentActions(appointment) {
        if (appointment.status === 'UPCOMING') {
            return `
                <div class="appointment-actions">
                    <button class="btn btn-primary join-session" data-id="${appointment.id}">
                        <i class="fas fa-video"></i> Join Session
                    </button>
                    <button class="btn btn-secondary reschedule" data-id="${appointment.id}">
                        <i class="fas fa-calendar-alt"></i> Reschedule
                    </button>
                    <button class="btn btn-danger cancel" data-id="${appointment.id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            `;
        }
        return '';
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
        // Implement session joining logic
        window.location.href = `session.html?id=${appointmentId}`;
    }

    function handleReschedule(event) {
        const appointmentId = event.target.dataset.id;
        window.location.href = `book_appointment.html?reschedule=${appointmentId}`;
    }

    function handleCancel(event) {
        const appointmentId = event.target.dataset.id;
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
                    appointmentId,
                    reason
                })
            });

            const result = await response.json();
            
            if (result.success) {
                loadAppointments();
                closeModal();
            } else {
                showError(result.error || 'Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showError('Failed to cancel appointment');
        }
    }

    function filterAppointments() {
        const status = document.getElementById('statusFilter').value;
        const date = document.getElementById('dateFilter').value;
        
        // Implement filtering logic
        loadAppointments(status, date);
    }

    function clearFilters() {
        document.getElementById('statusFilter').value = 'all';
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

    // Modal functions
    function showCancellationModal(appointmentId) {
        const modal = document.getElementById('cancellationModal');
        modal.classList.add('active');
        
        document.getElementById('confirmCancel').onclick = () => {
            const reason = document.getElementById('cancellationReason').value;
            cancelAppointment(appointmentId, reason);
        };
    }

    function closeModal() {
        document.getElementById('cancellationModal').classList.remove('active');
        document.getElementById('cancellationReason').value = '';
    }
});
