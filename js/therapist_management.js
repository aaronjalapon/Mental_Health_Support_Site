document.addEventListener('DOMContentLoaded', function() {
    // Initialize the sidebar functionality for mobile
    if (window.innerWidth <= 768) {
        initSidebar();
    }

    const addTherapistBtn = document.getElementById('addTherapistBtn');
    const addTherapistForm = document.getElementById('addTherapistForm');
    const therapistTableBody = document.getElementById('therapistTableBody');
    const searchInput = document.getElementById('therapistSearch');
    const statusFilter = document.getElementById('statusFilter');
    const therapistFormModal = document.getElementById('therapistFormModal');
    const editTherapistModal = document.getElementById('editTherapistModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const editTherapistForm = document.getElementById('editTherapistForm');

    let therapists = [];
    let filteredTherapists = [];

    // Add retry logic for fetch operations
    async function fetchWithRetry(url, options, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    // Update fetchTherapists to use proper headers
    async function fetchTherapists() {
        try {
            const data = await fetchWithRetry('../php/CRUDTherapist/fetch_therapist.php', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (data.error) {
                console.error('Server error:', data.error);
                return;
            }
            
            therapists = Array.isArray(data) ? data : [];
            filteredTherapists = [...therapists];
            renderTherapists();
            
            console.log('Fetched therapistsasss:', therapists);
        } catch (error) {
            console.error('Failed to fetch therapists:', error);
            alert('Failed to load therapists. Please try again later.');
        }
    }

    function toggleAddModal() {
        therapistFormModal.classList.toggle('active');
        if (therapistFormModal.classList.contains('active')) {
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = ''; // Restore scrolling
            addTherapistForm.reset(); // Reset form when closing
        }
    }

    function toggleEditModal() {
        editTherapistModal.classList.toggle('active');
        if (editTherapistModal.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function filterTherapists() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        filteredTherapists = therapists.filter(therapist => {
            const matchesSearch = therapist.firstName.toLowerCase().includes(searchTerm) ||
                                therapist.lastName.toLowerCase().includes(searchTerm) ||
                                therapist.specialization.toLowerCase().includes(searchTerm) ||
                                therapist.email.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusValue === 'all' || 
                                therapist.status.toLowerCase() === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderTherapists();
    }

    function formatDays(days) {
        const dayMapping = {
            sunday: 'Sun',
            monday: 'Mon',
            tuesday: 'Tue',
            wednesday: 'Wed',
            thursday: 'Thu',
            friday: 'Fri',
            saturday: 'Sat'
        };
        return days.map(day => dayMapping[day] || day);
    }

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    function renderTherapists() {
        therapistTableBody.innerHTML = filteredTherapists.map(therapist => `
            <tr>
                <td>${therapist.firstName} ${therapist.lastName}</td>
                <td>${therapist.specialization}</td>
                <td>${therapist.experience} years</td>
                <td>
                    <div class="availability-days">
                        ${Array.isArray(therapist.availability.days) ? therapist.availability.days.map(day => 
                            `<span class="availability-day">${formatDays([day])}</span>`
                        ).join('') : ''}
                    </div>
                </td>
                <td>
                    <div class="working-hours">
                        <span class="time">${formatTime(therapist.availability.hours?.start)} - ${formatTime(therapist.availability.hours?.end)}</span>
                        ${therapist.availability.hours?.break?.start ? `
                            <span class="break">Break: ${formatTime(therapist.availability.hours.break.start)} - ${formatTime(therapist.availability.hours.break.end)}</span>
                        ` : ''}
                    </div>
                </td>
                <td><span class="therapist-status status-${therapist.status.toLowerCase()}">${therapist.status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editTherapist(${therapist.therapist_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteTherapist(${therapist.therapist_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    addTherapistBtn.addEventListener('click', toggleAddModal);
    document.getElementById('cancelBtn').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAddModal();
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal.id === 'editTherapistModal') {
                toggleEditModal();
            } else {
                toggleAddModal();
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            if (e.target === editTherapistModal) {
                toggleEditModal();
            } else if (e.target === therapistFormModal) {
                toggleAddModal();
            }
        }
    });

    // Fix the getAvailabilityFromForm function - it had duplicate code
    function getAvailabilityFromForm(form) {
        const availableDays = Array.from(form.querySelectorAll('input[name="availableDays"]:checked'))
            .map(checkbox => checkbox.value);
        
        const startTime = form.querySelector('input[name="startTime"]').value;
        const endTime = form.querySelector('input[name="endTime"]').value;
        const breakStart = form.querySelector('input[name="breakStart"]').value;
        const breakEnd = form.querySelector('input[name="breakEnd"]').value;

        return {
            days: availableDays,
            hours: {
                start: startTime || null,
                end: endTime || null,
                break: {
                    start: breakStart || null,
                    end: breakEnd || null
                }
            }
        };
    }

    // Remove duplicate addTherapistForm event listener and merge functionality
    addTherapistForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate password match if needed
        const password = document.getElementById('therapistPassword').value;
        
        // Create FormData object like in client management
        const formData = new FormData();
        formData.append('firstName', document.getElementById('therapistFirstName').value.trim());
        formData.append('lastName', document.getElementById('therapistLastName').value.trim());
        formData.append('username', document.getElementById('therapistUsername').value.trim());
        formData.append('password', password);
        formData.append('email', document.getElementById('therapistEmail').value.trim());
        formData.append('phone', document.getElementById('therapistPhone').value.trim());
        formData.append('specialization', document.getElementById('therapistSpecialization').value.trim());
        formData.append('experience', document.getElementById('therapistExperience').value);
        formData.append('bio', document.getElementById('therapistBio').value.trim());

        // Add availability data
        const availableDays = Array.from(document.querySelectorAll('input[name="availableDays"]:checked'))
            .map(checkbox => checkbox.value);
        availableDays.forEach(day => formData.append('availableDays[]', day));
        
        formData.append('startTime', document.querySelector('input[name="startTime"]').value);
        formData.append('endTime', document.querySelector('input[name="endTime"]').value);
        formData.append('breakStart', document.querySelector('input[name="breakStart"]').value);
        formData.append('breakEnd', document.querySelector('input[name="breakEnd"]').value);

        try {
            const response = await fetch('../php/CRUDTherapist/add_therapist.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchTherapists();
                toggleAddModal();
                addTherapistForm.reset();
                alert('Therapist added successfully');
            } else {
                alert(data.error || 'Failed to add therapist');
            }
        } catch (error) {
            console.error('Error adding therapist:', error);
            alert('Failed to add therapist');
        }
    });

    // Update edit form submission handler
    editTherapistForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = [
            'editTherapistFirstName',
            'editTherapistLastName',
            'editTherapistUsername',
            'editTherapistEmail',
            'editTherapistSpecialization'
        ];

        const invalidFields = requiredFields.filter(fieldId => {
            const value = document.getElementById(fieldId).value.trim();
            return !value;
        });

        if (invalidFields.length > 0) {
            alert('Please fill in all required fields');
            return;
        }

        const formData = new FormData();
        
        // Add all fields to formData
        formData.append('editTherapistId', document.getElementById('editTherapistId').value);
        formData.append('firstName', document.getElementById('editTherapistFirstName').value.trim());
        formData.append('lastName', document.getElementById('editTherapistLastName').value.trim());
        formData.append('username', document.getElementById('editTherapistUsername').value.trim());
        formData.append('email', document.getElementById('editTherapistEmail').value.trim());
        formData.append('phone', document.getElementById('editTherapistPhone').value.trim());
        formData.append('specialization', document.getElementById('editTherapistSpecialization').value.trim());
        formData.append('experience', document.getElementById('editTherapistExperience').value);
        formData.append('bio', document.getElementById('editTherapistBio').value.trim());
        formData.append('status', document.getElementById('editTherapistStatus').value);

        // Add availability data
        const availableDays = Array.from(this.querySelectorAll('input[name="availableDays"]:checked'))
            .map(checkbox => checkbox.value);
            
        if (availableDays.length === 0) {
            alert('Please select at least one working day');
            return;
        }

        availableDays.forEach(day => formData.append('availableDays[]', day));
        
        // Validate time inputs
        const startTime = this.querySelector('input[name="startTime"]').value;
        const endTime = this.querySelector('input[name="endTime"]').value;
        
        if (!startTime || !endTime) {
            alert('Please set working hours');
            return;
        }

        formData.append('startTime', startTime);
        formData.append('endTime', endTime);
        formData.append('breakStart', this.querySelector('input[name="breakStart"]').value);
        formData.append('breakEnd', this.querySelector('input[name="breakEnd"]').value);

        try {
            const response = await fetch('../php/CRUDTherapist/update_therapist.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                await fetchTherapists();
                toggleEditModal();
                alert('Therapist updated successfully');
            } else {
                throw new Error(data.error || 'Failed to update therapist');
            }
        } catch (error) {
            console.error('Error updating therapist:', error);
            alert('Failed to update therapist: ' + error.message);
        }
    });

    // Fix the editTherapist function
    window.editTherapist = async function(id) {
        try {
            // First log the therapists array and the ID we're looking for
            console.log('Looking for therapist ID:', id);
            console.log('Available therapists:', therapists);
            
            // Convert both IDs to strings for comparison
            const therapist = therapists.find(t => String(t.therapist_id) === String(id));
            
            if (!therapist) {
                console.error('Available IDs:', therapists.map(t => t.therapist_id));
                throw new Error(`Therapist not found with ID: ${id}`);
            }

            console.log('Found therapist:', therapist); // Debug log

            // Populate edit form fields
            document.getElementById('editTherapistId').value = therapist.therapist_id;
            document.getElementById('editTherapistFirstName').value = therapist.firstName;
            document.getElementById('editTherapistLastName').value = therapist.lastName;
            document.getElementById('editTherapistUsername').value = therapist.username;
            document.getElementById('editTherapistEmail').value = therapist.email;
            document.getElementById('editTherapistPhone').value = therapist.phone;
            document.getElementById('editTherapistSpecialization').value = therapist.specialization;
            document.getElementById('editTherapistExperience').value = therapist.experience;
            document.getElementById('editTherapistBio').value = therapist.bio || '';
            document.getElementById('editTherapistStatus').value = therapist.status;

            // Update availability checkboxes
            const dayCheckboxes = document.querySelectorAll('#editTherapistForm input[name="availableDays"]');
            dayCheckboxes.forEach(checkbox => {
                checkbox.checked = therapist.availability.days.includes(checkbox.value);
            });

            // Update time inputs
            if (therapist.availability.hours) {
                const form = document.getElementById('editTherapistForm');
                form.querySelector('input[name="startTime"]').value = therapist.availability.hours.start || '';
                form.querySelector('input[name="endTime"]').value = therapist.availability.hours.end || '';
                form.querySelector('input[name="breakStart"]').value = therapist.availability.hours.break.start || '';
                form.querySelector('input[name="breakEnd"]').value = therapist.availability.hours.break.end || '';
            }

            toggleEditModal();
        } catch (error) {
            console.error('Error loading therapist:', error);
            alert('Failed to load therapist data: ' + error.message);
        }
    };

    // Delete therapist
    window.deleteTherapist = async function(id) {
        if (!confirm('Are you sure you want to delete this therapist?')) return;

        try {
            const response = await fetch('../php/CRUDTherapist/delete_therapist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Use therapist_id for filtering
                therapists = therapists.filter(t => t.therapist_id !== id);
                filteredTherapists = filteredTherapists.filter(t => t.therapist_id !== id);
                renderTherapists();
                alert('Therapist deleted successfully');
            } else {
                throw new Error(data.error || 'Failed to delete therapist');
            }
        } catch (error) {
            console.error('Error deleting therapist:', error);
            alert('Failed to delete therapist: ' + error.message);
        }
    };

    // Add event listener for edit modal cancel button
    document.querySelector('.edit-cancel-btn').addEventListener('click', toggleEditModal);

    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterTherapists);
    statusFilter.addEventListener('change', filterTherapists);

    // Initial fetch when page loads
    fetchTherapists();
    
    // Refresh therapist list periodically (every 30 seconds)
    setInterval(fetchTherapists, 30000);
    
    // Function to populate edit form
    function populateEditForm(therapist) {
        document.getElementById('editTherapistId').value = therapist.therapist_id;
        document.getElementById('editTherapistFirstName').value = therapist.firstName;
        document.getElementById('editTherapistLastName').value = therapist.lastName;
        // ... populate other fields ...

        // Clear previous availability selections
        document.querySelectorAll('#editTherapistForm input[name="availableDays"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Set availability
        if (therapist.availability && therapist.availability.days) {
            therapist.availability.days.forEach(day => {
                const checkbox = document.getElementById('edit' + day.charAt(0).toUpperCase() + day.slice(1));
                if (checkbox) checkbox.checked = true;
            });

            // Set working hours
            if (therapist.availability.hours) {
                document.getElementById('editStartTime').value = therapist.availability.hours.start;
                document.getElementById('editEndTime').value = therapist.availability.hours.end;
                // Set break times if they exist
                if (therapist.availability.hours.break) {
                    document.querySelector('#editTherapistForm input[name="breakStart"]').value = 
                        therapist.availability.hours.break.start;
                    document.querySelector('#editTherapistForm input[name="breakEnd"]').value = 
                        therapist.availability.hours.break.end;
                }
            }
        }
    }

    function renderAppointments(appointments) {
        return appointments.map(appointment => {
            let actions = '';
            
            // Add cancellation request handling for pending cancellations
            if (appointment.status === 'cancellation_pending') {
                actions = `
                    <div class="cancellation-notice">
                        <p><strong>Client Requested Cancellation</strong></p>
                        <p><strong>Reason:</strong> ${appointment.cancellation_reason || 'No reason provided'}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-danger agree-cancel" data-id="${appointment.appointment_id}">
                            <i class="fas fa-check"></i> Approve Cancellation
                        </button>
                        <button class="btn btn-secondary suggest-reschedule" data-id="${appointment.appointment_id}">
                            <i class="fas fa-calendar-alt"></i> Suggest Reschedule
                        </button>
                    </div>`;
            }

            return `
                <div class="appointment-card" data-id="${appointment.appointment_id}">
                    // ...existing card content...
                    ${actions}
                </div>`;
        }).join('');

        // Initialize buttons after rendering
        document.querySelectorAll('.agree-cancel').forEach(btn => 
            btn.addEventListener('click', handleCancellationResponse));
        document.querySelectorAll('.suggest-reschedule').forEach(btn => 
            btn.addEventListener('click', handleReschedule));
    }

    async function handleCancellationResponse(e) {
        const appointmentId = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to approve this cancellation?')) {
            try {
                const response = await fetch('../php/appointments/respond_to_cancellation.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        appointmentId,
                        action: 'approve'
                    })
                });

                const data = await response.json();
                if (data.success) {
                    loadAppointments(); // Refresh the list
                    showSuccess('Cancellation approved');
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                showError('Failed to process cancellation: ' + error.message);
            }
        }
    }
});