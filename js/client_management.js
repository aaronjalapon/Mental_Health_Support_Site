// Keep existing modal variables and functions
let clients = [];
let filteredClients = [];

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

    async function fetchClients() {
        try {
            const response = await fetch('../php/CRUDClient/fetch_clients.php');
            console.log('Response status:', response.status); // Debug line
            
            const data = await response.json();
            console.log('Fetched data:', data); // Debug line
            
            if (data.error) {
                console.error('Error fetching clients:', data.error);
                return;
            }
            
            clients = data;
            filteredClients = [...clients];
            renderClients();
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    }

    function filterClients() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value.toLowerCase();

        filteredClients = clients.filter(client => {
            const matchesSearch = 
                client.firstName.toLowerCase().includes(searchTerm) ||
                client.lastName.toLowerCase().includes(searchTerm) ||
                client.username.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm) ||
                client.contact.includes(searchTerm);
            
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
                    <button class="btn btn-primary" onclick="window.editClient('${client.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="window.deleteClient('${client.id}')">
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

    addClientForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('firstName', document.getElementById('firstName').value);
        formData.append('lastName', document.getElementById('lastName').value);
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);
        formData.append('contact', document.getElementById('contact').value);
        formData.append('pronouns', document.getElementById('pronouns').value);
        formData.append('address', document.getElementById('address').value);
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            formData.append('ValidID', fileInput.files[0]);
        }

        try {
            const response = await fetch('../php/CRUDClient/add_client.php', {
                method: 'POST',
                body: formData // FormData automatically sets the correct Content-Type
            });

            const data = await response.json();
            if (data.success) {
                await fetchClients(); // Refresh the client list
                addClientForm.reset();
                toggleModal();
                alert('Client added successfully');
            } else {
                alert('Failed to add client: ' + data.error);
            }
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client');
        }
    });

    // Add this to show selected filename
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || 'Upload Valid ID';
        document.querySelector('.file-name').textContent = fileName;
    });

    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterClients);
    statusFilter.addEventListener('change', filterClients);

    // Add event listener for edit form submission
    editClientForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = {
            id: document.getElementById('editClientId').value,
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            username: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            contact: document.getElementById('editContact').value,
            pronouns: document.getElementById('editPronouns').value,
            address: document.getElementById('editAddress').value,
            status: document.getElementById('editStatus').value
        };

        try {
            const response = await fetch('../php/CRUDClient/update_client.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                await fetchClients(); // Refresh the client list
                toggleEditModal();
            } else {
                alert('Failed to update client: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Failed to update client');
        }
    });

    // Fetch clients immediately when page loads
    fetchClients();

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
window.deleteClient = async function(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        try {
            const response = await fetch('../php/CRUDClient/delete_client.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();
            if (data.success) {
                await fetchClients(); // Refresh the client list
            } else {
                alert('Failed to delete client: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client');
        }
    }
};
