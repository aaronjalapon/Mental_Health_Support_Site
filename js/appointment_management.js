document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnToggle = e.target.closest('.mobile-toggle');
            
            if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
        }
    });

    // DOM Elements
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    const appointmentForm = document.getElementById('appointmentForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const appointmentTableBody = document.getElementById('appointmentTableBody');
    const addAppointmentForm = document.getElementById('addAppointmentForm');
    const appointmentFormModal = document.getElementById('appointmentFormModal');
    const closeModalButton = appointmentFormModal.querySelector('.close-modal');
    const editAppointmentModal = document.getElementById('editAppointmentModal');
    const editAppointmentForm = document.getElementById('editAppointmentForm');
    const closeEditModalButton = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // Sample data - Replace with actual API calls
    let appointments = [
        {
            id: 1,
            client: 'John Doe',
            therapist: 'Dr. Wilson',
            date: '2025-02-20',
            time: '10:00',
            sessionType: 'Video Call',
            notes: 'Follow-up session',
            status: 'Scheduled'
        },
        {
            id: 2,
            client: 'Jane Smith',
            therapist: 'Dr. Brown',
            date: '2025-02-18',
            time: '14:30',
            sessionType: 'Voice Call',
            notes: 'Initial consultation',
            status: 'Completed'
        },
        {
            id: 3,
            client: 'Mike Johnson',
            therapist: 'Dr. Davis',
            date: '2025-02-17',
            time: '11:00',
            sessionType: 'Chat Session',
            notes: 'Weekly check-in',
            status: 'Cancelled'
        }
    ];
    const sampleClients = ['John Doe', 'Jane Smith', 'Mike Johnson'];
    const sampleTherapists = ['Dr. Wilson', 'Dr. Brown', 'Dr. Davis'];

    // Populate dropdowns
    function populateDropdowns() {
        const clientSelect = document.querySelector('select[required]:first-of-type');
        const therapistSelect = document.querySelector('select[required]:nth-of-type(2)');

        clientSelect.innerHTML = '<option value="">Select Client</option>' +
            sampleClients.map(client => `<option value="${client}">${client}</option>`).join('');

        therapistSelect.innerHTML = '<option value="">Select Therapist</option>' +
            sampleTherapists.map(therapist => `<option value="${therapist}">${therapist}</option>`).join('');
    }

    // Populate filter dropdowns
    function populateFilterDropdowns() {
        const filterTherapist = document.getElementById('filterTherapist');
        const uniqueTherapists = [...new Set(appointments.map(app => app.therapist))];
        
        filterTherapist.innerHTML = '<option value="">All Therapists</option>' +
            uniqueTherapists.map(therapist => 
                `<option value="${therapist}">${therapist}</option>`
            ).join('');
    }

    // Toggle form visibility
    function toggleForm(show = true) {
        appointmentForm.style.display = show ? 'block' : 'none';
        if (show) {
            populateDropdowns();
        }
    }

    // Format date and time
    function formatDateTime(date, time) {
        return `${new Date(date).toLocaleDateString()} ${time}`;
    }

    // Filter and search functionality
    function filterAppointments() {
        const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
        const selectedTherapist = document.getElementById('filterTherapist').value;
        const selectedStatus = document.getElementById('filterStatus').value;

        const filteredAppointments = appointments.filter(appointment => {
            const matchesSearch = (
                appointment.client.toLowerCase().includes(searchTerm) ||
                appointment.therapist.toLowerCase().includes(searchTerm) ||
                appointment.sessionType.toLowerCase().includes(searchTerm)
            );

            const matchesTherapist = !selectedTherapist || appointment.therapist === selectedTherapist;
            const matchesStatus = !selectedStatus || appointment.status.toLowerCase() === selectedStatus;

            return matchesSearch && matchesTherapist && matchesStatus;
        });

        renderAppointments(filteredAppointments);
    }

    // Render appointments table
    function renderAppointments(appointmentsToRender = appointments) {
        appointmentTableBody.innerHTML = appointmentsToRender.map(appointment => `
            <tr>
                <td>${appointment.client}</td>
                <td>${appointment.therapist}</td>
                <td>${formatDateTime(appointment.date, appointment.time)}</td>
                <td>${appointment.sessionType}</td>
                <td>
                    <span class="status-badge status-${appointment.status.toLowerCase()}">
                        ${appointment.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editAppointment(${appointment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${appointment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Enhanced form validation
    function validateForm(formData) {
        const errors = {};
        
        if (!formData.get('client')) errors.client = 'Please select a client';
        if (!formData.get('therapist')) errors.therapist = 'Please select a therapist';
        
        const selectedDate = new Date(formData.get('date'));
        const today = new Date();
        if (selectedDate < today) {
            errors.date = 'Cannot schedule appointments in the past';
        }
        
        // Check for scheduling conflicts
        const conflictingAppointment = appointments.find(app => 
            app.date === formData.get('date') && 
            app.time === formData.get('time') && 
            app.therapist === formData.get('therapist')
        );
        
        if (conflictingAppointment) {
            errors.time = 'This time slot is already booked';
        }
        
        return errors;
    }

    // Show validation errors
    function showValidationErrors(errors) {
        // Clear existing errors
        document.querySelectorAll('.validation-error').forEach(el => el.remove());
        
        // Show new errors
        Object.entries(errors).forEach(([field, message]) => {
            const input = document.querySelector(`[name="${field}"]`);
            const error = document.createElement('div');
            error.className = 'validation-error';
            error.textContent = message;
            input.parentNode.appendChild(error);
        });
    }

    // Enhanced form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            showValidationErrors(errors);
            return;
        }
        
        const appointment = {
            id: Date.now(),
            client: formData.get('client'),
            therapist: formData.get('therapist'),
            date: formData.get('date'),
            time: formData.get('time'),
            sessionType: formData.get('sessionType'),
            notes: formData.get('notes'),
            status: 'Scheduled'
        };

        appointments.push(appointment);
        renderAppointments();
        toggleForm(false);
        e.target.reset();

        // Show success message
        showNotification('Appointment scheduled successfully!', 'success');
        toggleModal(); // Close modal after successful submission
    }

    // Delete appointment
    window.deleteAppointment = function(id) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            appointments = appointments.filter(app => app.id !== id);
            renderAppointments();
        }
    };

    // Edit appointment
    window.editAppointment = function(id) {
        const appointment = appointments.find(app => app.id === id);
        if (!appointment) return;

        // Populate the edit form
        const form = document.getElementById('editAppointmentForm');
        form.elements['client'].value = appointment.client;
        form.elements['therapist'].value = appointment.therapist;
        form.elements['date'].value = appointment.date;
        form.elements['time'].value = appointment.time;
        form.elements['sessionType'].value = appointment.sessionType;
        form.elements['notes'].value = appointment.notes;
        form.elements['status'].value = appointment.status;
        document.getElementById('editAppointmentId').value = appointment.id;

        // Show the edit modal
        toggleEditModal();

        // Populate dropdowns in the edit form
        populateDropdowns(form);
    };

    // Enhanced calendar functionality
    function initializeCalendar() {
        const calendar = document.querySelector('.appointment-calendar');
        const currentDate = new Date();
        
        const calendarHTML = `
            <div class="calendar-controls">
                <div class="calendar-navigation">
                    <button class="btn btn-secondary" id="prevMonth">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3>${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button class="btn btn-secondary" id="nextMonth">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="view-toggle">
                    <button class="btn active" data-view="month">Month</button>
                    <button class="btn" data-view="week">Week</button>
                    <button class="btn" data-view="day">Day</button>
                </div>
            </div>
            <div class="calendar-wrapper">
                <div class="calendar-weekdays">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        .map(day => `<div class="weekday">${day}</div>`).join('')}
                </div>
                <div class="calendar-grid">
                    ${generateCalendarDays(currentDate)}
                </div>
            </div>
        `;
        
        calendar.innerHTML = calendarHTML;
        attachCalendarListeners();
    }

    function getAppointmentsForDate(date) {
        const targetDate = new Date(date);
        return appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate.getFullYear() === targetDate.getFullYear() &&
                   appDate.getMonth() === targetDate.getMonth() &&
                   appDate.getDate() === targetDate.getDate();
        });
    }

    function generateCalendarDays(currentDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        let days = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days += '<div class="calendar-day empty"></div>';
        }
        
        // Add the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            const dateString = currentDay.toISOString().split('T')[0];
            const isToday = currentDay.toDateString() === today.toDateString();
            const dayAppointments = getAppointmentsForDate(currentDay);
            const hasAppointments = dayAppointments.length > 0;
            
            days += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasAppointments ? 'has-appointments' : ''}" 
                     data-date="${dateString}">
                    <span class="date">${day}</span>
                    ${hasAppointments ? `
                        <div class="appointment-count">${dayAppointments.length}</div>
                        <div class="appointment-preview">
                            ${generateAppointmentPreviews(dayAppointments, dateString)}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        return days;
    }

    function generateAppointmentPreviews(appointments, dateString) {
        if (!appointments || appointments.length === 0) return '';

        const sortedAppointments = appointments.sort((a, b) => {
            return a.time.localeCompare(b.time);
        });

        return sortedAppointments.map(app => `
            <div class="appointment-preview-item" data-appointment-id="${app.id}">
                <span class="preview-time">${formatTime(app.time)}</span>
                <div class="preview-client">
                    <span>${app.client}</span>
                    <span class="preview-type">${app.sessionType}</span>
                </div>
            </div>
        `).join('');
    }

    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes || '00'} ${ampm}`;
    }

    function attachCalendarListeners() {
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const viewButtons = document.querySelectorAll('.view-toggle button');
        const quickActionButtons = document.querySelectorAll('.quick-action-btn');
        
        let currentDate = new Date();
        let currentView = 'month';

        // Quick action buttons
        quickActionButtons.forEach(button => {
            button.addEventListener('click', () => {
                quickActionButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                switch(button.dataset.period) {
                    case 'today':
                        currentDate = new Date();
                        currentView = 'day';
                        break;
                    case 'tomorrow':
                        currentDate = new Date();
                        currentDate.setDate(currentDate.getDate() + 1);
                        currentView = 'day';
                        break;
                    case 'week':
                        currentDate = new Date();
                        currentView = 'week';
                        break;
                }
                
                // Update view toggle buttons
                viewButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.view === currentView);
                });
                
                updateCalendar();
            });
        });

        // Month navigation
        prevMonthBtn.addEventListener('click', () => {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            updateCalendar();
        });
    
        nextMonthBtn.addEventListener('click', () => {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            updateCalendar();
        });
    
        // View toggle
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentView = button.dataset.view;
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateCalendar();
            });
        });
    
        function updateCalendar() {
            const calendar = document.querySelector('.calendar-wrapper');
            
            // Clear any existing 'active' states from quick action buttons
            if (currentView !== 'day' && currentView !== 'week') {
                document.querySelectorAll('.quick-action-btn').forEach(btn => 
                    btn.classList.remove('active')
                );
            }
            
            switch(currentView) {
                case 'month':
                    calendar.innerHTML = `
                        <div class="calendar-weekdays">
                            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                                .map(day => `<div class="weekday">${day}</div>`).join('')}
                        </div>
                        <div class="calendar-grid">
                            ${generateCalendarDays(currentDate)}
                        </div>
                    `;
                    break;
                    
                case 'week':
                    const weekStart = getWeekStart(currentDate);
                    calendar.innerHTML = generateWeekView(weekStart);
                    break;
                    
                case 'day':
                    calendar.innerHTML = generateDayView(currentDate);
                    break;
            }
    
            // Update month/year display
            const monthYearDisplay = document.querySelector('.calendar-navigation h3');
            monthYearDisplay.textContent = currentDate.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
    }
    
    function getWeekStart(date) {
        const tempDate = new Date(date);
        const day = tempDate.getDay();
        return new Date(tempDate.setDate(tempDate.getDate() - day));
    }
    
    function generateWeekView(startDate) {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            weekDays.push(currentDate);
        }
    
        return `
            <div class="calendar-weekdays">
                ${weekDays.map(date => `
                    <div class="weekday">
                        ${date.toLocaleDateString('default', { weekday: 'short' })}
                        <small>${date.getDate()}</small>
                    </div>
                `).join('')}
            </div>
            <div class="calendar-grid week-view">
                ${generateTimeSlots(weekDays)}
            </div>
        `;
    }
    
    function generateDayView(date) {
        return `
            <div class="day-view">
                <div class="day-header">
                    ${date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div class="time-slots">
                    ${generateHourlySlots(date)}
                </div>
            </div>
        `;
    }
    
    function generateTimeSlots(weekDays) {
        const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
        
        return hours.map(hour => `
            <div class="time-row">
                <div class="time-label">${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}</div>
                ${weekDays.map(date => {
                    const appointments = getAppointmentsForDateTime(date, hour);
                    return `
                        <div class="time-slot ${appointments.length ? 'booked' : 'available'}" 
                             data-date="${date.toISOString().split('T')[0]}"
                             data-time="${hour}:00">
                            ${appointments.map(app => `
                                <div class="appointment-chip">
                                    ${app.client} - ${app.sessionType}
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
    }
    
    function generateHourlySlots(date) {
        const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
        
        return hours.map(hour => {
            const appointments = getAppointmentsForDateTime(date, hour);
            return `
                <div class="hour-slot">
                    <div class="time-label">${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}</div>
                    <div class="slot-content ${appointments.length ? 'booked' : 'available'}">
                        ${appointments.map(app => `
                            <div class="appointment-detail">
                                <strong>${app.client}</strong>
                                <span>${app.sessionType}</span>
                                <span>${app.therapist}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function getAppointmentsForDateTime(date, hour) {
        return appointments.filter(app => {
            const appDate = new Date(app.date);
            const appHour = parseInt(app.time.split(':')[0]);
            return appDate.toDateString() === date.toDateString() && appHour === hour;
        });
    }

    // Add calendar collapse functionality
    const calendarToggle = document.getElementById('calendarToggle');
    const calendarContent = document.getElementById('calendarContent');
    const collapseIcon = calendarToggle.querySelector('.collapse-icon');
    
    calendarToggle.addEventListener('click', () => {
        calendarContent.classList.toggle('collapsed');
        collapseIcon.classList.toggle('collapsed');
        
        // Save preference to localStorage
        localStorage.setItem('calendarCollapsed', calendarContent.classList.contains('collapsed'));
    });
    
    // Restore calendar state from localStorage
    const isCalendarCollapsed = localStorage.getItem('calendarCollapsed') === 'true';
    if (isCalendarCollapsed) {
        calendarContent.classList.add('collapsed');
        collapseIcon.classList.add('collapsed');
    }

    // Event Listeners
    addAppointmentBtn.addEventListener('click', toggleModal);
    cancelBtn.addEventListener('click', toggleModal);
    closeModalButton.addEventListener('click', toggleModal);
    addAppointmentForm.addEventListener('submit', handleFormSubmit);
    editAppointmentForm.addEventListener('submit', handleEditFormSubmit);
    closeEditModalButton.addEventListener('click', toggleEditModal);
    cancelEditBtn.addEventListener('click', toggleEditModal);
    document.getElementById('searchAppointments').addEventListener('input', filterAppointments);
    document.getElementById('filterTherapist').addEventListener('change', filterAppointments);
    document.getElementById('filterStatus').addEventListener('change', filterAppointments);

    // Initialize calendar last to ensure all elements are ready
    setTimeout(() => {
        initializeCalendar();
        populateFilterDropdowns();
        renderAppointments();
    }, 100);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === appointmentFormModal) {
            toggleModal();
        }
        if (e.target === editAppointmentModal) {
            toggleEditModal();
        }
    });

    function toggleModal() {
        appointmentFormModal.classList.toggle('active');
    }

    function toggleEditModal() {
        editAppointmentModal.classList.toggle('active');
    }

    function handleEditFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = parseInt(document.getElementById('editAppointmentId').value);
        
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            showValidationErrors(errors);
            return;
        }
        
        // Update the appointment
        const index = appointments.findIndex(app => app.id === id);
        if (index !== -1) {
            appointments[index] = {
                ...appointments[index],
                client: formData.get('client'),
                therapist: formData.get('therapist'),
                date: formData.get('date'),
                time: formData.get('time'),
                sessionType: formData.get('sessionType'),
                notes: formData.get('notes'),
                status: formData.get('status')
            };
            
            renderAppointments();
            toggleEditModal();
            showNotification('Appointment updated successfully!', 'success');
        }
    }

    // Initialize filter dropdowns
    function initializeFilterDropdowns() {
        const clientInput = document.getElementById('clientInput');
        const therapistInput = document.getElementById('therapistInput');
        const clientDropdown = document.getElementById('clientDropdown');
        const therapistDropdown = document.getElementById('therapistDropdown');

        // Setup event listeners for client input
        setupDropdownFilter(clientInput, clientDropdown, sampleClients);
        
        // Setup event listeners for therapist input
        setupDropdownFilter(therapistInput, therapistDropdown, sampleTherapists);
    }

    function setupDropdownFilter(input, dropdown, items) {
        // Show dropdown on focus
        input.addEventListener('focus', () => {
            filterDropdownItems(input, dropdown, items);
            dropdown.classList.add('active');
        });

        // Filter items as user types
        input.addEventListener('input', () => {
            filterDropdownItems(input, dropdown, items);
        });

        // Handle click outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        // Handle dropdown item selection
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                input.value = item.textContent;
                dropdown.classList.remove('active');
            }
        });
    }

    function filterDropdownItems(input, dropdown, items) {
        const filterValue = input.value.toLowerCase();
        const filteredItems = items.filter(item => 
            item.toLowerCase().includes(filterValue)
        );

        dropdown.innerHTML = filteredItems.map(item => `
            <div class="dropdown-item">${item}</div>
        `).join('');
    }

    initializeFilterDropdowns();
});

// Add responsiveness handling
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
    }
});

// Add these helper functions
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function isToday(date) {
    return isSameDay(date, new Date());
}

function isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(date, tomorrow);
}

function isThisWeek(date) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return date >= weekStart && date <= weekEnd;
}

function generateAppointmentPreviews(appointments) {
    // Sort appointments by time
    const sortedAppointments = appointments.sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return timeA - timeB;
    });

    // Group appointments by time slot
    const timeSlots = {};
    sortedAppointments.forEach(app => {
        if (!timeSlots[app.time]) {
            timeSlots[app.time] = [];
        }
        timeSlots[app.time].push(app);
    });

    // Generate preview items for each time slot
    return Object.entries(timeSlots).map(([time, apps]) => `
        <div class="appointment-preview-item" data-time="${time}" data-date="${apps[0].date}">
            <span class="preview-time">${formatTime(time)}</span>
            <div class="preview-appointments">
                ${apps.map(app => `
                    <div class="preview-client">
                        ${app.client}
                        <span class="preview-type">${app.sessionType}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Add this helper function
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
}
