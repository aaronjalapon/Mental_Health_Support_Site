document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const driversLicense = document.getElementById('driversLicense').files[0];

    if (!fullName || !email || !contact || !password || !confirmPassword || !driversLicense) {
        alert('Please fill in all fields and upload your Driver’s License.');
        return;
    }

    if (!/^[0-9]{10,15}$/.test(contact)) {
        alert('Contact number must be between 10 and 15 digits.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    // Simulate successful registration
    alert('Registration successful! Welcome to Car Rental Services.');
    // Redirect to login page
    window.location.href = 'index.html';
});