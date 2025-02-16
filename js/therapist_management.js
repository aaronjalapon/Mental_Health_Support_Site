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

    // Sample initial therapist data
    let therapists = [
        {
            id: 1,
            name: 'Dr. Jane Smith',
            specialization: 'Clinical Psychology',
            experience: 8,
            email: 'jane.smith@mindspace.com',
            phone: '123-456-7890',
            status: 'Active'
        }
    ];

    let filteredTherapists = [...therapists];

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
            const matchesSearch = therapist.name.toLowerCase().includes(searchTerm) ||
                                therapist.specialization.toLowerCase().includes(searchTerm) ||
                                therapist.email.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusValue === 'all' || 
                                therapist.status.toLowerCase() === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderTherapists();
    }

    function renderTherapists() {
        therapistTableBody.innerHTML = filteredTherapists.map(therapist => `
            <tr>
                <td>${therapist.name}</td>
                <td>${therapist.specialization}</td>
                <td>${therapist.experience} years</td>
                <td><span class="therapist-status status-${therapist.status.toLowerCase()}">${therapist.status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editTherapist(${therapist.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteTherapist(${therapist.id})">
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

    addTherapistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newTherapist = {
            id: therapists.length + 1,
            name: document.getElementById('therapistName').value,
            specialization: document.getElementById('therapistSpecialization').value,
            experience: document.getElementById('therapistExperience').value,
            email: document.getElementById('therapistEmail').value,
            phone: document.getElementById('therapistPhone').value,
            bio: document.getElementById('therapistBio').value,
            status: 'Active'
        };
        
        therapists.push(newTherapist);
        filterTherapists();
        addTherapistForm.reset();
        toggleAddModal();
    });

    // Add edit form submission handler
    editTherapistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('editTherapistId').value);
        const therapistIndex = therapists.findIndex(t => t.id === id);

        if (therapistIndex !== -1) {
            therapists[therapistIndex] = {
                id: id,
                name: document.getElementById('editTherapistName').value,
                specialization: document.getElementById('editTherapistSpecialization').value,
                experience: document.getElementById('editTherapistExperience').value,
                email: document.getElementById('editTherapistEmail').value,
                phone: document.getElementById('editTherapistPhone').value,
                bio: document.getElementById('editTherapistBio').value,
                status: document.getElementById('editTherapistStatus').value
            };

            filterTherapists();
            toggleEditModal();
        }
    });

    // Update edit function
    window.editTherapist = function(id) {
        const therapist = therapists.find(t => t.id === id);
        if (!therapist) return;

        document.getElementById('editTherapistId').value = therapist.id;
        document.getElementById('editTherapistName').value = therapist.name;
        document.getElementById('editTherapistEmail').value = therapist.email;
        document.getElementById('editTherapistPhone').value = therapist.phone;
        document.getElementById('editTherapistSpecialization').value = therapist.specialization;
        document.getElementById('editTherapistExperience').value = therapist.experience;
        document.getElementById('editTherapistBio').value = therapist.bio || '';
        document.getElementById('editTherapistStatus').value = therapist.status;

        toggleEditModal();
    };

    // Add event listener for edit modal cancel button
    document.querySelector('.edit-cancel-btn').addEventListener('click', toggleEditModal);

    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterTherapists);
    statusFilter.addEventListener('change', filterTherapists);

    // Initial render
    renderTherapists();
});

function deleteTherapist(id) {
    if (confirm('Are you sure you want to delete this therapist?')) {
        therapists = therapists.filter(therapist => therapist.id !== id);
        filterTherapists();
    }
}
