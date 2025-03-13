document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const addClientBtn = document.getElementById('addClientBtn');
    const clientTableBody = document.getElementById('clientTableBody');
    const searchInput = document.getElementById('clientSearch');
    const statusFilter = document.getElementById('statusFilter');
    const clientFormModal = document.getElementById('clientFormModal');
    const editClientModal = document.getElementById('editClientModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const addClientForm = document.getElementById('addClientForm');
    const editClientForm = document.getElementById('editClientForm');

    let clients = [];
    let filteredClients = [];

    // Fetch clients from server with error handling
    async function fetchClients() {
        try {
            const response = await fetch('../php/CRUDClient/fetch_clients.php', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                console.error('Server error:', data.error);
                return;
            }
            
            // Update clients array and render
            clients = Array.isArray(data) ? data : [];
            filteredClients = [...clients];
            renderClients();
            
            console.log('Fetched clients:', clients); // Debug log
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    }

    function filterClients() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value.toLowerCase();

        filteredClients = clients.filter(client => {
            const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm) ||
                                client.email.toLowerCase().includes(searchTerm) ||
                                client.contact.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusValue === 'all' || 
                                client.status.toLowerCase() === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderClients();
    }

    function renderClients() {
        if (!Array.isArray(filteredClients)) {
            console.error('filteredClients is not an array:', filteredClients);
            return;
        }

        const tableContent = filteredClients.map(client => `
            <tr>
                <td>${client.firstName} ${client.lastName}</td>
                <td>${client.email}</td>
                <td>${client.contact}</td>
                <td><span class="client-status status-${client.status.toLowerCase()}">${client.status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="editClient('${client.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteClient('${client.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        clientTableBody.innerHTML = tableContent || '<tr><td colspan="5">No clients found</td></tr>';
    }

    // Modal functions
    function toggleModal(modal) {
        modal.classList.toggle('active');
        if (modal === clientFormModal && !modal.classList.contains('active')) {
            addClientForm.reset();
        }
    }

    // Event Listeners
    addClientBtn.addEventListener('click', () => toggleModal(clientFormModal));
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            toggleModal(modal);
        });
    });

    // Add cancel button event listener for edit modal
    document.querySelector('.edit-cancel-btn').addEventListener('click', function() {
        toggleModal(editClientModal);
    });

    searchInput.addEventListener('input', filterClients);
    statusFilter.addEventListener('change', filterClients);

    // Edit client handler
    window.editClient = function(id) {
        const client = clients.find(c => c.id == id); // Change from === to ==
        if (!client) {
            console.error('Client not found:', id);
            return;
        }

        // Debug log to check pronouns value
        console.log('Client pronouns:', client.pronouns);

        // Populate edit form
        document.getElementById('editClientId').value = id;
        document.getElementById('editFirstName').value = client.firstName;
        document.getElementById('editLastName').value = client.lastName;
        document.getElementById('editUsername').value = client.username;
        document.getElementById('editEmail').value = client.email;
        document.getElementById('editContact').value = client.contact;
        document.getElementById('editPronouns').value = client.pronouns || 'I prefer not to say'; // Set pronouns directly
        document.getElementById('editAddress').value = client.address;
        document.getElementById('editStatus').value = client.status.toLowerCase();

        // Set ValidID preview and filename
        const validIdImg = document.getElementById('currentValidId');
        const fileLabel = document.querySelector('#editClientModal .file-name');
        
        validIdImg.src = `../ImagesForValidID/${client.validId}`;
        fileLabel.textContent = client.validId; // Show current filename
        
        validIdImg.onerror = function() {
            this.src = '../images/default-id.png';
            fileLabel.textContent = 'No file chosen';
        };

        toggleModal(editClientModal);
    };

    // Delete client handler
    window.deleteClient = async function(id) {
        if (!confirm('Are you sure you want to delete this client?')) return;

        try {
            const response = await fetch('../php/CRUDClient/delete_client.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: parseInt(id) })
            });

            const data = await response.json();
            
            if (data.success) {
                location.reload(); // Reload the page to refresh the list
                alert('Client deleted successfully');
            } else {
                alert(data.error || 'Failed to delete client');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete client');
        }
    };

    // Form submission handlers
    editClientForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData();
        
        // Add all form fields to FormData with correct names
        formData.append('editClientId', document.getElementById('editClientId').value);
        formData.append('firstName', document.getElementById('editFirstName').value);
        formData.append('lastName', document.getElementById('editLastName').value);
        formData.append('username', document.getElementById('editUsername').value);
        formData.append('email', document.getElementById('editEmail').value);
        formData.append('contact', document.getElementById('editContact').value);
        formData.append('pronouns', document.getElementById('editPronouns').value);
        formData.append('address', document.getElementById('editAddress').value);
        formData.append('status', document.getElementById('editStatus').value);

        // Add ValidID file if selected
        const validIdFile = document.getElementById('editFileInput').files[0];
        if (validIdFile) {
            formData.append('ValidID', validIdFile);
        }
        
        try {
            const response = await fetch('../php/CRUDClient/update_client.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log('Server response:', data); // Debug log
            
            if (data.success) {
                location.reload(); // Force page reload to refresh data
                alert('Client updated successfully');
            } else {
                alert(data.error || 'Failed to update client');
            }
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Failed to update client');
        }
    });

    // Add Client form submission handler
    addClientForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate password match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const formData = new FormData();
        
        // Add form fields to FormData
        formData.append('firstName', document.getElementById('firstName').value);
        formData.append('lastName', document.getElementById('lastName').value);
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('password', password);
        formData.append('contact', document.getElementById('contact').value);
        formData.append('pronouns', document.getElementById('pronouns').value);
        formData.append('address', document.getElementById('address').value);
        
        // Add ValidID file
        const validIdFile = document.getElementById('fileInput').files[0];
        if (validIdFile) {
            formData.append('ValidID', validIdFile);
        }

        try {
            const response = await fetch('../php/CRUDClient/add_client.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchClients(); // Refresh the client list
                toggleModal(clientFormModal);
                addClientForm.reset();
                alert('Client added successfully');
            } else {
                alert(data.error || 'Failed to add client');
            }
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client');
        }
    });

    // Add file upload preview for add form
    document.getElementById('fileInput').addEventListener('change', function(e) {
        previewFile(this, 'addValidIdPreview');
    });

    // Add file upload preview for edit form
    document.getElementById('editFileInput').addEventListener('change', function(e) {
        previewFile(this, 'currentValidId');
    });

    // File preview function
    function previewFile(input, imgId) {
        const file = input.files[0];
        const fileLabel = input.closest('.file-upload');
        const fileName = fileLabel.querySelector('.file-name');
        const preview = document.getElementById(imgId);
        
        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPG or PNG)');
                input.value = '';
                return;
            }

            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);

            fileName.textContent = file.name;
            fileLabel.classList.add('has-file');
        } else {
            fileName.textContent = 'Upload Valid ID';
            fileLabel.classList.remove('has-file');
        }
    }

    // Initial fetch
    fetchClients();
    
    // Refresh client list periodically (every 30 seconds)
    setInterval(fetchClients, 30000);
});