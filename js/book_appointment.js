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
        if (!therapists || therapists.length === 0) {
            list.innerHTML = `
                <div class="no-therapists-message">
                    <i class="fas fa-user-md"></i>
                    <p>No therapists available for the selected time slot.</p>
                    <p>Please try a different date or time.</p>
                </div>`;
            return;
        }

        list.innerHTML = therapists.map(therapist => `
            <div class="therapist-card" data-id="${therapist.therapist_id}">
                <h3>${therapist.firstName || ''} ${therapist.lastName || ''}</h3>
                <p class="specialization">${therapist.specialization || 'General Practice'}</p>
                <p class="experience">${therapist.experience > 0 ? `${therapist.experience} years experience` : 'New Therapist'}</p>
                <div class="availability">
                    <strong>Available:</strong> ${formatAvailability(therapist.availability)}
                    ${therapist.bio ? `<p class="bio">${therapist.bio}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    function formatAvailability(availability) {
        if (!availability || !Array.isArray(availability.days) || availability.days.length === 0) {
            return 'Schedule to be announced';
        }
        
        const uniqueDays = [...new Set(availability.days)];
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const sortedDays = uniqueDays.sort((a, b) => {
            return dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase());
        });
        
        const days = sortedDays.map(day => 
            day.charAt(0).toUpperCase() + day.slice(1).toLowerCase().substr(0, 2)
        ).join(', ');
        
        const startTime = availability.hours?.start ? formatTime(availability.hours.start) : '';
        let endTime = availability.hours?.end ? formatTime(availability.hours.end) : '';
        
        let availabilityText = `${days} (${startTime} - ${endTime})`;
        
        // Only show break time if it's not 00:00:00
        if (availability.hours?.break?.start && 
            availability.hours?.break?.end && 
            availability.hours.break.start !== '00:00:00' && 
            availability.hours.break.end !== '00:00:00') {
            const breakStart = formatTime(availability.hours.break.start);
            const breakEnd = formatTime(availability.hours.break.end);
            availabilityText += `<br><span class="break-time">Break: ${breakStart} - ${breakEnd}</span>`;
        }
        
        return availabilityText;
    }

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        
        // Convert 24-hour format to 12-hour format
        if (hour === 5 && minutes === '00') {
            hour = 17; // Convert 05:00 to 17:00 for display
        }
        
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
        
        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmission);
        
        // Cancel booking
        document.getElementById('cancelBooking').addEventListener('click', resetBooking);

        // Update time input handler to work with radio buttons
        document.querySelectorAll('input[name="appointmentTime"]').forEach(radio => {
            radio.addEventListener('change', handleTimeSelection);
        });
    }

    async function handleTherapistSelection(event) {
        const therapistCard = event.target.closest('.therapist-card');
        if (!therapistCard) return;

        try {
            // Update selection
            document.querySelectorAll('.therapist-card').forEach(card => 
                card.classList.remove('selected'));
            therapistCard.classList.add('selected');

            const therapistId = therapistCard.dataset.id;
            const response = await fetchTherapistDetails(therapistId);
            
            if (response && response.success) {
                selectedTherapist = response.data;
                updateSelectedTherapistInfo();

                // After selecting therapist, fetch available slots for selected date
                if (selectedDate) {
                    await loadAvailableSlots();
                }
            } else {
                throw new Error('Failed to fetch therapist details');
            }
        } catch (error) {
            console.error('Error in therapist selection:', error);
            showError('Failed to select therapist');
            therapistCard.classList.remove('selected');
        }
    }

   
    function handleDateSelection(event) {
        const dayElement = event.target.closest('.calendar-day');
        if (!dayElement || dayElement.classList.contains('disabled')) return;
    
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => 
            day.classList.remove('selected'));
        
        // Add selected class to clicked day
        dayElement.classList.add('selected');
        
        // Get the day, month, and year from the parent calendar's context
        const day = parseInt(dayElement.textContent);
        const calendarNav = dayElement.closest('.date-picker').querySelector('.current-month-year');
        const [monthName, year] = calendarNav.textContent.split(' ');
        
        // Create a month mapping
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames.indexOf(monthName) + 1; // Convert to 1-indexed month
        
        // Create the date string in YYYY-MM-DD format
        selectedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        selectedTime = null; // Reset time selection when date changes
        
        // Reset time selection
        document.querySelectorAll('input[name="appointmentTime"]').forEach(radio => {
            radio.checked = false;
        });

        // Reset therapist selection
        selectedTherapist = null;
        document.querySelectorAll('.therapist-card').forEach(card => 
            card.classList.remove('selected'));
        
        updateBookingSummary();
    }
    

    async function fetchTherapistDetails(therapistId) {
        try {
            const response = await fetch(`../php/CRUDTherapist/fetch_therapist_details.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ therapist_id: therapistId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching therapist details:', error);
            showError('Failed to load therapist details');
            return null;
        }
    }

    async function loadAvailableSlots() {
        if (!selectedTherapist || !selectedDate) return;

        try {
            const response = await fetch(`../php/appointments/fetch_available_slots.php?therapist_id=${selectedTherapist.therapist_id}&date=${selectedDate}`);
            const data = await response.json();
            
            if (data.success) {
                renderTimeSlots(data.slots);
            } else {
                showError(data.error || 'Failed to load available time slots');
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            showError('Failed to load available time slots');
        }
    }

    function renderTimeSlots(slots) {
        const timeSlots = document.querySelectorAll('input[name="appointmentTime"]');
        
        // Disable all slots first
        timeSlots.forEach(slot => {
            slot.disabled = true;
            slot.checked = false;
        });
        
        if (!slots || slots.length === 0) {
            showError('No available time slots for this date');
            return;
        }
        
        // Enable available slots
        slots.forEach(availableTime => {
            const timeSlot = document.querySelector(`input[value="${availableTime}"]`);
            if (timeSlot) {
                timeSlot.disabled = false;
            }
        });
    }

    function handleTimeSelection(event) {
        selectedTime = event.target.value;
        if (selectedTime && selectedDate) {
            filterTherapists();
        }
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
            showError('Please select a therapist and date');
            return;
        }

        const selectedTimeRadio = document.querySelector('input[name="appointmentTime"]:checked');
        if (!selectedTimeRadio) {
            showError('Please select an appointment time');
            return;
        }

        const formData = {
            therapist_id: selectedTherapist.therapist_id,
            appointment_date: selectedDate,
            appointment_time: selectedTimeRadio.value,
            session_type: document.getElementById('sessionType').value,
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

            const data = await response.json();
            
            if (data.success) {
                showConfirmation({
                    ...formData,
                    therapist: selectedTherapist
                });
            } else {
                showError(data.error || 'Failed to book appointment');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            showError('Failed to book appointment');
        }
    }

    // Update modal related functions to use new class names
    function showConfirmation(booking) {
        const modal = document.getElementById('confirmationModal');
        const details = document.getElementById('appointmentDetails');
        
        details.innerHTML = `
            <div class="booking-details-item">
                <p><strong>Date:</strong> ${formatDate(booking.appointment_date)}</p>
                <p><strong>Time:</strong> ${formatTimeSlot(booking.appointment_time)}</p>
                <p><strong>Therapist:</strong> ${booking.therapist.firstName} ${booking.therapist.lastName}</p>
                <p><strong>Session Type:</strong> ${capitalizeFirst(booking.session_type)}</p>
            </div>
        `;
        
        modal.style.display = 'flex'; // Change to flex to make modal visible
        modal.classList.add('booking-modal-active'); // Add new active class
    }

    // Replace the old closeModal function
    function closeBookingModal() {
        const modal = document.getElementById('confirmationModal');
        modal.classList.remove('booking-modal-active');
        modal.style.display = 'none';
        
        setTimeout(() => {
            window.location.href = 'client_appointments.php';
        }, 300);
    }

    // Update the window.closeModal function
    window.closeModal = closeBookingModal;

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function closeModalWithRedirect() {
        const modal = document.getElementById('confirmationModal');
        modal.classList.add('fade-out');
        
        setTimeout(() => {
            modal.classList.remove('active', 'fade-in', 'fade-out');
            // Redirect to appointments page
            window.location.href = 'client_appointments.php';
        }, 300); // Match this with your CSS transition duration
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
        // Create date object from the date string and preserve the exact date
        const date = new Date(dateString);
        // Add timezone offset to keep the exact date
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function populateSpecializationFilter(specializations) {
        const filter = document.getElementById('specializationFilter');
        filter.innerHTML = `
            <option value="">All Specializations</option>
            ${specializations.map(spec => `<option value="${spec}">${spec}</option>`).join('')}
        `;
    }

    async function filterTherapists() {
        const searchTerm = document.getElementById('therapistSearch').value.toLowerCase();
        const specialization = document.getElementById('specializationFilter').value.toLowerCase();
        const selectedTimeRadio = document.querySelector('input[name="appointmentTime"]:checked');
        const selectedTime = selectedTimeRadio ? selectedTimeRadio.value : null;
        
        if (!selectedDate || !selectedTime) {
            renderTherapistList([]);
            return;
        }

        try {
            const response = await fetch('../php/appointments/fetch_available_therapists.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: selectedDate,
                    time: selectedTime,
                    specialization: specialization || '',
                    searchTerm: searchTerm || ''
                })
            });

            const result = await response.json();
            
            if (result.success) {
                renderTherapistList(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch available therapists');
            }
        } catch (error) {
            console.error('Error filtering therapists:', error);
            showError('Failed to load available therapists');
        }
    }

    async function handleCheckAvailability() {
        const date = selectedDate;
        const time = document.getElementById('appointmentTime').value;
        const searchTerm = document.getElementById('therapistSearch').value.trim();
        const specialization = document.getElementById('specializationFilter').value;

        if (!date || !time) {
            showError('Please select both date and time');
            return;
        }

        // Format the exact selected date correctly
        const selectedDateTime = document.getElementById('selectedDateTime');
        const formattedTime = formatTimeSlot(time);
        selectedDateTime.textContent = `${formatDate(selectedDate)} at ${formattedTime}`;
        document.getElementById('availabilityMessage').style.display = 'block';

        // Reset therapist selection
        selectedTherapist = null;
        document.querySelectorAll('.therapist-card').forEach(card => 
            card.classList.remove('selected'));

        // Fetch and display available therapists with filters
        try {
            const response = await fetch('../php/appointments/fetch_available_therapists.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    time: time,
                    searchTerm: searchTerm,
                    specialization: specialization
                })
            });

            const result = await response.json();
            
            if (result.success) {
                renderTherapistList(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch available therapists');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to load available therapists');
        }
    }

    // Add the missing updateSelectedTherapistInfo function
    function updateSelectedTherapistInfo() {
        if (!selectedTherapist || !selectedTherapist.therapist_id) {
            console.warn('No therapist selected or invalid therapist data');
            return;
        }

        try {
            // Update booking summary
            updateBookingSummary();

            // Highlight selected therapist card
            const therapistId = selectedTherapist.therapist_id.toString();
            document.querySelectorAll('.therapist-card').forEach(card => {
                if (card.dataset.id === therapistId) {
                    card.classList.add('selected');
                }
            });
        } catch (error) {
            console.error('Error updating therapist info:', error);
            showError('Failed to update therapist information');
        }
    }
});

// Move closeModal outside the main event listener to make it globally accessible
window.closeModal = function() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('active');
    setTimeout(() => {
        window.location.href = 'client_appointments.php';
    }, 300);
};
