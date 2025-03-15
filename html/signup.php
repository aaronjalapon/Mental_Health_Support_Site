<?php
session_start();
// Redirect if already logged in
if(isset($_SESSION['unique_id'])) {
    if($_SESSION['role'] === 'admin') {
        header("Location: ../html/admin_panel.php");
    } else {
        header("Location: /index.php");
    }
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Form</title>
    <link rel="stylesheet" href="/css/login.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="icon" href="/images/Logo.svg" type="image/x-icon">
</head>
<body>
    <div class="vector-parent">
        <div class="logo-mindspace-1-1-parent">
            <img class="logo-mindspace-1-1-icon" alt="logo.svg" src="/images/Logo.svg">
            <div class="mindspace">MindSpace</div>
        </div>
        
        <b class="registration-form">Registration Form</b>
        <form id="signupForm" class="signup-form" method="POST" enctype="multipart/form-data">
          
            <div class="form-content">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name:</label>
                        <input type="text" id="firstName" name="firstName" placeholder="John" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name:</label>
                        <input type="text" id="lastName" name="lastName" placeholder="Doe" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group password-field">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" placeholder="password123" required>
                        <i class="toggle-password fa-regular fa-eye" onclick="togglePassword('password')"></i>
                    </div>
                    <div class="form-group password-field">
                        <label for="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" name="cpass" placeholder="password123" required>
                        <i class="toggle-password fa-regular fa-eye" onclick="togglePassword('confirmPassword')"></i>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" placeholder="johndoe@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" placeholder="johndoe123" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="contact">Contact Number:</label>
                        <input type="tel" id="contact" name="contactNumber" placeholder="09123456789" required>
                    </div>
                    <div class="form-group">
                        <label for="pronouns">Pronouns:</label>
                        <select id="pronouns" name="pronouns" required>
                            <option value="">Select pronouns</option>
                            <option value="He/Him/His">He/Him/His</option>
                            <option value="She/Her/Hers">She/Her/Hers</option>
                            <option value="They/Them/Theirs">They/Them/Theirs</option>
                            <option value="I prefer not to say">I prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label for="address">Address:</label>
                    <input type="text" id="address" name="address" placeholder="Matina, Davao City" required>
                </div>
        
                <div class="file-upload">
                    <input type="file" id="fileInput" name="ValidID" accept="image/jpeg,image/png" required>
                    <label for="fileInput" class="file-label">Choose Image</label>
                    <span class="file-name">Upload Valid ID</span>
                </div>

                <div class="terms-checkbox">
                    <input type="checkbox" id="termsCheckbox" required>
                    <label for="termsCheckbox">I agree to the &nbsp; <span class="terms-link">Terms and Conditions</span></label>
                </div>
        
                <input type="submit" value="Register" class="register-btn"></button>
            </div>
        </form>

        <!-- Terms and Conditions Modal -->
        <div id="termsModal" class="modal hidden">
            <div class="modal-content terms-modal-content">
                <span class="close">&times;</span>
                <h2>Terms and Conditions</h2>
                <div class="terms-content">
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using MindSpace, you agree to be bound by these Terms and Conditions.</p>

                    <h3>2. Privacy Policy</h3>
                    <p>Your use of MindSpace is also governed by our Privacy Policy, which covers how we collect and use your information.</p>

                    <h3>3. User Responsibilities</h3>
                    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

                    <h3>4. Prohibited Activities</h3>
                    <p>Users are prohibited from engaging in any unlawful or harmful activities while using MindSpace.</p>

                    <h3>5. Content Guidelines</h3>
                    <p>Users must ensure that all content shared on MindSpace complies with our community guidelines and does not violate any laws.</p>
                </div>
                <button class="accept-terms-btn">Accept Terms</button>
            </div>
        </div>

        <div class="already-have-an-account-parent">
            <span class="already-have-an">Already have an Account?</span>
            <span class="sign-in"><a href="/html/login.php">Sign In</a></span>
        </div>
    </div>
    <script src="../js/signup.js"></script>

    <!-- Loading Modal -->
    <div id="blankModal" class="modal hidden">
        <div class="modal-content-loading">
            <div class="loader"></div> 
        </div>
    </div>
</body>
</html>