document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    let selectedDate = null;
    let selectedTime = null;
    let selectedTherapist = null;
    let booking = {
        date: null,
        time: null,
        therapist: null,
        sessionType: null,
        concern: null,
        notes: null
    };

    // Get DOM elements
    const steps = document.querySelectorAll('.step');
    const bookingSteps = document.querySelectorAll('.booking-step');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const therapistSearch = document.getElementById('therapistSearch');
    const specializationFilter = document.getElementById('specializationFilter');
    const summaryTherapist = document.getElementById('selectedTherapist');
    const summaryDateTime = document.getElementById('selectedDateTime');
    const summarySession = document.getElementById('selectedSession');

    // Initialize the page
    async function init() {
        setupEventListeners();
        updateStepButtons();
        initializeCalendar();
        
        // Ensure first step is visible on load
        bookingSteps[0].classList.add('show');
        document.getElementById('bookingSummary').style.display = 'none';
        
        // Generate initial time slots
        renderTimeSlots();
    }

    // Modified validateStep function
    function validateStep() {
        switch(currentStep) {
            case 1:
                // Check if both date and time are selected
                if (!booking.date || !booking.time) {
                    alert('Please select both date and time');
                    return false;
                }
                loadAvailableTherapists();
                return true;
            case 2:
                if (!selectedTherapist) {
                    alert('Please select a therapist');
                    return false;
                }
                return true;
            case 3:
                // Validate session details
                const sessionType = document.getElementById('sessionType').value;
                const concernType = document.getElementById('concernType').value;
                if (!sessionType || !concernType) {
                    alert('Please fill in all required fields');
                    return false;
                }
                return true;
        }
        return true;
    }

    // Load available therapists based on selected date and time
    async function loadAvailableTherapists() {
        try {
            const response = await fetch('../php/CRUDTherapist/fetch_available_therapists.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: selectedDate,
                    time: selectedTime
                })
            });
            const therapists = await response.json();
            if (Array.isArray(therapists)) {
                renderTherapists(therapists);
                populateSpecializations(therapists);
            }
        } catch (error) {
            console.error('Error loading therapists:', error);
            showError('Failed to load available therapists');
        }
    }

    // Render therapist cards
    function renderTherapists(therapists) {
        const therapistList = document.getElementById('therapistList');
        therapistList.innerHTML = therapists.map(therapist => `
            <div class="therapist-card" data-id="${therapist.therapist_id}">
                <div class="therapist-info">
                    <h3>${therapist.firstName} ${therapist.lastName}</h3>
                    <p class="specialization">${therapist.specialization}</p>
                    <p class="experience">${therapist.experience} years of experience</p>
                    <div class="availability">
                        <h4>Available:</h4>
                        <div class="days">
                            ${formatAvailability(therapist.availability)}
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary select-therapist">Select</button>
            </div>
        `).join('');

        // Add click handlers for therapist selection
        document.querySelectorAll('.select-therapist').forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.therapist-card');
                selectTherapist(card.dataset.id);
            });
        });
    }

    // Format availability display
    function formatAvailability(availability) {
        if (!availability || !availability.days) return 'Schedule unavailable';
        
        const dayAbbrev = {
            monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
            thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
        };

        const days = availability.days.map(day => dayAbbrev[day] || day);
        const hours = availability.hours || {};
        
        return `
            <span class="days">${days.join(', ')}</span>
            ${hours.start ? `<span class="hours">${formatTime(hours.start)} - ${formatTime(hours.end)}</span>` : ''}
        `;
    }

    // Handle therapist selection
    function selectTherapist(therapistId) {
        selectedTherapist = therapistId;
        booking.therapist = therapistId;
        updateSummary();
        goToStep(2);
    }

    // Initialize calendar
    function initializeCalendar() {
        // Store currentDisplayDate in a closure to maintain state
        const state = {
            currentDisplayDate: new Date()
        };

        function updateCalendar() {
            renderCalendar(state.currentDisplayDate);
        }

        // Add month navigation handlers
        document.getElementById('prevMonth').addEventListener('click', () => {
            state.currentDisplayDate = new Date(
                state.currentDisplayDate.getFullYear(),
                state.currentDisplayDate.getMonth() - 1,
                1
            );
            updateCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            state.currentDisplayDate = new Date(
                state.currentDisplayDate.getFullYear(),
                state.currentDisplayDate.getMonth() + 1,
                1
            );
            updateCalendar();
        });

        // Initial render
        updateCalendar();
    }

    // Modified renderCalendar function
    function renderCalendar(date) {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        const monthYearText = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
            monthDisplay.textContent = monthYearText;
        }

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        let calendarHTML = `
            <div class="calendar-header-days">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div class="calendar-body">
        `;

        let currentWeek = '<div class="calendar-week">';
        
        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            currentWeek += '<div class="calendar-day empty"></div>';
        }

        // Add the days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            if ((firstDay.getDay() + day - 1) % 7 === 0 && day !== 1) {
                calendarHTML += currentWeek + '</div>';
                currentWeek = '<div class="calendar-week">';
            }
            
            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            const dateStr = currentDate.toISOString().split('T')[0];
            const isToday = isSameDate(currentDate, today);
            const isPast = currentDate < today;
            
            currentWeek += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${!isPast ? 'available' : ''}"
                     data-date="${dateStr}"
                     ${!isPast ? 'onclick="window.selectDate(this)"' : ''}
                     ${isPast ? 'disabled' : ''}>
                    ${day}
                </div>`;
        }

        // Add empty cells for remaining days
        while ((firstDay.getDay() + lastDay.getDate()) % 7 !== 0) {
            currentWeek += '<div class="calendar-day empty"></div>';
            firstDay.setDate(firstDay.getDate() + 1);
        }

        calendarHTML += currentWeek + '</div></div>';
        calendarGrid.innerHTML = calendarHTML;

        // Reselect the previously selected date if it's in the current month
        if (selectedDate) {
            const selectedElement = calendarGrid.querySelector(`[data-date="${selectedDate}"]`);
            if (selectedElement) {
                selectedElement.classList.add('selected');
            }
        }
    }

    // Modified selectDate function
    window.selectDate = function(dateElement) {
        document.querySelectorAll('.calendar-day').forEach(day => 
            day.classList.remove('selected'));
        dateElement.classList.add('selected');
        
        booking.date = dateElement.dataset.date;
        selectedDate = booking.date;
        updateSummary();
        
        // Always show time slots when a date is selected
        const timeSlots = generateTimeSlots();
        renderTimeSlots(timeSlots);

        // Reset therapist selection when date changes
        selectedTherapist = null;
        booking.therapist = null;
    };

    // Load available time slots
    async function loadTimeSlots(date) {
        if (!selectedTherapist || !date) return;

        try {
            const response = await fetch('../php/appointments/get_available_slots.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    therapistId: selectedTherapist,
                    date: date
                })
            });

            const slots = await response.json();
            renderTimeSlots(slots);
        } catch (error) {
            console.error('Error loading time slots:', error);
            showError('Failed to load available time slots');
        }
    }

    // Modified renderTimeSlots function
    function renderTimeSlots(slots = generateTimeSlots()) {
        const slotsGrid = document.querySelector('.slots-grid');
        if (!slotsGrid) {
            console.error('Slots grid not found');
            return;
        }

        slotsGrid.innerHTML = '';

        slots.forEach(slot => {
            const timeSlot = document.createElement('button');
            timeSlot.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;
            timeSlot.dataset.time = slot.time;
            timeSlot.type = 'button'; // Prevent form submission
            if (!slot.available) timeSlot.disabled = true;
            
            timeSlot.innerHTML = formatTime(slot.time);
            
            // Add selected class if this slot matches the currently selected time
            if (booking.time === slot.time) {
                timeSlot.classList.add('selected');
            }
            
            if (slot.available) {
                timeSlot.addEventListener('click', function(e) {
                    e.preventDefault(); // Prevent any form submission
                    handleTimeSlotSelection(this);
                });
            }
            
            slotsGrid.appendChild(timeSlot);
        });
    }

    // Modified handleTimeSlotSelection function
    function handleTimeSlotSelection(slot) {
        document.querySelectorAll('.time-slot').forEach(s => 
            s.classList.remove('selected'));
        slot.classList.add('selected');
        
        booking.time = slot.dataset.time;
        selectedTime = booking.time;
        updateSummary();

        // Reset therapist selection when time changes
        selectedTherapist = null;
        booking.therapist = null;
    }

    // Update booking summary
    function updateSummary() {
        console.log('Current booking state:', booking); // Debug log

        if (booking.therapist) {
            const therapist = findTherapistById(booking.therapist);
            summaryTherapist.textContent = `Therapist: ${therapist ? therapist.firstName + ' ' + therapist.lastName : 'Selected'}`;
        }

        if (booking.date && booking.time) {
            summaryDateTime.textContent = `Date & Time: ${formatDate(booking.date)} at ${formatTime(booking.time)}`;
        }

        if (booking.sessionType) {
            summarySession.textContent = `Session: ${booking.sessionType}`;
        }
    }

    // Navigation between steps
    function goToStep(step) {
        currentStep = step;
        
        // Update step indicators
        steps.forEach((s, index) => {
            if (index + 1 <= step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        
        // Show/hide steps
        bookingSteps.forEach((s, index) => {
            if (index + 1 === step) {
                s.classList.add('show');
            } else {
                s.classList.remove('show');
            }
        });
        
        // Show/hide booking summary
        const bookingSummary = document.getElementById('bookingSummary');
        bookingSummary.style.display = step > 1 ? 'block' : 'none';
        
        updateStepButtons();
    }

    // Update navigation buttons
    function updateStepButtons() {
        prevButton.disabled = currentStep === 1;
        nextButton.textContent = currentStep === 3 ? 'Book Appointment' : 'Next';
    }

    // Setup event listeners
    function setupEventListeners() {
        prevButton.addEventListener('click', () => {
            if (currentStep > 1) goToStep(currentStep - 1);
        });

        nextButton.addEventListener('click', () => {
            if (validateStep()) {
                if (currentStep < 3) {
                    goToStep(currentStep + 1);
                } else {
                    showConfirmation();
                }
            }
        });

        // Add search and filter functionality
        therapistSearch.addEventListener('input', filterTherapists);
        specializationFilter.addEventListener('change', filterTherapists);
    }

    // Helper functions
    function isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    function isDateAvailable(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    }

    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function formatTime(time) {
        return new Date('2000-01-01T' + time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Generate time slots for testing
    function generateTimeSlots() {
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 17;  // 5 PM
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute of ['00', '30']) {
                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                slots.push({
                    time: time,
                    available: true // Set to true for testing
                });
            }
        }
        return slots;
    }

    // Initialize the booking page
    init();
});
