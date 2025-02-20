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

    // Create XMLHttpRequest
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "../php/otp.php", true);
    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let data = xhr.response;
                if (data === "Success") {
                    // Redirect after successful verification
                    setTimeout(() => {
                        alert("You are now Successfully Register\nPlease login your account.");
                        window.location.href = "/index.html";
                    }, 1500);
                } else {
                    // Show error in alert instead of error text
                    alert(data);
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

