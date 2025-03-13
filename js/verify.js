const otp_fields = document.querySelectorAll('.otp_field');

// Focus first input on load
otp_fields[0].focus();

// Handle OTP input fields
otp_fields.forEach((field, index) => {
    field.addEventListener('keydown', (e) => {
        // Only allow numbers
        if (e.key >= 0 && e.key <= 9) {
            otp_fields[index].value = ""; // Clear field
            setTimeout(() => {
                // Move to next field if available
                if (index < otp_fields.length - 1) {
                    otp_fields[index + 1].focus();
                }
            }, 4);
        } 
        // Handle backspace
        else if (e.key === 'Backspace') {
            setTimeout(() => {
                // Move to previous field if available
                if (index > 0) {
                    otp_fields[index - 1].focus();
                }
            }, 4);
        }
    });
});

const form = document.querySelector('.form form');
const submitBtn = form.querySelector('.submit .button');

// Form submission
form.onsubmit = (e) => {
    e.preventDefault();

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../php/otp.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.response);
                    if (response.status === 'success') {
                        if (response.type === 'reset_password') {
                            window.location.href = '../html/reset_password.php';
                        } else if (response.type === 'registration') {
                            if (response.accountStatus === 'Pending') {
                                alert("Email verification successful!\nYour account is pending admin approval.\nYou will be able to login once approved.");
                            } else {
                                alert("Email verification successful!\nYou can now login to your account.");
                            }
                            window.location.href = "../html/login.php";
                        }
                    } else {
                        alert(response.message);
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                    alert('An error occurred. Please try again.');
                }
            }
        }
    }

    xhr.onerror = () => {
        alert("Error occurred while verifying OTP!");
    };

    let formData = new FormData(form);
    xhr.send(formData);
}

// Resend OTP functionality
const resendLink = document.getElementById('resendCode');
const resendTimer = document.getElementById('resendTimer');
let timeLeft = 0;

function startResendTimer() {
    resendLink.style.display = 'none';
    resendTimer.style.display = 'block';
    timeLeft = 30;
    
    const timer = setInterval(() => {
        resendTimer.textContent = `Resend in ${timeLeft}s`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            resendLink.style.display = 'block';
            resendTimer.style.display = 'none';
        }
    }, 1000);
}

// Start timer on page load
startResendTimer();

resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    
    resendLink.textContent = 'Sending...';
    
    fetch('../php/resend_otp.php', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data);
        
        if (data.status === 'success') {
            alert('OTP has been sent to your email');
            startResendTimer();
        } else {
            throw new Error(data.message || 'Failed to send OTP');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send OTP. Please try again.');
    })
    .finally(() => {
        resendLink.textContent = 'Resend verification code';
    });
});