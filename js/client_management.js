// Make these functions and variables globally accessible
let clients = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        contact: '123-456-7890',
        pronouns: 'he/him',
        address: '123 Main St',
        status: 'Active'
    }
];

let filteredClients = [...clients];

// Make toggleEditModal globally accessible
window.toggleEditModal = function() {
    document.getElementById('editClientModal').classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', function() {
    const clientForm = document.getElementById('clientForm');
    const addClientBtn = document.getElementById('addClientBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addClientForm = document.getElementById('addClientForm');
    const clientTableBody = document.getElementById('clientTableBody');
    const searchInput = document.getElementById('clientSearch');
    const statusFilter = document.getElementById('statusFilter');
    const clientFormModal = document.getElementById('clientFormModal');
    const editClientModal = document.getElementById('editClientModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const editClientForm = document.getElementById('editClientForm');

    function toggleModal() {
        clientFormModal.classList.toggle('active');
    }

    function filterClients() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        filteredClients = clients.filter(client => {
            const matchesSearch = client.firstName.toLowerCase().includes(searchTerm) ||
                                client.lastName.toLowerCase().includes(searchTerm) ||
                                client.username.toLowerCase().includes(searchTerm) ||
                                client.email.toLowerCase().includes(searchTerm) ||
                                client.contact.includes(searchTerm) ||
                                client.pronouns.toLowerCase().includes(searchTerm) ||
                                client.address.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusValue === 'all' || 
                                client.status.toLowerCase() === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderClients();
    }

    function renderClients() {
        clientTableBody.innerHTML = filteredClients.map(client => `
            <tr>
                <td>${client.firstName} ${client.lastName}</td>
                <td>${client.email}</td>
                <td>${client.contact}</td>
                <td><span class="client-status status-${client.status.toLowerCase()}">${client.status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="window.editClient(${client.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="window.deleteClient(${client.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    addClientBtn.addEventListener('click', toggleModal);
    cancelBtn.addEventListener('click', toggleModal);

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.closest('.modal-overlay').id === 'editClientModal') {
                toggleEditModal();
            } else {
                toggleModal();
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === editClientModal) {
            toggleEditModal();
        } else if (e.target === clientFormModal) {
            toggleModal();
        }
    });

    addClientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newClient = {
            id: clients.length + 1,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            contact: document.getElementById('contact').value,
            pronouns: document.getElementById('pronouns').value,
            address: document.getElementById('address').value,
            status: 'Active'
        };
        
        clients.push(newClient);
        filterClients();
        addClientForm.reset();
        toggleModal();
    });

    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterClients);
    statusFilter.addEventListener('change', filterClients);

    // Add event listener for edit form submission
    editClientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('editClientId').value);
        const clientIndex = clients.findIndex(c => c.id === id);

        if (clientIndex !== -1) {
            clients[clientIndex] = {
                id: id,
                firstName: document.getElementById('editFirstName').value,
                lastName: document.getElementById('editLastName').value,
                username: document.getElementById('editUsername').value,
                email: document.getElementById('editEmail').value,
                contact: document.getElementById('editContact').value,
                pronouns: document.getElementById('editPronouns').value,
                address: document.getElementById('editAddress').value,
                status: document.getElementById('editStatus').value
            };

            filterClients();
            toggleEditModal();
        }
    });

    // Add event listeners for edit modal close buttons
    document.querySelector('.edit-cancel-btn').addEventListener('click', toggleEditModal);

    // Initial render
    filterClients();
});

// Make editClient globally accessible
window.editClient = function(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    // Populate the edit form
    document.getElementById('editClientId').value = client.id;
    document.getElementById('editFirstName').value = client.firstName;
    document.getElementById('editLastName').value = client.lastName;
    document.getElementById('editUsername').value = client.username;
    document.getElementById('editEmail').value = client.email;
    document.getElementById('editContact').value = client.contact;
    document.getElementById('editPronouns').value = client.pronouns;
    document.getElementById('editAddress').value = client.address;
    document.getElementById('editStatus').value = client.status;

    toggleEditModal();
};

// Make deleteClient globally accessible
window.deleteClient = function(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        clients = clients.filter(client => client.id !== id);
        filterClients();
    }
};
