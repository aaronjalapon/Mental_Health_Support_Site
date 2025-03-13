class AppointmentCalendar {
    constructor() {
        this.currentDate = new Date();
        this.appointments = [];
        this.initializeCalendar();
        this.fetchAppointments();
        this.loadTherapists();
        this.initializeCalendarToggle();
        this.initializeAddAppointment();
    }

    async fetchAppointments() {
        try {
            const response = await fetch('/php/appointments/fetch_admin_appointments.php');
            const data = await response.json();
            if (data.success) {
                this.appointments = data.data;
                this.renderCalendar();
                this.renderAppointmentTable();
                this.updateTherapistFilter();
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }

    initializeCalendar() {
        // Wait for DOM elements to be available
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const viewToggleBtns = document.querySelectorAll('.view-toggle .btn');

        if (prevMonthBtn && nextMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });

            nextMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        if (viewToggleBtns.length > 0) {
            viewToggleBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    viewToggleBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.renderCalendar(e.target.dataset.view);
                });
            });
        }
        
        // Initial render
        this.renderCalendar();
    }

    initializeCalendarToggle() {
        const calendarToggle = document.getElementById('calendarToggle');
        const calendarContent = document.getElementById('calendarContent');
        const collapseIcon = calendarToggle?.querySelector('.collapse-icon');

        if (calendarToggle && calendarContent && collapseIcon) {
            // Set initial state
            let isCollapsed = false;

            const toggleCalendar = () => {
                isCollapsed = !isCollapsed;
                calendarContent.classList.toggle('collapsed', isCollapsed);
                collapseIcon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0)';
                
                // Add transition end listener to clean up after collapse
                calendarContent.addEventListener('transitionend', () => {
                    if (isCollapsed) {
                        calendarContent.style.display = 'none';
                    }
                }, { once: true });

                // Show immediately when expanding
                if (!isCollapsed) {
                    calendarContent.style.display = 'block';
                }
            };

            calendarToggle.addEventListener('click', toggleCalendar);
        }
    }

    // Add updateTherapistFilter method
    updateTherapistFilter() {
        const therapists = [...new Set(this.appointments.map(apt => apt.therapist_name))];
        const filterSelect = document.getElementById('filterTherapist');
        if (filterSelect) {
            filterSelect.innerHTML = `
                <option value="">All Therapists</option>
                ${therapists.map(t => `<option value="${t}">${t}</option>`).join('')}
            `;
        }
    }

    renderCalendar(view = 'month') {
        const monthYearText = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        document.querySelector('.calendar-navigation h3').textContent = monthYearText;

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        let calendarHtml = '';
        const startingDay = firstDay.getDay();

        // Empty cells for days before first of month
        for (let i = 0; i < startingDay; i++) {
            calendarHtml += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            
            // Filter only upcoming appointments and ensure exact date match
            const dayAppointments = this.appointments.filter(apt => {
                const appointmentDate = new Date(apt.date);
                return apt.status === 'upcoming' && 
                       appointmentDate.getFullYear() === date.getFullYear() &&
                       appointmentDate.getMonth() === date.getMonth() &&
                       appointmentDate.getDate() === date.getDate();
            });
            
            const isToday = date.toDateString() === new Date().toDateString();
            
            calendarHtml += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                    <span class="date">${day}</span>
                    <div class="appointment-list">
                        ${dayAppointments.map(apt => {
                            // Format the time in 12-hour format
                            const timeStr = new Date(`2000-01-01T${apt.time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            });
                            return `
                                <div class="appointment-item">
                                    <div class="appointment-label">Upcoming Session</div>
                                    <div class="appointment-details">
                                        <span class="time">${timeStr}</span>
                                        <span class="client">${apt.client_name}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        document.querySelector('.calendar-grid').innerHTML = calendarHtml;
    }

    renderAppointmentTable() {
        const tableBody = document.getElementById('appointmentTableBody');
        const appointments = this.filterAppointments();
        
        tableBody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${apt.client_name}</td>
                <td>${apt.therapist_name}</td>
                <td>${this.formatDateTime(apt.date, apt.time)}</td>
                <td>
                    <span class="session-type">
                        <i class="fas fa-${apt.session_type === 'video' ? 'video' : apt.session_type === 'voice' ? 'phone' : 'comment'}"></i>
                        ${this.formatSessionType(apt.session_type)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${apt.status}">
                        ${this.formatStatus(apt.status)}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editAppointment(${apt.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${apt.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center">No appointments found</td></tr>';
    }

    async loadTherapists() {
        try {
            const response = await fetch('/php/CRUDTherapist/fetch_therapist.php?names_only=true');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            const filterSelect = document.getElementById('filterTherapist');
            if (filterSelect && data.success && Array.isArray(data.data)) {
                filterSelect.innerHTML = '<option value="">All Therapists</option>' +
                    data.data.map(t => {
                        const fullName = `${t.first_name} ${t.last_name}`;
                        return `
                            <option value="${fullName}">
                                ${fullName}${t.specialization ? ` - ${t.specialization}` : ''}
                            </option>
                        `;
                    }).join('');

                // Add event listeners
                filterSelect.addEventListener('change', () => this.renderAppointmentTable());
                const statusFilter = document.getElementById('filterStatus');
                const dateFilter = document.getElementById('filterDate');
                
                if (statusFilter) {
                    statusFilter.value = 'all';
                    statusFilter.addEventListener('change', () => this.renderAppointmentTable());
                }
                if (dateFilter) {
                    dateFilter.addEventListener('change', () => this.renderAppointmentTable());
                }
                document.getElementById('searchAppointments')?.addEventListener('input', 
                    () => this.renderAppointmentTable()
                );
            }
        } catch (error) {
            console.error('Error loading therapists:', error);
        }
    }

    async loadTherapistsList() {
        try {
            const response = await fetch('/php/CRUDTherapist/fetch_therapist.php');
            const therapists = await response.json();
            
            if (Array.isArray(therapists)) {  // Your PHP returns direct array
                const therapistInput = document.getElementById('therapistInput');
                const therapistDropdown = document.getElementById('therapistDropdown');
                
                therapistInput.addEventListener('input', () => {
                    const value = therapistInput.value.toLowerCase();
                    const filtered = therapists.filter(therapist => 
                        `${therapist.firstName} ${therapist.lastName}`.toLowerCase().includes(value) ||
                        therapist.specialization.toLowerCase().includes(value)
                    );
                    
                    therapistDropdown.innerHTML = filtered.map(therapist => `
                        <div class="dropdown-item" data-id="${therapist.therapist_id}">
                            ${therapist.firstName} ${therapist.lastName} 
                            ${therapist.specialization ? ` - ${therapist.specialization}` : ''}
                        </div>
                    `).join('');
                    
                    therapistDropdown.style.display = filtered.length ? 'block' : 'none';
                });

                // Handle therapist selection
                therapistDropdown.addEventListener('click', (e) => {
                    const item = e.target.closest('.dropdown-item');
                    if (item) {
                        therapistInput.value = item.textContent.trim();
                        therapistInput.dataset.id = item.dataset.id;
                        therapistDropdown.style.display = 'none';
                    }
                });

                // Hide dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!therapistInput.contains(e.target) && !therapistDropdown.contains(e.target)) {
                        therapistDropdown.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Error loading therapists:', error);
        }
    }

    async loadClientsList() {
        try {
            const response = await fetch('/php/CRUDClient/fetch_clients.php');
            const clients = await response.json();
            
            if (Array.isArray(clients)) {  // Check if response is an array
                const clientInput = document.getElementById('clientInput');
                const clientDropdown = document.getElementById('clientDropdown');
                
                clientInput.addEventListener('input', () => {
                    const value = clientInput.value.toLowerCase();
                    const filtered = clients.filter(client => 
                        `${client.firstName} ${client.lastName}`.toLowerCase().includes(value)
                    );
                    
                    clientDropdown.innerHTML = filtered.map(client => `
                        <div class="dropdown-item" data-id="${client.id}">
                            ${client.firstName} ${client.lastName}
                        </div>
                    `).join('');
                    
                    clientDropdown.style.display = filtered.length ? 'block' : 'none';
                });

                // Handle client selection
                clientDropdown.addEventListener('click', (e) => {
                    const item = e.target.closest('.dropdown-item');
                    if (item) {
                        clientInput.value = item.textContent.trim();
                        clientInput.dataset.id = item.dataset.id;
                        clientDropdown.style.display = 'none';
                    }
                });

                // Hide dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!clientInput.contains(e.target) && !clientDropdown.contains(e.target)) {
                        clientDropdown.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    // Helper methods
    formatDateTime(date, time) {
        return `${new Date(date).toLocaleDateString()} ${time}`;
    }

    formatSessionType(type) {
        const types = {
            'video': 'Video Call',
            'voice': 'Voice Call',
            'chat': 'Chat Session'
        };
        return types[type] || type;
    }

    formatStatus(status) {
        const statuses = {
            'upcoming': 'Upcoming',  // Changed from 'Scheduled' to 'Upcoming'
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'pending': 'Pending',
            'reschedule_requested': 'Reschedule Requested'
        };
        return statuses[status] || status;
    }

    filterAppointments() {
        const searchTerm = document.getElementById('searchAppointments')?.value?.toLowerCase() || '';
        const therapistFilter = document.getElementById('filterTherapist')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';
        const dateFilter = document.getElementById('filterDate')?.value || '';
        
        return this.appointments.filter(apt => {
            const matchesSearch = apt.client_name?.toLowerCase().includes(searchTerm) || 
                                apt.therapist_name?.toLowerCase().includes(searchTerm);
            const matchesTherapist = !therapistFilter || apt.therapist_name === therapistFilter;
            const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
            const matchesDate = !dateFilter || apt.date === dateFilter;
            
            return matchesSearch && matchesTherapist && matchesStatus && matchesDate;
        });
    }

    initializeAddAppointment() {
        const addBtn = document.getElementById('addAppointmentBtn');
        const modal = document.getElementById('appointmentFormModal');
        const form = document.getElementById('addAppointmentForm');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancelBtn');

        addBtn?.addEventListener('click', () => {
            modal.classList.add('active');
            this.loadClientsList();
            this.loadTherapistsList();
        });

        closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
        cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));

        form?.addEventListener('submit', (e) => this.handleAppointmentSubmit(e));

        // Add event listeners for date/time changes
        const dateInput = form?.querySelector('[name="date"]');
        const timeInput = form?.querySelector('[name="time"]');

        dateInput?.addEventListener('change', () => this.updateAvailableTherapists());
        timeInput?.addEventListener('change', () => this.updateAvailableTherapists());
    }

    async updateAvailableTherapists() {
        const dateInput = document.querySelector('[name="date"]');
        const timeInput = document.querySelector('[name="time"]');
        const therapistInput = document.getElementById('therapistInput');
        
        if (!dateInput?.value || !timeInput?.value) return;

        try {
            const response = await fetch('/php/appointments/fetch_available_therapists.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: dateInput.value,
                    time: timeInput.value
                })
            });

            const data = await response.json();
            
            if (data.success) {
                therapistInput.value = ''; // Clear current selection
                therapistInput.dataset.id = ''; // Clear selected ID
                
                const dropdownContent = data.data.map(therapist => `
                    <div class="dropdown-item" data-id="${therapist.therapist_id}">
                        ${therapist.firstName} ${therapist.lastName} - ${therapist.specialization}
                    </div>
                `).join('');
                
                const therapistDropdown = document.getElementById('therapistDropdown');
                therapistDropdown.innerHTML = dropdownContent;
                therapistDropdown.style.display = data.data.length ? 'block' : 'none';
                
                if (data.data.length === 0) {
                    therapistInput.setCustomValidity(data.message || 'No therapists available at this time');
                } else {
                    therapistInput.setCustomValidity('');
                }
            } else {
                throw new Error(data.error || 'Failed to fetch available therapists');
            }
        } catch (error) {
            console.error('Error fetching available therapists:', error);
            therapistInput.setCustomValidity(error.message);
        }
    }

    async handleAppointmentSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = {
            clientId: document.querySelector('#clientInput').dataset.id,
            therapistId: document.querySelector('#therapistInput').dataset.id,
            date: form.querySelector('[name="date"]').value,
            time: form.querySelector('[name="time"]').value,
            sessionType: form.querySelector('[name="sessionType"]').value,
            notes: form.querySelector('[name="notes"]').value
        };

        try {
            const response = await fetch('/php/appointments/schedule_appointment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert('Appointment scheduled successfully!'); // Add success alert
                document.getElementById('appointmentFormModal').classList.remove('active');
                this.fetchAppointments();
                form.reset();
            } else {
                alert(data.error || 'Failed to schedule appointment');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to schedule appointment');
        }
    }
}

// Make sure DOM is loaded before initialization
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.appointment-calendar')) {
        window.appointmentManager = new AppointmentCalendar();
    }
    // Add event listener to toggle calendar collapse
    const calendarToggle = document.getElementById('calendarToggle');
    const calendarContent = document.getElementById('calendarContent');
    calendarToggle?.addEventListener('click', () => {
        calendarContent.classList.toggle('collapsed');
        const icon = calendarToggle.querySelector('.collapse-icon');
        icon.classList.toggle('collapsed');
    });
});

// Add these new functions
function editAppointment(appointmentId) {
    fetch(`/php/appointments/fetch_appointment_details.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const apt = data.appointment;
            // Fill the edit modal with appointment data
            document.getElementById('editAppointmentId').value = apt.id;
            document.querySelector('#editAppointmentForm [name="client"]').value = apt.client_name;
            document.querySelector('#editAppointmentForm [name="therapist"]').value = apt.therapist_name;
            document.querySelector('#editAppointmentForm [name="date"]').value = apt.date;
            document.querySelector('#editAppointmentForm [name="time"]').value = apt.time;
            document.querySelector('#editAppointmentForm [name="sessionType"]').value = apt.session_type;
            document.querySelector('#editAppointmentForm [name="status"]').value = apt.status;
            document.querySelector('#editAppointmentForm [name="notes"]').value = apt.notes || '';
            
            // Show the modal
            document.getElementById('editAppointmentModal').classList.add('active');
        } else {
            alert(data.error || 'Failed to load appointment details');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to load appointment details');
    });
}

document.getElementById('editAppointmentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
        appointmentId: document.getElementById('editAppointmentId').value,
        date: this.querySelector('[name="date"]').value,
        time: this.querySelector('[name="time"]').value,
        sessionType: this.querySelector('[name="sessionType"]').value,
        status: this.querySelector('[name="status"]').value,
        notes: this.querySelector('[name="notes"]').value
    };

    fetch('/php/appointments/update_admin_appointment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal and refresh appointments
            document.getElementById('editAppointmentModal').classList.remove('active');
            window.appointmentManager.fetchAppointments();
        } else {
            alert(data.error || 'Failed to update appointment');
        }
    })
    .catch(error => console.error('Error:', error));
});

function deleteAppointment(appointmentId) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const formData = new FormData();
        formData.append('appointmentId', appointmentId);

        fetch('/php/appointments/delete_appointment.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.appointmentManager.fetchAppointments();
            } else {
                alert(data.error || 'Failed to delete appointment');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Handle modal close buttons
document.querySelectorAll('.close-modal, #cancelEditBtn').forEach(btn => {
    btn?.addEventListener('click', () => {
        document.getElementById('editAppointmentModal').classList.remove('active');
    });
});
