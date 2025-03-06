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
            $_SESSION['username'] = 'admin';
            $_SESSION['role'] = 'admin';
            echo json_encode(['status' => 'success', 'role' => 'admin', 'message' => 'Admin Login Successful!']);
            exit();
        }
    }

    // Check client table first
    $stmt = $conn->prepare("SELECT * FROM client WHERE email = ? OR username = ?");
    $stmt->bind_param("ss", $login_input, $login_input);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        if (password_verify($password, $row['password'])) {
            // Check verification status first
            if ($row['verification_status'] != '1') {
                // User account is not verified yet
                
                // Check if there's a valid OTP for verification
                if ($row['otp'] !== NULL && $row['otp'] !== '0') {
                    // User has a pending OTP verification
                    $_SESSION['unique_id'] = $row['unique_id'];
                    $_SESSION['email'] = $row['email'];
                    $_SESSION['otp'] = $row['otp'];
                    echo json_encode([
                        'status' => 'pending_verification',
                        'message' => 'Please complete your email verification first.',
                        'redirect' => '../html/verify.php'
                    ]);
                } else {
                    // No OTP exists but verification status is still 0
                    // Generate a new OTP and redirect to verification
                    $otp = mt_rand(111111, 999999);
                    
                    // Update the OTP in the database
                    $update_stmt = $conn->prepare("UPDATE client SET otp = ? WHERE unique_id = ?");
                    $update_stmt->bind_param("si", $otp, $row['unique_id']);
                    $update_stmt->execute();
                    $update_stmt->close();
                    
                    // Set session variables for verification
                    $_SESSION['unique_id'] = $row['unique_id'];
                    $_SESSION['email'] = $row['email'];
                    $_SESSION['otp'] = $otp;
                    
                    // You should also send the OTP via email here
                    // sendOTPEmail($row['email'], $otp);
                    
                    echo json_encode([
                        'status' => 'pending_verification',
                        'message' => 'Please verify your email. A new OTP has been sent.',
                        'redirect' => '../html/verify.php'
                    ]);
                }
                exit();
            }
            
            // Account is verified, proceed with login
            $_SESSION['unique_id'] = $row['unique_id'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['firstName'] = $row['firstName'];
            $_SESSION['lastName'] = $row['lastName'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['role'] = $row['Role'];
            
            echo json_encode(['status' => 'success', 'role' => 'user', 'message' => 'Login Successful!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials!']);
        }
    } else {
        // If not found in client table, check therapist table
        $stmt = $conn->prepare("SELECT * FROM therapists WHERE email = ? OR username = ?");
        $stmt->bind_param("ss", $login_input, $login_input);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            
            if (password_verify($password, $row['password'])) {
                if ($row['status'] == 'Active') { // Check status instead of verification
                    $_SESSION['unique_id'] = $row['unique_id'];
                    $_SESSION['email'] = $row['email'];
                    $_SESSION['firstName'] = $row['first_name'];
                    $_SESSION['lastName'] = $row['last_name'];
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['role'] = 'therapist';
                    $_SESSION['therapist_id'] = $row['therapist_id'];
                    
                    echo json_encode([
                        'status' => 'success', 
                        'role' => 'therapist', 
                        'message' => 'Login Successful!',
                        'redirect' => '../html/therapist_appointments.php'
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Your account is currently ' . strtolower($row['status']) . '. Please contact admin.'
                    ]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid credentials!']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials!']);
        }
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