<?php


if(!isset($_SESSION['reset_email']) || !isset($_SESSION['reset_verified'])) {
    header("Location: login.php");
    exit();

}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <link rel="stylesheet" href="/css/login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>
<body>
    <div class="rectangle-parent">
        <h2>Reset Your Password</h2>
        <form id="newPasswordForm">
            <div class="form-group password-field">
                <input type="password" id="newPassword" name="newPassword" 
                    placeholder="New Password" required>
                <i class="toggle-password fa-regular fa-eye" onclick="togglePassword('newPassword')"></i>
            </div>
            <div class="form-group password-field">
                <input type="password" id="confirmPassword" name="confirmPassword" 
                    placeholder="Confirm Password" required>
                <i class="toggle-password fa-regular fa-eye" onclick="togglePassword('confirmPassword')"></i>
            </div>
            <button type="submit" class="reset-btn">Update Password</button>
        </form>
    </div>
    <script src="../js/reset_password.js"></script>
</body>
</html>
