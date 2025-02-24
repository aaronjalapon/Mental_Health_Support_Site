<?php
// Simple check if user is already logged in
if(isset($_COOKIE['user_logged'])) {
    header("Location: /index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mental Health Support Login</title>
    <link rel="stylesheet" href="/css/login.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>     
<body>
    <div class="rectangle-parent">
        <div class="logo-mindspace-1-1-parent">
            <img class="logo-mindspace-1-1-icon" alt="" src="/images/Logo.svg">
            <div class="mindspace">MindSpace</div>
        </div>
        
        <h2 class="login-into-account">Login into account</h2>
        
        <form id="loginForm" action="/php/login.php" method="POST" autocomplete="off">
            <div class="input-fields">
                
                <div class="form-group">
                    <input type="text" id="login_input" name="login_input" placeholder="Email or Username" required>
                </div>
                <br>
                <div class="form-group password-field">
                    <input type="password" id="password" name="password" placeholder="Password" required>
                    <i class="toggle-password fa-regular fa-eye" onclick="togglePassword('password')"></i>
                </div>
                <b class="forgot-password"><a href="verify.php" id="forgotPassworLink">Forgot password?</a></b>
            </div>
            <button type="submit" class="login-btn">Login</button>
        </form>
        
        <div class="dont-have-an-account-parent">
            <b class="dont-have-an">Don't have an account?</b>
            <b class="register-here"><a href="/html/signup.php">Register Here</a></b>
        </div>
    </div>

    <div id="forgotPasswordModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" id="closeModal">&times;</span>
            <h2>Reset Your Password</h2>
            <form id="resetPasswordForm">
                <div class="form-group">
                    <label for="resetEmail">Enter your email:</label>
                    <input type="email" id="resetEmail" name="resetEmail" placeholder="example@email.com" required>
                </div>
                <button type="submit" class="reset-btn">Send Reset Link</button>
            </form>
        </div>
    </div>
    <script src="/js/login.js"></script>
</body>
</html>