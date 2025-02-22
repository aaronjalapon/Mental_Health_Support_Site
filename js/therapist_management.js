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

    // Update fetchTherapists to use retry logic
    async function fetchTherapists() {
        try {
            const data = await fetchWithRetry('../php/CRUDTherapist/fetch_therapist.php', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (data.error) {
                console.error('Server error:', data.error);
                return;
            }
            
            therapists = Array.isArray(data) ? data : [];
            filteredTherapists = [...therapists];
            renderTherapists();
            
            console.log('Fetched therapists:', therapists);
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

    // Add new therapist
    addTherapistForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('therapistFirstName').value.trim(),
            lastName: document.getElementById('therapistLastName').value.trim(),
            specialization: document.getElementById('therapistSpecialization').value.trim(),
            experience: parseInt(document.getElementById('therapistExperience').value),
            email: document.getElementById('therapistEmail').value.trim(),
            phone: document.getElementById('therapistPhone').value.trim(),
            bio: document.getElementById('therapistBio').value.trim(),
            status: 'Active',
            availability: getAvailabilityFromForm(this)
        };

        // Validate availability
        if (formData.availability.days.length === 0) {
            alert('Please select at least one working day');
            return;
        }

        try {
            const response = await fetch('../php/CRUDTherapist/add_therapist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
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

    // Add edit form submission handler
    editTherapistForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('editTherapistId').value,
            firstName: document.getElementById('editTherapistFirstName').value,
            lastName: document.getElementById('editTherapistLastName').value,
            specialization: document.getElementById('editTherapistSpecialization').value,
            experience: parseInt(document.getElementById('editTherapistExperience').value),
            email: document.getElementById('editTherapistEmail').value,
            phone: document.getElementById('editTherapistPhone').value,
            bio: document.getElementById('editTherapistBio').value,
            status: document.getElementById('editTherapistStatus').value,
            availability: getAvailabilityFromForm(this)
        };

        try {
            const response = await fetch('../php/CRUDTherapist/update_therapist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                await fetchTherapists();
                toggleEditModal();
                alert('Therapist updated successfully');
            } else {
                alert(data.error || 'Failed to update therapist');
            }
        } catch (error) {
            console.error('Error updating therapist:', error);
            alert('Failed to update therapist');
        }
    });

    // Fix the editTherapist function
    window.editTherapist = async function(id) {
        try {
            const therapist = therapists.find(t => String(t.therapist_id) === String(id));
            
            if (!therapist) {
                console.error('No therapist found with ID:', id);
                console.error('Available therapist IDs:', therapists.map(t => t.therapist_id));
                throw new Error('Therapist not found');
            }

            console.log('Found therapist:', therapist);

            // Populate form fields
            document.getElementById('editTherapistId').value = therapist.therapist_id;
            document.getElementById('editTherapistFirstName').value = therapist.firstName;
            document.getElementById('editTherapistLastName').value = therapist.lastName;
            document.getElementById('editTherapistEmail').value = therapist.email;
            document.getElementById('editTherapistPhone').value = therapist.phone;
            document.getElementById('editTherapistSpecialization').value = therapist.specialization;
            document.getElementById('editTherapistExperience').value = therapist.experience;
            document.getElementById('editTherapistBio').value = therapist.bio || '';
            document.getElementById('editTherapistStatus').value = therapist.status;

            // Update availability checkboxes
            if (Array.isArray(therapist.availability.days)) {
                document.querySelectorAll('#editTherapistForm input[name="availableDays"]').forEach(checkbox => {
                    checkbox.checked = therapist.availability.days.includes(checkbox.value);
                });
            }

            // Update time inputs
            const form = document.getElementById('editTherapistForm');
            if (therapist.availability.hours) {
                form.querySelector('input[name="startTime"]').value = therapist.availability.hours.start || '';
                form.querySelector('input[name="endTime"]').value = therapist.availability.hours.end || '';
                form.querySelector('input[name="breakStart"]').value = therapist.availability.hours.break?.start || '';
                form.querySelector('input[name="breakEnd"]').value = therapist.availability.hours.break?.end || '';
            }

            toggleEditModal();
        } catch (error) {
            console.error('Error in editTherapist:', error);
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
});