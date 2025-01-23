// Login Form Validation
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    // Example login validation
    if (email === 'test@carrental.com' && password === 'password123') {
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password. Please try again.');
    }
});

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