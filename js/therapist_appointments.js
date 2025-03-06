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

    async function loadAppointments() {
        try {
            const response = await fetch('../php/appointments/fetch_therapist_appointments.php');
            const appointments = await response.json();
            
            if (appointments.length === 0) {
                showEmptyState();
            } else {
                renderAppointments(appointments);
                updateSummaryCount(appointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            showError('Failed to load appointments');
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
        if (appointment.status === 'UPCOMING') {
            return `
                <div class="appointment-actions">
                    <button class="btn btn-primary join-session" data-id="${appointment.id}">
                        <i class="fas fa-video"></i> Join Session
                    </button>
                </div>
            `;
        }
        return '';
    }

    function attachActionListeners() {
        document.querySelectorAll('.join-session').forEach(button => {
            button.addEventListener('click', handleJoinSession);
        });
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
