// Login Form Validation
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const loginInput = document.getElementById('login_input').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!loginInput || !password) {
        alert('Please fill in all fields.');
        return;
    }

    const formData = new FormData();
    formData.append('login_input', loginInput);
    formData.append('password', password);

    fetch('../php/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'pending_verification') {
            alert(data.message);
            window.location.href = data.redirect;
        } else if (data.status === 'success') {
            alert(data.message);
            switch(data.role) {
                case 'therapist':
                    window.location.href = '../html/therapist_appointments.php';
                    break;
                case 'admin':
                    window.location.href = '../html/admin_panel.php';
                    break;
                default:
                    window.location.href = '/index.php';
            }
        } else {
            alert(data.message);
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

    const formData = new FormData();
    formData.append('email', resetEmail);

    fetch('../php/send_reset_otp.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            window.location.href = '../html/verify.php';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
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