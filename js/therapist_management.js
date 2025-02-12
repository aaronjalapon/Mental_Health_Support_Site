document.addEventListener('DOMContentLoaded', function() {
    const therapistForm = document.getElementById('therapistForm');
    const addTherapistBtn = document.getElementById('addTherapistBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addTherapistForm = document.getElementById('addTherapistForm');
    const therapistTableBody = document.getElementById('therapistTableBody');
    const searchInput = document.getElementById('therapistSearch');
    const statusFilter = document.getElementById('statusFilter');

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

    function toggleForm() {
        therapistForm.style.display = therapistForm.style.display === 'none' ? 'block' : 'none';
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

    addTherapistBtn.addEventListener('click', toggleForm);
    cancelBtn.addEventListener('click', toggleForm);

    addTherapistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newTherapist = {
            id: therapists.length + 1,
            name: document.getElementById('therapistName').value,
            specialization: document.getElementById('therapistSpecialization').value,
            experience: document.getElementById('therapistExperience').value,
            email: document.getElementById('therapistEmail').value,
            phone: document.getElementById('therapistPhone').value,
            status: 'Active'
        };
        
        therapists.push(newTherapist);
        filterTherapists();
        addTherapistForm.reset();
        toggleForm();
    });

    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterTherapists);
    statusFilter.addEventListener('change', filterTherapists);

    // Initial render
    renderTherapists();
});

function editTherapist(id) {
    // Implement edit functionality
    console.log('Edit therapist:', id);
}

function deleteTherapist(id) {
    if (confirm('Are you sure you want to delete this therapist?')) {
        therapists = therapists.filter(therapist => therapist.id !== id);
        filterTherapists();
    }
}
