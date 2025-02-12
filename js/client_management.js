document.addEventListener('DOMContentLoaded', function() {
    const clientForm = document.getElementById('clientForm');
    const addClientBtn = document.getElementById('addClientBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addClientForm = document.getElementById('addClientForm');
    const clientTableBody = document.getElementById('clientTableBody');
    const searchInput = document.getElementById('clientSearch');
    const statusFilter = document.getElementById('statusFilter');

    // Sample initial client data
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

    function toggleForm() {
        clientForm.style.display = clientForm.style.display === 'none' ? 'block' : 'none';
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
                    <button class="btn btn-primary" onclick="editClient(${client.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    addClientBtn.addEventListener('click', toggleForm);
    cancelBtn.addEventListener('click', toggleForm);

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
        toggleForm();
    });

    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterClients);
    statusFilter.addEventListener('change', filterClients);

    // Initial render
    filterClients();
});

function editClient(id) {
    // Implement edit functionality
    console.log('Edit client:', id);
}

function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        clients = clients.filter(client => client.id !== id);
        filterClients();
    }
}
