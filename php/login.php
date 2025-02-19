<?php
session_start();
include_once "db.php";

// Sanitize inputs
$login_input = mysqli_real_escape_string($conn, trim($_POST['login_input'])); // Can be email or username
$password = $_POST['password'];

// Validate required fields
if (empty($login_input) || empty($password)) {
    echo "All input fields are required!";
    exit();
}

try {
    // Prepare statement to check user credentials (both email and username)
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->bind_param("ss", $login_input, $login_input);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($password, $row['password'])) {
            // Check if email is verified
            if ($row['verification_status'] == '1') {
                // Set session variables
                $_SESSION['unique_id'] = $row['unique_id'];
                $_SESSION['email'] = $row['email'];
                $_SESSION['firstName'] = $row['firstName'];
                $_SESSION['lastName'] = $row['lastName'];
                $_SESSION['username'] = $row['username'];
                $_SESSION['role'] = $row['Role'];
                
                // Check role and redirect accordingly
                if ($_SESSION['role'] === 'admin') {
                    echo "admin"; // Frontend will redirect to admin_panel.html
                } else {
                    echo "user"; // Frontend will redirect to index.html
                }
            } else {
                // Email not verified
                $_SESSION['email'] = $row['email'];
                $_SESSION['otp'] = $row['otp'];
                echo "Please verify your email first!";
            }
        } else {
            echo "Invalid credentials!";
        }
    } else {
        echo "Invalid credentials!";
    }

} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage());
    echo "Login failed. Please try again later.";
}

$conn->close();
?>