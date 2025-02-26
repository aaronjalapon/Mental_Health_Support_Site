<?php
session_start();
include_once "db.php";
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Set JSON header
header('Content-Type: application/json');

// Add better error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log initial data
error_log("Resend OTP initiated. Session data: " . json_encode($_SESSION));

// Check if the required session variables exist
if(!isset($_SESSION['email']) || !isset($_SESSION['unique_id'])) {
    error_log("Session check failed: missing email or unique_id");
    echo json_encode(['status' => 'error', 'message' => 'Session expired. Please log in again.']);
    exit();
}

$email = $_SESSION['email'];
$unique_id = $_SESSION['unique_id'];

// Generate a new OTP
$otp = mt_rand(111111, 999999);
error_log("Generated new OTP for user $unique_id: $otp");

try {
    // Update OTP in database first
    $stmt = $conn->prepare("UPDATE client SET otp = ? WHERE unique_id = ?");
    $stmt->bind_param("si", $otp, $unique_id);
    $execute_result = $stmt->execute();
    
    if (!$execute_result) {
        error_log("Database update failed: " . $stmt->error);
        echo json_encode(['status' => 'error', 'message' => 'Database update failed']);
        exit();
    }
    
    error_log("Database updated successfully for user $unique_id");
    
    // Configure and send email
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'nonamemister28@gmail.com'; // Replace with your actual email
    $mail->Password = 'limm dgni spms buqq'; // Replace with your actual password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('nonamemister28@gmail.com', 'MindSpace');
    $mail->addAddress($email);
    $mail->Subject = "Resend Your Verification OTP";
    $mail->Body = "NOTE: NEVER SHARE your ONE-TIME PIN(OTP).\n\n"
                  . "Your verification OTP is: $otp";
    
    $mail->send();
    error_log("Email sent successfully to $email");

    // Update session OTP
    $_SESSION['otp'] = $otp;

    // Return success response with HTTP 200
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'OTP sent to your email.']);
} catch (Exception $e) {
    $error_msg = "Email Error: " . $e->getMessage();
    error_log($error_msg);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $error_msg]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>