document.addEventListener('DOMContentLoaded', function() {
    let selectedTherapist = null;
    let selectedDate = null;
    let selectedTime = null;

    // Initialize the page
    initializePage();

    async function initializePage() {
        await fetchTherapists();
        initializeCalendar();
        attachEventListeners();
    }

    async function fetchTherapists() {
        try {
            const response = await fetch('../php/CRUDTherapist/fetch_therapist.php');
            const therapists = await response.json();
            
            if (Array.isArray(therapists)) {
                // Populate specialization filter
                const specializations = [...new Set(therapists.map(t => t.specialization))];
                populateSpecializationFilter(specializations);
                
                // Render therapist list
                renderTherapistList(therapists);
            }
        } catch (error) {
            console.error('Error fetching therapists:', error);
            showError('Failed to load therapists. Please try again later.');
        }
    }

    function renderTherapistList(therapists) {
        const list = document.getElementById('therapistList');
        list.innerHTML = therapists.map(therapist => `
            <div class="therapist-card" data-id="${therapist.therapist_id}">
                <h3>${therapist.firstName} ${therapist.lastName}</h3>
                <p class="specialization">${therapist.specialization}</p>
                <p class="experience">${therapist.experience} years experience</p>
                <div class="availability">
                    <strong>Available:</strong> ${formatAvailability(therapist.availability)}
                </div>
            </div>
        `).join('');
    }

    function formatAvailability(availability) {
        if (!availability || !availability.days || !availability.hours) return 'Schedule not available';
        
        const days = availability.days.map(day => day.substr(0, 3)).join(', ');
        const hours = `${formatTime(availability.hours.start)} - ${formatTime(availability.hours.end)}`;
        return `${days} ${hours}`;
    }

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    function initializeCalendar() {
        const calendar = document.getElementById('appointmentCalendar');
        const today = new Date();
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
        
        // Add calendar navigation
        const calendarNav = document.createElement('div');
        calendarNav.className = 'calendar-nav';
        calendarNav.innerHTML = `
            <button class="prev-month">&lt;</button>
            <span class="current-month-year"></span>
            <button class="next-month">&gt;</button>
        `;
        calendar.parentElement.insertBefore(calendarNav, calendar);

        // Add weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayHeader = document.createElement('div');
        weekdayHeader.className = 'weekday-header';
        weekdayHeader.innerHTML = weekdays.map(day => 
            `<div class="weekday">${day}</div>`
        ).join('');
        calendar.parentElement.insertBefore(weekdayHeader, calendar);

        // Event listeners for navigation
        calendarNav.querySelector('.prev-month').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        calendarNav.querySelector('.next-month').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });

        function renderCalendar(month, year) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            // Update month/year display
            calendarNav.querySelector('.current-month-year').textContent = 
                `${monthNames[month]} ${year}`;
            
            // Generate calendar days
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
            
            let calendarHTML = '';
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                calendarHTML += '<div class="calendar-day disabled"></div>';
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateString = date.toISOString().split('T')[0];
                const isDisabled = date < today;
                const isSelected = dateString === selectedDate;
                
                calendarHTML += `
                    <div class="calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
                         data-date="${dateString}">
                        ${day}
                    </div>
                `;
            }
            
            calendar.innerHTML = calendarHTML;

            // Reattach click handlers
            calendar.querySelectorAll('.calendar-day:not(.disabled)').forEach(day => {
                day.addEventListener('click', handleDateSelection);
            });
        }

        // Initial render
        renderCalendar(currentMonth, currentYear);
    }

    function attachEventListeners() {
        // Therapist search
        document.getElementById('therapistSearch').addEventListener('input', filterTherapists);
        
        // Specialization filter
        document.getElementById('specializationFilter').addEventListener('change', filterTherapists);
        
        // Therapist selection
        document.getElementById('therapistList').addEventListener('click', handleTherapistSelection);
        
        // Calendar day selection
        document.getElementById('appointmentCalendar').addEventListener('click', handleDateSelection);
        
        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmission);
        
        // Cancel booking
        document.getElementById('cancelBooking').addEventListener('click', resetBooking);

        // Add time input handler
        document.getElementById('appointmentTime').addEventListener('change', handleTimeSelection);
    }

    async function handleTherapistSelection(event) {
        const therapistCard = event.target.closest('.therapist-card');
        if (!therapistCard) return;

        // Update selection
        document.querySelectorAll('.therapist-card').forEach(card => 
            card.classList.remove('selected'));
        therapistCard.classList.add('selected');

        const therapistId = therapistCard.dataset.id;
        selectedTherapist = await fetchTherapistDetails(therapistId);
        
        updateSelectedTherapistInfo();
    }

    function handleDateSelection(event) {
        const dayElement = event.target.closest('.calendar-day');
        if (!dayElement || dayElement.classList.contains('disabled')) return;

        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => 
            day.classList.remove('selected'));
        
        // Add selected class to clicked day
        dayElement.classList.add('selected');
        
        selectedDate = dayElement.dataset.date;
        selectedTime = null; // Reset time selection when date changes
        
        renderTimeSlots(); // This line is crucial - it renders the time slots
        updateBookingSummary();
    }

    async function fetchTherapistDetails(therapistId) {
        try {
            const response = await fetch(`../php/CRUDTherapist/fetch_therapist_details.php?id=${therapistId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching therapist details:', error);
            showError('Failed to load therapist details');
            return null;
        }
    }

    function renderTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!selectedTherapist || !selectedDate) {
            timeSlotsContainer.querySelector('#appointmentTime').disabled = true;
            return;
        }
        
        const timeInput = timeSlotsContainer.querySelector('#appointmentTime');
        timeInput.disabled = false;
        
        if (selectedTime) {
            timeInput.value = selectedTime;
        }
    }

    function handleTimeSelection(event) {
        selectedTime = event.target.value;
        updateBookingSummary();
    }

    function formatTimeSlot(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    async function handleBookingSubmission(event) {
        event.preventDefault();

        if (!selectedTherapist || !selectedDate) {
            showError('Please select a therapist and date.');
            return;
        }

        const formData = {
            therapistId: selectedTherapist.therapist_id,
            date: selectedDate,
            sessionType: document.getElementById('sessionType').value,
            notes: document.getElementById('notes').value
        };

        try {
            const response = await fetch('../php/appointments/create_appointment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                showConfirmation(formData);
            } else {
                showError(result.error || 'Failed to book appointment');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            showError('Failed to book appointment. Please try again later.');
        }
    }

    function showConfirmation(booking) {
        const modal = document.getElementById('confirmationModal');
        const details = document.getElementById('appointmentDetails');
        
        details.innerHTML = `
            <div class="confirmation-details">
                <p><strong>Therapist:</strong> ${selectedTherapist.firstName} ${selectedTherapist.lastName}</p>
                <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
                <p><strong>Session Type:</strong> ${booking.sessionType}</p>
            </div>
        `;
        
        modal.classList.add('active');
    }

    function closeModal() {
        document.getElementById('confirmationModal').classList.remove('active');
        resetBooking();
    }

    function resetBooking() {
        selectedTherapist = null;
        selectedDate = null;
        selectedTime = null;
        
        document.querySelectorAll('.selected').forEach(el => 
            el.classList.remove('selected'));
        document.getElementById('bookingForm').reset();
        
        updateBookingSummary();
    }

    // Helper functions
    function showError(message) {
        // Implement error notification
        alert(message); // Replace with better UI feedback
    }

    function updateBookingSummary() {
        const summary = document.getElementById('bookingSummary');
        if (!selectedTherapist || !selectedDate) {
            summary.innerHTML = '<p>Please select a therapist and date to complete your booking.</p>';
            return;
        }

        summary.innerHTML = `
            <div class="summary-item">
                <strong>Therapist:</strong> ${selectedTherapist.firstName} ${selectedTherapist.lastName}
            </div>
            <div class="summary-item">
                <strong>Date:</strong> ${formatDate(selectedDate)}
            </div>
            ${selectedTime ? `
            <div class="summary-item">
                <strong>Time:</strong> ${formatTimeSlot(selectedTime)}
            </div>
            ` : ''}
        `;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});
