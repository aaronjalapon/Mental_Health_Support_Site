// Utility functions
const Utils = {
    showError(message) {
        this.showNotification(message, 'error');
    },

    showSuccess(message) {
        this.showNotification(message, 'success');
    },

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation' : 'check'}-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    formatDate(dateString) {
        if (!dateString) return 'Date not set';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime(timeString) {
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
    },

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'upcoming': 'Upcoming',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'rejected': 'Rejected',
            'cancellation_pending': 'Your Cancellation Request',
            'cancellation_requested': 'Therapist Requested Cancellation',
            'reschedule_pending': 'Therapist Requested Reschedule',
            'reschedule_requested': 'Your Reschedule Request'
        };
        return statusMap[status.toLowerCase()] || status;
    },

    formatSessionType(type) {
        if (!type) return 'Video Call'; // Default value
        const types = {
            'video': 'Video Call',
            'voice': 'Voice Call',
            'chat': 'Chat Session'
        };
        return types[type.toLowerCase()] || 'Video Call';
    }
};

// Appointment handling class
class AppointmentManager {
    constructor() {
        this.bindEvents();
        this.loadAppointments();
    }

    bindEvents() {
        document.getElementById('statusFilter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('typeFilter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('dateFilter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        this.setupModalHandlers();
    }

    async loadAppointments(filters = {}) {
        try {
            let url = '../php/appointments/fetch_appointments.php';
            const params = new URLSearchParams(filters);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load appointments');
            }
            
            if (!result.data || result.data.length === 0) {
                this.showEmptyState();
            } else {
                this.renderAppointments(result.data);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            Utils.showError('Failed to load appointments');
            this.showEmptyState();
        }
    }

    renderAppointments(appointments) {
        const list = document.getElementById('appointmentsList');
        
        if (!appointments || appointments.length === 0) {
            this.showEmptyState();
            return;
        }
    
        list.innerHTML = appointments.map(appointment => {
            const therapistName = appointment.therapist_name || 'Not Assigned';
            const status = (appointment.status || 'pending').toLowerCase();
            const sessionType = appointment.session_type || 'video';
            const appointmentDate = appointment.date ? Utils.formatDate(appointment.date) : 'Date not set';
            const appointmentTime = appointment.time ? Utils.formatTime(appointment.time) : 'Time not set';
            
            const statusText = (status === 'reschedule_pending' && appointment.reschedule_by === 'therapist') 
                ? 'Therapist Requested Reschedule'
                : (status === 'reschedule_requested' && appointment.reschedule_by === 'client')
                ? 'Your Reschedule Request'
                : Utils.formatStatus(status);

            const statusIcon = {
                'pending': 'fa-clock',
                'upcoming': 'fa-calendar-check',
                'completed': 'fa-check-circle',
                'cancelled': 'fa-times-circle',
                'rejected': 'fa-times-circle',
                'cancellation_pending': 'fa-clock',
                'cancellation_requested': 'fa-times',
                'reschedule_pending': 'fa-calendar-alt',
                'reschedule_requested': 'fa-calendar-alt'
            }[status] || 'fa-calendar';

            const sessionIcon = {
                'video': 'fa-video',
                'voice': 'fa-microphone',
                'chat': 'fa-comments'
            }[sessionType.toLowerCase()] || 'fa-video';

            let actions = '';
        
            if (status === 'pending') {
                actions = `
                    <div class="appointment-actions">
                        <button class="appointment-btn appointment-btn-secondary reschedule" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Reschedule
                        </button>
                        <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>
                    </div>`;
            }

            if (appointment.status === 'cancellation_requested') {
                actions = `
                    <div class="cancellation-notice">
                        <p><strong>Therapist Requested Cancellation</strong></p>
                        <p><strong>Reason:</strong> ${appointment.cancellation_reason || 'No reason provided'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-danger" onclick="handleCancellationResponse(${appointment.id}, 'approve')">
                            <i class="fas fa-check"></i> Approve Cancellation
                        </button>
                        <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Reschedule
                        </button>
                    </div>
                `;
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
                            <span class="detail-value">${Utils.formatSessionType(sessionType)}</span>
                        </div>
                    </div>
                    <div class="btn-container">
                        ${actions}
                        ${this.renderAppointmentActions(appointment)}
                    </div>
                </div>
            `;
        }).join('');
    
        this.hideEmptyState();
        this.initializeAppointmentButtons();
    }

    renderAppointmentActions(appointment) {
        const status = appointment.status.toLowerCase();
        let actions = '';

        switch(status) {
            case 'reschedule_requested':
                if (appointment.reschedule_by === 'client') {
                    actions = `
                        <div class="reschedule-notice">
                            <p>Your reschedule request:</p>
                            <p><strong>New Date:</strong> ${Utils.formatDate(appointment.proposed_date)}</p>
                            <p><strong>New Time:</strong> ${Utils.formatTime(appointment.proposed_time)}</p>
                            <p><strong>Proposed Session Type:</strong> ${Utils.formatSessionType(appointment.proposed_session_type || appointment.session_type)}</p>
                            <p><strong>Your Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                            <p class="status-note">Waiting for therapist's response...</p>
                        </div>`;
                }
                break;
            case 'reschedule_pending':
            case 'reschedule_requested':
                if (appointment.reschedule_by === 'therapist') {
                    actions = `
                        <div class="reschedule-notice">
                            <p>Therapist has requested to reschedule to:</p>
                            <p><strong>New Date:</strong> ${Utils.formatDate(appointment.proposed_date)}</p>
                            <p><strong>New Time:</strong> ${Utils.formatTime(appointment.proposed_time)}</p>
                            <p><strong>Proposed Session Type:</strong> ${Utils.formatSessionType(appointment.proposed_session_type || appointment.session_type)}</p>
                            <p><strong>Therapist's Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="appointment-btn appointment-btn-primary agree-reschedule" data-id="${appointment.id}">
                                <i class="fas fa-check"></i> Accept Schedule
                            </button>
                            <button class="appointment-btn appointment-btn-secondary suggest-time" data-id="${appointment.id}">
                                <i class="fas fa-calendar-alt"></i> Suggest Different Time
                            </button>
                            <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                                <i class="fas fa-times"></i> Cancel Appointment
                            </button>
                        </div>`;
                }
                break;
            case 'upcoming':
                actions = `
                    <div class="appointment-actions">
                        <button class="appointment-btn appointment-btn-secondary reschedule" data-id="${appointment.id}">
                            <i class="fas fa-calendar-alt"></i> Reschedule
                        </button>
                        <button class="appointment-btn appointment-btn-danger cancel" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>
                    </div>`;
                break;
        }

        return actions;
    }

    attachActionListeners() {
        document.querySelectorAll('.reschedule').forEach(button => {
            button.addEventListener('click', this.handleReschedule.bind(this));
        });

        document.querySelectorAll('.cancel').forEach(button => {
            button.addEventListener('click', this.handleCancel.bind(this));
        });

        document.querySelectorAll('.suggest-time').forEach(btn => 
            btn.addEventListener('click', this.handleSuggestTime.bind(this)));
        
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
    }

    async handleReschedule(eventOrId) {
        if (eventOrId.preventDefault) eventOrId.preventDefault();
        
        const appointmentId = typeof eventOrId === 'object' ? 
            eventOrId.currentTarget.dataset.id : 
            eventOrId;

        if (!appointmentId) {
            Utils.showError('Could not find appointment ID');
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
            
            this.showRescheduleModal(data.appointment);
        } catch (error) {
            console.error('Reschedule error:', error);
            Utils.showError('Failed to load appointment details: ' + error.message);
        }
    }

    handleCancel(event) {
        const appointmentId = event.target.closest('.cancel').dataset.id;
        this.showCancellationModal(appointmentId);
    }

    async cancelAppointment(appointmentId, reason) {
        try {
            if (!appointmentId) {
                throw new Error('Invalid appointment ID');
            }

            const response = await fetch('../php/appointments/cancel_appointment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: String(appointmentId),
                    reason: reason || ''
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to cancel appointment');
            }

            Utils.showSuccess('Cancellation request sent successfully');
            await this.loadAppointments();
            return true;

        } catch (error) {
            console.error('Error cancelling appointment:', error);
            Utils.showError(error.message || 'Failed to cancel appointment');
            return false;
        }
    }

    async handleAgreeReschedule(event) {
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
                    Utils.showSuccess('New schedule accepted successfully');
                    this.loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to accept schedule');
                }
            } catch (error) {
                Utils.showError('Failed to accept schedule: ' + error.message);
            }
        }
    }

    async handleSuggestTime(event) {
        event.preventDefault();
        const appointmentId = event.currentTarget.dataset.id;
        const appointmentCard = event.currentTarget.closest('.appointment-card');
        
        if (!appointmentCard) {
            Utils.showError('Could not find appointment details');
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
            
            this.showRescheduleModal(data.appointment);
        } catch (error) {
            console.error('Reschedule error:', error);
            Utils.showError('Failed to load appointment details: ' + error.message);
        }
    }

    showRescheduleModal(appointment) {
        const modal = document.getElementById('rescheduleModal');
        if (!modal) {
            Utils.showError('Reschedule modal not found');
            return;
        }

        const modalContent = `
            <h4>Current Schedule</h4>
            <p><strong>Therapist:</strong> ${appointment.therapist_name}</p>
            <p><strong>Date:</strong> ${Utils.formatDate(appointment.date)}</p>
            <p><strong>Time:</strong> ${Utils.formatTime(appointment.time)}</p>
            <p><strong>Session Type:</strong> ${Utils.formatSessionType(appointment.session_type)}</p>`;

        const rescheduleInfo = document.getElementById('rescheduleInfo');
        if (rescheduleInfo) {
            rescheduleInfo.innerHTML = modalContent;
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const newDateInput = document.getElementById('newDate');
        if (newDateInput) {
            newDateInput.min = today;
            newDateInput.value = appointment.date;
        }

        // Set current time and session type
        document.getElementById('newTime').value = appointment.time;
        document.getElementById('sessionType').value = appointment.session_type;

        // Show modal
        modal.style.display = 'block';

        // Setup form submission
        this.setupRescheduleFormSubmit(appointment);
    }

    setupRescheduleFormSubmit(appointment) {
        const form = document.getElementById('rescheduleForm');
        if (!form) return;

        form.onsubmit = async (e) => {
            e.preventDefault();
            
            try {
                const appointmentId = appointment?.id;
                if (!appointmentId) throw new Error('Invalid appointment ID');

                const formData = {
                    appointmentId: appointmentId,
                    newDate: document.getElementById('newDate').value,
                    newTime: document.getElementById('newTime').value,
                    sessionType: document.getElementById('sessionType').value,
                    notes: document.getElementById('rescheduleNotes').value
                };

                const response = await fetch('../php/appointments/reschedule_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                if (data.success) {
                    Utils.showSuccess('Reschedule request sent successfully');
                    const modal = document.getElementById('rescheduleModal');
                    if (modal) {
                        modal.style.display = 'none';
                        form.reset();
                    }
                    this.loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to reschedule appointment');
                }
            } catch (error) {
                Utils.showError('Failed to reschedule appointment: ' + error.message);
            }
        };
    }

    showEmptyState() {
        document.getElementById('appointmentsList').style.display = 'none';
        document.getElementById('noAppointments').style.display = 'block';
    }

    hideEmptyState() {
        document.getElementById('appointmentsList').style.display = 'block';
        document.getElementById('noAppointments').style.display = 'none';
    }

    filterAppointments() {
        const status = document.getElementById('statusFilter').value;
        const type = document.getElementById('typeFilter').value;
        const date = document.getElementById('dateFilter').value;
        this.loadAppointments({ status, type, date });
    }

    clearFilters() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('dateFilter').value = '';
        this.loadAppointments();
    }

    showCancellationModal(appointmentId) {
        const modal = document.getElementById('cancellationModal');
        if (!modal) return;

        const appointmentCard = document.querySelector(`.appointment-card[data-id="${appointmentId}"]`);
        if (!appointmentCard) return;

        modal.dataset.appointmentId = appointmentId;

        const therapistName = appointmentCard.querySelector('h3').textContent;
        const date = appointmentCard.querySelector('.detail-value').textContent;
        const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
        
        const appointmentInfo = modal.querySelector('.cancel-appointment-info');
        if (appointmentInfo) {
            appointmentInfo.innerHTML = `
                <p><strong>${therapistName}</strong></p>
                <p><i class="fas fa-calendar"></i> ${date}</p>
                <p><i class="fas fa-clock"></i> ${time}</p>
            `;
        }

        modal.style.display = 'flex';
        
        const closeBtn = modal.querySelector('.modal-close');
        const keepBtn = document.getElementById('keepAppointment');
        const confirmBtn = document.getElementById('confirmCancel');
        
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        keepBtn.replaceWith(keepBtn.cloneNode(true));
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        
        const newCloseBtn = modal.querySelector('.modal-close');
        const newKeepBtn = document.getElementById('keepAppointment');
        const newConfirmBtn = document.getElementById('confirmCancel');
        
        const closeModal = () => {
            modal.style.display = 'none';
            const reasonInput = document.getElementById('clientCancelReason');
            if (reasonInput) reasonInput.value = '';
        };

        newCloseBtn.onclick = closeModal;
        newKeepBtn.onclick = closeModal;
        newConfirmBtn.onclick = async () => {
            const reason = document.getElementById('clientCancelReason').value.trim();
            const appointmentIdToCancel = appointmentCard.dataset.id;
            if (!appointmentIdToCancel) {
                Utils.showError('Invalid appointment ID');
                return;
            }
            await this.cancelAppointment(appointmentIdToCancel, reason);
            closeModal();
            await this.loadAppointments();
        };

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    initializeAppointmentButtons() {
        // Cancel buttons
        document.querySelectorAll('.cancel').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const appointmentId = button.dataset.id;
                if (appointmentId) {
                    this.showCancellationModal(appointmentId);
                }
            });
        });

        // Reschedule buttons
        document.querySelectorAll('.reschedule, .reschedule-appointment').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const appointmentId = button.dataset.id;
                if (appointmentId) {
                    this.handleReschedule(e); // Pass the event instead of just the ID
                }
            });
        });

        // Agree reschedule buttons
        document.querySelectorAll('.agree-reschedule').forEach(btn =>
            btn.addEventListener('click', (e) => this.handleAgreeReschedule(e)));
        
        // Suggest time buttons
        document.querySelectorAll('.suggest-time').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleSuggestTime(e)));

        // Add handlers for cancellation response
        document.querySelectorAll('[onclick*="handleCancellationResponse"]').forEach(btn => {
            const match = btn.getAttribute('onclick').match(/handleCancellationResponse\((\d+),\s*'(\w+)'\)/);
            if (match) {
                const [_, appointmentId, action] = match;
                btn.onclick = (e) => {
                    e.preventDefault();
                    this.handleCancellationResponse(appointmentId, action);
                };
            }
        });
    }

    async handleCancellationResponse(appointmentId, action) {
        if (!confirm('Are you sure you want to ' + (action === 'approve' ? 'approve' : 'reject') + ' this cancellation?')) {
            return;
        }

        try {
            const response = await fetch('../php/appointments/respond_to_cancellation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appointmentId: appointmentId,
                    action: action
                })
            });

            const data = await response.json();
            if (data.success) {
                Utils.showSuccess(data.message || 'Cancellation request processed');
                this.loadAppointments();
            } else {
                throw new Error(data.error || 'Failed to process cancellation');
            }
        } catch (error) {
            Utils.showError('Error processing cancellation: ' + error.message);
        }
    }

    setupModalHandlers() {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('close-modal')) {
                const modal = event.target.closest('.modal, .cancel-appointment-modal');
                if (modal) modal.style.display = 'none';
            }
            
            if (event.target.classList.contains('cancel-appointment-modal') || 
                event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }

            if (event.target.id === 'keepAppointment') {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('cancellationModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        
        const reasonInput = document.getElementById('cancelReason');
        if (reasonInput) reasonInput.value = '';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appointmentManager = new AppointmentManager();
});

// Make handleCancellationResponse available globally
window.handleCancellationResponse = function(appointmentId, action) {
    if (window.appointmentManager) {
        return window.appointmentManager.handleCancellationResponse(appointmentId, action);
    } else {
        console.error('Appointment manager not initialized');
    }
};
