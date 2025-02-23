document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle functionality
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.querySelector('.mobile-toggle');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
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
    }

    // Close sidebar when window is resized above mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
        }
    });

    // Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${tabName}Content`).classList.add('active');
        });
    });

    // Testimonials Management
    const testimonialForm = document.getElementById('testimonialForm');
    const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    const closeTestimonialBtn = document.getElementById('closeTestimonialBtn');
    const cancelTestimonialBtn = document.getElementById('cancelTestimonialBtn');
    const addTestimonialForm = document.getElementById('addTestimonialForm');
    const formTitle = document.getElementById('formTitle');
    let editingId = null;

    // Show form when clicking Add New Testimonial
    addTestimonialBtn.addEventListener('click', () => {
        formTitle.textContent = 'Add New Testimonial';
        editingId = null;
        addTestimonialForm.reset();
        testimonialForm.style.display = 'flex';
    });

    // Close form handlers
    [closeTestimonialBtn, cancelTestimonialBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            testimonialForm.style.display = 'none';
            addTestimonialForm.reset();
            editingId = null;
        });
    });

    // Form submission handler
    addTestimonialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('username', document.getElementById('clientName').value);
        formData.append('content', document.getElementById('testimonialContent').value);
        formData.append('rating', document.getElementById('rating').value);
        formData.append('action', editingId ? 'update' : 'create');
        if (editingId) formData.append('id', editingId);

        try {
            const response = await fetch('../php/CRUDSettings/testimonial_functions.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                testimonialForm.style.display = 'none';
                addTestimonialForm.reset();
                editingId = null;
                loadTestimonials();
                alert(data.message);
            } else {
                alert(data.message || 'Failed to save testimonial');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save testimonial');
        }
    });

    // Edit testimonial function
    window.editTestimonial = function(id) {
        fetch(`../php/CRUDSettings/testimonial_functions.php?id=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    formTitle.textContent = 'Edit Testimonial';
                    // Populate the form with existing data
                    document.getElementById('clientName').value = data.data.username;
                    document.getElementById('testimonialContent').value = data.data.content;
                    document.getElementById('rating').value = data.data.rating;
                    editingId = id;
                    testimonialForm.style.display = 'flex';
                } else {
                    throw new Error(data.message || 'Failed to load testimonial');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to load testimonial: ' + error.message);
            });
    };

    // Delete testimonial function
    window.deleteTestimonial = function(id) {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);

        fetch('../php/CRUDSettings/testimonial_functions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                loadTestimonials();
                alert('Testimonial deleted successfully!');
            } else {
                alert(data.message || 'Failed to delete testimonial');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete testimonial');
        });
    };

    // Function to load and display testimonials
    function loadTestimonials() {
        fetch('../php/CRUDSettings/testimonial_functions.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const tbody = document.getElementById('testimonialsTableBody');
                    tbody.innerHTML = '';
                    
                    data.data.forEach(item => {
                        tbody.innerHTML += `
                            <tr>
                                <td>${item.username || 'Anonymous'}</td>
                                <td>${item.content}</td>
                                <td>${"★".repeat(item.rating)}</td>
                                <td>
                                    <button onclick="editTestimonial(${item.testimonial_id})" class="btn btn-primary btn-sm">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteTestimonial(${item.testimonial_id})" class="btn btn-secondary btn-sm">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Load testimonials when page loads
    loadTestimonials();

    // Word of the Day Management
    const wordForm = document.getElementById('wordForm');
    const addWordBtn = document.getElementById('addWordBtn');
    const cancelWordBtn = document.getElementById('cancelWordBtn');
    const closeWordBtn = document.getElementById('closeWordBtn');
    const addWordForm = document.getElementById('addWordForm');

    // Sample words data
    let words = [
        {
            id: 1,
            word: "Mindfulness",
            definition: "The practice of maintaining a nonjudgmental state of heightened awareness.",
            category: "mental-health",
            displayDate: "2024-01-20"
        }
    ];

    // Toggle word form
    addWordBtn.addEventListener('click', () => {
        wordForm.style.display = 'flex';
    });

    [cancelWordBtn, closeWordBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                wordForm.style.display = 'none';
                addWordForm.reset();
            });
        }
    });

    // Handle word form submission
    addWordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newWord = {
            id: Date.now(),
            word: document.getElementById('word').value,
            definition: document.getElementById('definition').value,
            category: document.getElementById('category').value,
            displayDate: document.getElementById('displayDate').value
        };

        words.push(newWord);
        updateWordsTable();
        wordForm.style.display = 'none';
        addWordForm.reset();
    });

    // Update words table
    function updateWordsTable() {
        const tbody = document.getElementById('wordTableBody');
        tbody.innerHTML = '';

        words.forEach(word => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${word.word}</td>
                <td>${word.definition}</td>
                <td>${word.category}</td>
                <td>${word.displayDate}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editWord(${word.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteWord(${word.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Close modals when clicking outside
    [testimonialForm, wordForm].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                const form = modal.querySelector('form');
                if (form) form.reset();
            }
        });
    });

    // Initialize tables
    updateWordsTable();

    // Make functions globally available
    window.editWord = (id) => {
        const word = words.find(w => w.id === id);
        if (word) {
            document.getElementById('word').value = word.word;
            document.getElementById('definition').value = word.definition;
            document.getElementById('category').value = word.category;
            document.getElementById('displayDate').value = word.displayDate;
            wordForm.style.display = 'flex';
            word._editing = true;
        }
    };

    window.deleteWord = (id) => {
        if (confirm('Are you sure you want to delete this word?')) {
            words = words.filter(w => w.id !== id);
            updateWordsTable();
        }
    };
});