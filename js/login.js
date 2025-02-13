// Login Form Validation
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const loginInput = document.getElementById('login_input').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!loginInput || !password) {
        alert('Please fill in all fields.');
        return;
    }

    // Hardcoded admin check
    if (loginInput === 'admin' && password === 'password123') {
        alert('Admin login successful!');
        window.location.href = '../html/admin_panel.html';
        return;
    }

    // For regular users, send to PHP backend
    const formData = new FormData();
    formData.append('login_input', loginInput);
    formData.append('password', password);

    fetch('../php/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        switch(data) {
            case 'user':
                alert('Login successful!');
                window.location.href = '../html/index.html';
                break;
            case 'admin':
                window.location.href = '../html/admin_panel.html';
                break;
            default:
                alert(data); // Show error message from PHP
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again.');
    });
});




// ...rest of your existing code...
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling;
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Forgot Password Modal Functionality
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.getElementById('closeModal');
const resetPasswordForm = document.getElementById('resetPasswordForm');

// Open Modal
forgotPasswordLink.addEventListener('click', function (e) {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
});

// Close Modal
closeModal.addEventListener('click', function () {
    forgotPasswordModal.classList.add('hidden');
});

// Handle Reset Password Form Submission
resetPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const resetEmail = document.getElementById('resetEmail').value.trim();

    if (!resetEmail) {
        alert('Please enter your email.');
        return;
    }

    // Simulate sending reset email
    alert(`A reset link has been sent to ${resetEmail}.`);
    forgotPasswordModal.classList.add('hidden');
});

// File Input Handling
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameSpan = document.querySelector('.file-name');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name); // Debug log
            fileNameSpan.textContent = file.name;
            fileNameSpan.style.color = '#000';
        } else {
            fileNameSpan.textContent = 'No file chosen';
            fileNameSpan.style.color = '#b7b7b7';
        }
    });
});