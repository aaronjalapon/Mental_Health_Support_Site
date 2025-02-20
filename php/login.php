<?php
session_start();
include_once "db.php";

// Define admin credentials in a separate config file
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$10$8WRnqofHP6geI.22MQjvoedWoZJhkENE4oHZ0rOcHDkON4EH0rdH6');

// Sanitize inputs
$login_input = mysqli_real_escape_string($conn, trim($_POST['login_input']));
$password = $_POST['password'];

// Validate required fields
if (empty($login_input) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'All input fields are required!']);
    exit();
}

try {
    // First check if it's an admin login
    if ($login_input === ADMIN_USERNAME) {
        if (password_verify($password, ADMIN_PASSWORD_HASH)) {
            $_SESSION['unique_id'] = 'admin';
            $_SESSION['email'] = ADMIN_USERNAME;
            $_SESSION['username'] = 'Administrator';
            $_SESSION['role'] = 'admin';
            echo json_encode(['status' => 'success', 'role' => 'admin', 'message' => 'Admin Login Successful!']);
            exit();
        }
    }

    // Rest of your existing authentication code...
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->bind_param("ss", $login_input, $login_input);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        if (password_verify($password, $row['password'])) {
            if ($row['verification_status'] == '1') {
                $_SESSION['unique_id'] = $row['unique_id'];
                $_SESSION['email'] = $row['email'];
                $_SESSION['firstName'] = $row['firstName'];
                $_SESSION['lastName'] = $row['lastName'];
                $_SESSION['username'] = $row['username'];
                $_SESSION['role'] = $row['Role'];
                
                echo json_encode(['status' => 'success', 'role' => 'user', 'message' => 'Login Successful!']);
            } else {
                $_SESSION['email'] = $row['email'];
                $_SESSION['otp'] = $row['otp'];
                echo json_encode(['status' => 'error', 'message' => 'Please verify your email first!']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials!']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials!']);
    }

} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Login failed. Please try again later.']);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>