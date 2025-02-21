document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const fileInput = document.getElementById('fileInput');
    const fileLabel = document.querySelector('.file-name');
    const registerBtn = document.querySelector('.register-btn');

    // File upload handler
    fileInput.addEventListener('change', function() {
        fileLabel.textContent = this.files[0] ? this.files[0].name : 'Upload Valid ID';
    });

    // Password toggle functionality
    window.togglePassword = function(inputId) {
        const passwordInput = document.getElementById(inputId);
        const icon = passwordInput.nextElementSibling;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            let formData = new FormData(form);
            
            // Debug: Log form data
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            let xhr = new XMLHttpRequest();
            xhr.open("POST", "../php/signup.php", true);
            
            xhr.onload = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        let data = xhr.response;
                        console.log('Server response:', data);
                        
                        if (data.trim() === "Success") {
                            window.location.href = '../html/verify.php';
                            
                        } else {
                            console.log('Error:', data);
                            alert(data);
                        }
                    }
                }
            }

            xhr.onerror = () => {
                console.error('Request failed');
                alert('Error submitting form. Please try again.');
            }

            xhr.send(formData);
        });
    }

    // Prevent double submission
    form.addEventListener('submit', function() {
        registerBtn.disabled = true;
        setTimeout(function() {
            registerBtn.disabled = false;
        }, 2000);
    });
});