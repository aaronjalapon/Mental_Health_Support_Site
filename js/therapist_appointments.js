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
        if (!dateString) return 'Not specified';
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
    },

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'upcoming': 'Upcoming',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'rejected': 'Rejected',
            'cancellation_pending': 'Client Requested Cancellation',
            'cancellation_requested': 'Your Cancellation Request',
            'reschedule_pending': 'Waiting Client Response',
            'reschedule_requested': 'Client Requested Reschedule'
        };
        return statusMap[status.toLowerCase()] || status;
    },

    formatSessionType(type) {
        if (!type) return 'Video Call';
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
        // Filter events
        document.getElementById('statusFilter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('typeFilter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('dateFilter').addEventListener('change', () => this.filterAppointments());
        document.getElementById('searchClient').addEventListener('input', () => this.filterAppointments());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Availability management
        document.getElementById('manageAvailabilityBtn').addEventListener('click', () => this.handleAvailabilityModal());
        document.getElementById('availabilityForm').addEventListener('submit', (e) => this.handleAvailabilitySubmit(e));

        // Modals
        this.setupModalHandlers();

        // Add logout button handler
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    }

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                const response = await fetch('../php/logout.php');
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = '../html/login.php';
                } else {
                    throw new Error(data.error || 'Logout failed');
                }
            } catch (error) {
                Utils.showError('Logout failed: ' + error.message);
            }
        }
    }

    async loadAppointments(filters = {}) {
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
                // Check for any appointments that need status updates
                result.data = result.data.map(appointment => {
                    if (appointment.status === 'upcoming') {
                        const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
                        const appointmentEndTime = new Date(appointmentDateTime.getTime() + (60 * 60 * 1000)); // Add 1 hour
                        if (appointmentEndTime < new Date()) {
                            appointment.status = 'completed';
                        }
                    }
                    return appointment;
                });

                this.renderAppointments(result.data);
                this.updateSummaryCount(result.data);
            } else {
                throw new Error(result.error || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            Utils.showError('Failed to load appointments');
            this.showEmptyState();
        }
    }

    filterAppointments() {
        const statusValue = document.getElementById('statusFilter').value.toLowerCase();
        const typeValue = document.getElementById('typeFilter').value.toLowerCase();
        const dateValue = document.getElementById('dateFilter').value;
        const searchValue = document.getElementById('searchClient').value.toLowerCase();

        this.loadAppointments({
            status: statusValue,
            type: typeValue,
            date: dateValue,
            search: searchValue
        });
    }

    clearFilters() {
        document.getElementById('searchClient').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('dateFilter').value = '';
        this.loadAppointments();
    }

    updateSummaryCount(appointments) {
        const today = new Date().toISOString().split('T')[0];
        
        // Change this to only count upcoming appointments for today
        const todayCount = appointments.filter(app => 
            app.date === today && app.status.toLowerCase() === 'upcoming').length;
        
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

    showEmptyState() {
        const appointmentsList = document.getElementById('appointmentsList');
        const noAppointments = document.getElementById('noAppointments');
        
        if (appointmentsList) appointmentsList.style.display = 'none';
        if (noAppointments) noAppointments.style.display = 'flex';
    }

    hideEmptyState() {
        const appointmentsList = document.getElementById('appointmentsList');
        const noAppointments = document.getElementById('noAppointments');
        
        if (appointmentsList) appointmentsList.style.display = 'flex';
        if (noAppointments) noAppointments.style.display = 'none';
    }

    renderAppointments(appointments) {
        const list = document.getElementById('appointmentsList');
        
        if (!appointments || appointments.length === 0) {
            this.showEmptyState();
            return;
        }

        list.innerHTML = appointments.map(appointment => {
            const status = appointment.status.toLowerCase();
            const statusText = (status === 'reschedule_pending') 
                ? (appointment.reschedule_by === 'therapist' ? 'Waiting Client Response' : 'Therapist Requested Reschedule')
                : Utils.formatStatus(status);
                
            const statusIcon = {
                'pending': 'fa-clock',
                'upcoming': 'fa-calendar-check',
                'completed': 'fa-check-circle',
                'cancelled': 'fa-times-circle',
                'rejected': 'fa-times-circle',
                'reschedule_pending': 'fa-calendar-alt',
                'reschedule_requested': 'fa-calendar-alt'
            }[status] || 'fa-calendar-check';

            const sessionTypeIcon = {
                'video': 'fa-video',
                'voice': 'fa-microphone',
                'chat': 'fa-comments'
            }[appointment.session_type.toLowerCase()] || 'fa-video';

            let buttons = '';
        
            if (status === 'pending') {
                buttons = `
                    <div class="btn-container">
                        <button class="appointment-btn appointment-btn-primary approve-appointment" data-id="${appointment.id}">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="appointment-btn appointment-btn-secondary reschedule-appointment" data-id="${appointment.id}">
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
            }

            // Only show notes for pending appointments
            const showNotes = status === 'pending';
            const notesSection = showNotes && appointment.notes ? `
                <div class="detail-item notes-section">
                    <i class="fas fa-sticky-note"></i>
                    <span class="detail-label">Client Notes:</span>
                    <span class="detail-value">${appointment.notes}</span>
                </div>
            ` : '';

            // Add waiting message for therapist cancellation requests
            const cancellationMessage = status === 'cancellation_requested' ? `
                <div class="cancellation-notice">
                    <p><strong>Waiting for client's response to your cancellation request</strong></p>
                </div>
            ` : '';

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
                            <span class="detail-value">${Utils.formatDate(appointment.date)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${Utils.formatTime(appointment.time)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas ${sessionTypeIcon}"></i>
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${Utils.formatSessionType(appointment.session_type)}</span>
                        </div>
                        ${notesSection}
                    </div>
                    ${cancellationMessage}
                    ${appointment.status === 'cancellation_pending' ? `
                        <div class="cancellation-notice">
                            <p><strong>Client Requested Cancellation</strong></p>
                            <p><strong>Reason:</strong> ${appointment.cancellation_reason || 'No reason provided'}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="btn btn-danger cancellation-response" data-id="${appointment.id}" data-action="approve">
                                <i class="fas fa-check"></i> Approve Cancellation
                            </button>
                            <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                                <i class="fas fa-calendar-alt"></i> Suggest Reschedule
                            </button>
                        </div>
                    ` : ''}
                    <div class="btn-container">
                        ${buttons}
                        ${this.renderAppointmentActions(appointment)}
                    </div>
                </div>
            `;
        }).join('');

        this.hideEmptyState();
        this.attachActionListeners();
    }

    renderAppointmentActions(appointment) {
        const status = appointment.status.toLowerCase();
        let actions = '';

        switch(status) {
            case 'reschedule_pending':
                if (appointment.reschedule_by === 'therapist') {
                    actions = `
                        <div class="reschedule-notice">
                            <p>Your Reschedule Request:</p>
                            <p><strong>New Date:</strong> ${Utils.formatDate(appointment.proposed_date)}</p>
                            <p><strong>New Time:</strong> ${Utils.formatTime(appointment.proposed_time)}</p>
                            <p><strong>Proposed Session Type:</strong> ${Utils.formatSessionType(appointment.proposed_session_type || appointment.session_type)}</p>
                            <p><strong>Your Note:</strong> ${appointment.reschedule_notes || 'No note provided'}</p>
                            <p class="status-note">Waiting for client's response...</p>
                        </div>`;
                }
                break;

            case 'reschedule_requested':
                actions = `
                    <div class="reschedule-notice">
                        <p>Client has requested to reschedule to:</p>
                        <p><strong>New Date:</strong> ${Utils.formatDate(appointment.proposed_date)}</p>
                        <p><strong>New Time:</strong> ${Utils.formatTime(appointment.proposed_time)}</p>
                        <p><strong>Proposed Session Type:</strong> ${Utils.formatSessionType(appointment.proposed_session_type || appointment.session_type)}</p>
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
        }

        return actions;
    }

    attachActionListeners() {
        document.querySelectorAll('.approve-appointment').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleApprove(e)));
        document.querySelectorAll('.reschedule-appointment').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleReschedule(e)));
        document.querySelectorAll('.cancel-appointment').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleCancel(e)));
        document.querySelectorAll('.message-client').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleMessage(e)));
        document.querySelectorAll('.accept-reschedule').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleAcceptReschedule(e)));
        document.querySelectorAll('.suggest-time').forEach(btn => 
            btn.addEventListener('click', (e) => this.handleReschedule(e)));
        document.querySelectorAll('.cancellation-response').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appointmentId = e.currentTarget.dataset.id;
                const action = e.currentTarget.dataset.action;
                await this.handleCancellationResponse(appointmentId, action);
            });
        });
    }

    async handleApprove(event) {
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
                    Utils.showSuccess('Appointment approved successfully');
                    this.loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to approve appointment');
                }
            } catch (error) {
                Utils.showError('Failed to approve appointment: ' + error.message);
            }
        }
    }

    async handleReschedule(event) {
        if (event.preventDefault) event.preventDefault();
        
        const appointmentId = event.currentTarget?.dataset?.id;
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
            
            const appointment = data.appointment;
            const modal = document.getElementById('rescheduleModal');
    
            const clientName = appointment?.client_name || 'Not specified';
            const sessionType = appointment?.session_type || 'video';
            const currentDate = appointment?.date || '';
            const currentTime = appointment?.time || '';
            
            const isClientRequest = appointment?.status?.toLowerCase() === 'reschedule_requested' && 
                                  appointment?.reschedule_by === 'client';
    
            let modalContent = `
                <h4>Current Schedule</h4>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Date:</strong> ${Utils.formatDate(currentDate)}</p>
                <p><strong>Time:</strong> ${Utils.formatTime(currentTime)}</p>
                <p><strong>Session Type:</strong> ${Utils.formatSessionType(sessionType)}</p>`;
    
            if (isClientRequest && appointment.proposed_date) {
                modalContent += `
                    <div class="reschedule-notice">
                        <h4>Client's Requested Schedule</h4>
                        <p><strong>Proposed Date:</strong> ${Utils.formatDate(appointment.proposed_date)}</p>
                        <p><strong>Proposed Time:</strong> ${Utils.formatTime(appointment.proposed_time)}</p>
                        <p><strong>Proposed Session Type:</strong> ${Utils.formatSessionType(appointment.proposed_session_type || sessionType)}</p>
                        ${appointment.reschedule_notes ? `<p><strong>Client's Note:</strong> ${appointment.reschedule_notes}</p>` : ''}
                    </div>`;
            }
    
            document.getElementById('rescheduleInfo').innerHTML = modalContent;
    
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newDate').min = today;
            
            if (isClientRequest && appointment.proposed_date) {
                document.getElementById('newDate').value = appointment.proposed_date;
                document.getElementById('newTime').value = appointment.proposed_time;
                document.getElementById('sessionType').value = appointment.proposed_session_type || sessionType;
            } else {
                document.getElementById('newDate').value = currentDate;
                document.getElementById('newTime').value = currentTime;
                document.getElementById('sessionType').value = sessionType;
            }
    
            modal.style.display = 'block';
    
            this.setupRescheduleFormSubmit(appointment);
    
        } catch (error) {
            console.error('Reschedule error:', error);
            Utils.showError('Failed to load appointment details: ' + error.message);
        }
    }

    setupRescheduleFormSubmit(appointment) {
        const form = document.getElementById('rescheduleForm');
        if (!form) return;
    
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            try {
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
                    Utils.showSuccess('Reschedule request sent successfully');
                    document.getElementById('rescheduleModal').style.display = 'none';
                    this.loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to reschedule appointment');
                }
            } catch (error) {
                Utils.showError('Failed to reschedule appointment: ' + error.message);
            }
        };
    }

    async handleCancel(event) {
        const appointmentId = event.target.closest('.cancel-appointment').dataset.id;
        this.showCancellationModal(appointmentId);
    }

    async handleAvailabilityModal() {
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
    
            this.populateAvailabilityForm(data.availability);
        } catch (error) {
            console.error('Error loading availability:', error);
            Utils.showError('Failed to load availability settings: ' + error.message);
        }
    }
    
    async handleAvailabilitySubmit(event) {
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
    
            Utils.showSuccess('Availability updated successfully');
            document.getElementById('availabilityModal').style.display = 'none';
            
        } catch (error) {
            console.error('Error updating availability:', error);
            Utils.showError(error.message);
        }
    }

    handleMessage(event) {
        const appointmentId = event.currentTarget.dataset.id;
        const clientName = event.currentTarget.dataset.client;
        const clientId = event.currentTarget.dataset.clientId;
        
        document.getElementById('messageClientInfo').innerHTML = `
            <p>Appointment ID: ${appointmentId}</p>
            <p>Client ID: ${clientId}</p>
            <h4>To: ${clientName}</h4>
        `;
        
        const messageModal = document.getElementById('messageModal');
        messageModal.style.display = 'block';
        
        document.getElementById('messageText').value = '';

        document.getElementById('messageForm').onsubmit = async (e) => {
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
                    Utils.showSuccess('Message sent successfully');
                    messageModal.style.display = 'none';
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                Utils.showError(error.message);
            }
        };
    }

    async handleAcceptReschedule(event) {
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
                    Utils.showSuccess('Reschedule request accepted successfully');
                    this.loadAppointments();
                } else {
                    throw new Error(data.error || 'Failed to accept reschedule request');
                }
            } catch (error) {
                Utils.showError('Failed to accept reschedule request: ' + error.message);
            }
        }
    }

    async handleCancellationResponse(appointmentId, action) {
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
                this.loadAppointments();
                Utils.showSuccess(data.message || 'Cancellation processed successfully');
            } else {
                throw new Error(data.error || 'Failed to process cancellation');
            }
        } catch (error) {
            Utils.showError(error.message);
        }
    }

    showCancellationModal(appointmentId) {
        const modal = document.getElementById('cancelModal');
        if (!modal) return;
    
        const appointmentCard = document.querySelector(`.appointment-card[data-id="${appointmentId}"]`);
        if (!appointmentCard) return;
    
        modal.dataset.appointmentId = appointmentId;
    
        const clientName = appointmentCard.querySelector('h3').textContent.replace('Session with ', '');
        const date = appointmentCard.querySelector('.detail-value').textContent;
        const time = appointmentCard.querySelectorAll('.detail-value')[1].textContent;
        
        const appointmentInfo = modal.querySelector('.cancel-appointment-info');
        if (appointmentInfo) {
            appointmentInfo.innerHTML = `
                <p><strong>${clientName}</strong></p>
                <p><i class="fas fa-calendar"></i> ${date}</p>
                <p><i class="fas fa-clock"></i> ${time}</p>
            `;
        }
    
        modal.style.display = 'flex';
        
        const closeBtn = modal.querySelector('.modal-close');
        const keepBtn = document.getElementById('therapistKeepAppointment');
        const confirmBtn = document.getElementById('therapistConfirmCancel');
        
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        keepBtn.replaceWith(keepBtn.cloneNode(true));
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        
        const newCloseBtn = modal.querySelector('.modal-close');
        const newKeepBtn = document.getElementById('therapistKeepAppointment');
        const newConfirmBtn = document.getElementById('therapistConfirmCancel');
        
        const closeModal = () => {
            modal.style.display = 'none';
            const reasonInput = document.getElementById('therapistCancelReason');
            if (reasonInput) reasonInput.value = '';
        };
    
        newCloseBtn.onclick = closeModal;
        newKeepBtn.onclick = closeModal;
        newConfirmBtn.onclick = async () => {
            const reason = document.getElementById('therapistCancelReason').value.trim();
            if (!reason) {
                Utils.showError('Please provide a reason for cancellation');
                return;
            }
            const appointmentIdToCancel = modal.dataset.appointmentId;
            if (!appointmentIdToCancel) {
                Utils.showError('Invalid appointment ID');
                return;
            }
            await this.cancelAppointment(appointmentIdToCancel, reason);
            closeModal();
        };
    
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
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
                    reason: reason || '',
                    role: 'therapist'
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

    setupModalHandlers() {
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
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
    }

    populateAvailabilityForm(availability) {
        try {
            document.querySelectorAll('input[name="availableDays"]').forEach(checkbox => {
                checkbox.checked = false;
            });

            if (Array.isArray(availability.days)) {
                availability.days.forEach(day => {
                    const checkbox = document.querySelector(`input[name="availableDays"][value="${day}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }

            const hours = availability.hours || {};
            
            const startTimeInput = document.querySelector('input[name="startTime"]');
            if (startTimeInput && hours.start) {
                startTimeInput.value = hours.start;
            }

            const endTimeInput = document.querySelector('input[name="endTime"]');
            if (endTimeInput && hours.end) {
                endTimeInput.value = hours.end;
            }

            const breakTimes = hours.break || {};
            
            const breakStartInput = document.querySelector('input[name="breakStart"]');
            if (breakStartInput && breakTimes.start) {
                breakStartInput.value = breakTimes.start;
            }

            const breakEndInput = document.querySelector('input[name="breakEnd"]');
            if (breakEndInput && breakTimes.end) {
                breakEndInput.value = breakTimes.end;
            }

        } catch (error) {
            console.error('Error populating availability form:', error);
            Utils.showError('Failed to populate availability form');
        }
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




