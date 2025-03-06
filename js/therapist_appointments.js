document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadAppointments();

    // Add event listeners
    document.getElementById('statusFilter').addEventListener('change', filterAppointments);
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
        const statusValue = document.getElementById('statusFilter').value;
        const dateValue = document.getElementById('dateFilter').value;
        const searchValue = document.getElementById('searchClient').value.toLowerCase();

        const list = document.getElementById('appointmentsList');
        const cards = list.getElementsByClassName('appointment-card');

        let visibleCount = 0;

        Array.from(cards).forEach(card => {
            const status = card.querySelector('.appointment-status').textContent.trim();
            const date = card.querySelector('.detail-value').textContent;
            const clientName = card.querySelector('h3').textContent.toLowerCase();

            const statusMatch = !statusValue || status === statusValue;
            const dateMatch = !dateValue || date.includes(dateValue);
            const searchMatch = !searchValue || clientName.includes(searchValue);

            if (statusMatch && dateMatch && searchMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
        }
    }

    async function loadAppointments() {
        try {
            const response = await fetch('../php/appointments/fetch_therapist_appointments.php');
            const text = await response.text();

            let appointments;
            try {
                appointments = JSON.parse(text);
            } catch (parseError) {
                console.error('Invalid JSON response:', text);
                throw new Error('Server returned invalid data');
            }
            
            if (!Array.isArray(appointments)) {
                throw new Error('Expected array of appointments');
            }
            
            if (appointments.length === 0) {
                showEmptyState();
            } else {
                renderAppointments(appointments);
                updateSummaryCount(appointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Failed to load appointments: ' + error.message);
            showEmptyState();
        }
    }

    function updateSummaryCount(appointments) {
        const today = new Date().toISOString().split('T')[0];
        
        const todayCount = appointments.filter(app => app.date === today).length;
        const upcomingCount = appointments.filter(app => 
            app.status === 'UPCOMING' && app.date >= today).length;
        const completedCount = appointments.filter(app => 
            app.status === 'COMPLETED').length;

        document.getElementById('todayCount').textContent = todayCount;
        document.getElementById('upcomingCount').textContent = upcomingCount;
        document.getElementById('completedCount').textContent = completedCount;
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
        if (appointments.length === 0) {
            showEmptyState();
            return;
        }
        
        hideEmptyState();
        list.innerHTML = appointments.map(appointment => `
            <div class="appointment-card" data-id="${appointment.id}">
                <div class="appointment-header">
                    <h3>Session with ${appointment.client_name}</h3>
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

        attachActionListeners();
    }

    function renderAppointmentActions(appointment) {
        const actions = [];
        
        if (appointment.status === 'UPCOMING' || appointment.status === 'PENDING') {
            actions.push(`
                <button class="btn btn-primary accept-appointment" data-id="${appointment.id}">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="btn btn-secondary reschedule-appointment" data-id="${appointment.id}">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button class="btn btn-danger cancel-appointment" data-id="${appointment.id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `);
        }

        // Add message client button last (no duplicate needed)
        actions.push(`
            <button class="btn btn-info message-client" data-id="${appointment.id}">
                <i class="fas fa-comment"></i> Message Client
            </button>
        `);

        return `<div class="appointment-actions">${actions.join('')}</div>`;
    }

    function attachActionListeners() {
        document.querySelectorAll('.accept-appointment').forEach(button => {
            button.addEventListener('click', handleAcceptAppointment);
        });
        document.querySelectorAll('.reschedule-appointment').forEach(button => {
            button.addEventListener('click', handleRescheduleAppointment);
        });
        document.querySelectorAll('.cancel-appointment').forEach(button => {
            button.addEventListener('click', handleCancelAppointment);
        });
        document.querySelectorAll('.message-client').forEach(button => {
            button.addEventListener('click', handleMessageClient);
        });
    }

    async function handleAcceptAppointment(event) {
        const appointmentId = event.currentTarget.dataset.id;
        if (confirm('Are you sure you want to accept this appointment?')) {
            try {
                const response = await fetch('../php/appointments/accept_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appointmentId })
                });
                
                const data = await response.json();
                if (data.success) {
                    showSuccess('Appointment accepted successfully');
                    loadAppointments(); // Refresh the appointments list
                } else {
                    throw new Error(data.error || 'Failed to accept appointment');
                }
            } catch (error) {
                showError('Failed to accept appointment: ' + error.message);
            }
        }
    }

    async function handleRescheduleAppointment(event) {
        const appointmentId = event.currentTarget.dataset.id;
        // Show reschedule modal or date picker
        const newDate = prompt('Enter new date (YYYY-MM-DD):');
        const newTime = prompt('Enter new time (HH:MM):');
        
        if (newDate && newTime) {
            try {
                const response = await fetch('../php/appointments/reschedule_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appointmentId,
                        newDate,
                        newTime
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

    async function handleCancelAppointment(event) {
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

    // Close modal when clicking outside or on close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal.id === 'availabilityModal') {
                toggleAvailabilityModal(false);
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            const modal = e.target;
            if (modal.id === 'availabilityModal') {
                toggleAvailabilityModal(false);
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Mock data - replace with actual API calls
    const appointments = [
        {
            id: 1,
            clientName: "John Doe",
            date: "2024-01-20",
            time: "10:00",
            status: "upcoming",
            type: "Initial Consultation"
        },
        // Add more mock appointments as needed
    ];

    const appointmentsList = document.getElementById('appointmentsList');
    const noAppointments = document.getElementById('noAppointments');
    
    function displayAppointments(appointments) {
        appointmentsList.innerHTML = '';
        
        if (appointments.length === 0) {
            appointmentsList.style.display = 'none';
            noAppointments.style.display = 'flex';
            return;
        }

        noAppointments.style.display = 'none';
        appointmentsList.style.display = 'block';

        appointments.forEach(appointment => {
            const appointmentCard = document.createElement('div');
            appointmentCard.className = 'appointment-card';
            appointmentCard.innerHTML = `
                <div class="appointment-info">
                    <h3>${appointment.clientName}</h3>
                    <p><i class="far fa-calendar"></i> ${appointment.date}</p>
                    <p><i class="far fa-clock"></i> ${appointment.time}</p>
                    <p><i class="far fa-file-alt"></i> ${appointment.type}</p>
                    <span class="status-badge ${appointment.status}">${appointment.status}</span>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-primary">Start Session</button>
                    <button class="btn btn-secondary">Reschedule</button>
                    <button class="btn btn-danger">Cancel</button>
                </div>
            `;
            appointmentsList.appendChild(appointmentCard);
        });

        updateCounters(appointments);
    }

    function updateCounters(appointments) {
        const today = new Date().toISOString().split('T')[0];
        
        document.getElementById('todayCount').textContent = 
            appointments.filter(app => app.date === today).length;
        
        document.getElementById('upcomingCount').textContent = 
            appointments.filter(app => app.status === 'upcoming').length;
        
        document.getElementById('completedCount').textContent = 
            appointments.filter(app => app.status === 'completed').length;
    }

    // Filter functionality
    const searchClient = document.getElementById('searchClient');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearFilters = document.getElementById('clearFilters');

    function applyFilters() {
        let filtered = [...appointments];

        if (searchClient.value) {
            filtered = filtered.filter(app => 
                app.clientName.toLowerCase().includes(searchClient.value.toLowerCase())
            );
        }

        if (statusFilter.value) {
            filtered = filtered.filter(app => app.status === statusFilter.value);
        }

        if (dateFilter.value) {
            filtered = filtered.filter(app => app.date === dateFilter.value);
        }

        displayAppointments(filtered);
    }

    searchClient.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
    clearFilters.addEventListener('click', () => {
        searchClient.value = '';
        statusFilter.value = '';
        dateFilter.value = '';
        displayAppointments(appointments);
    });

    // Initial display
    displayAppointments(appointments);
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
