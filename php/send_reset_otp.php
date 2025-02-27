<?php
session_start();
include_once "db.php";
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Sanitize email input
$email = mysqli_real_escape_string($conn, trim($_POST['email']));

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format.']);
    exit();
}

// Check if email exists
$stmt = $conn->prepare("SELECT * FROM client WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $unique_id = $row['unique_id'];
    $otp = mt_rand(111111, 999999);

    try {
        // Configure and send email
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'nonamemister28@gmail.com'; // Consider moving to config file
        $mail->Password = 'limm dgni spms buqq'; // Consider moving to config file
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        
        $mail->setFrom('nonamemister28@gmail.com', 'MindSpace');
        $mail->addAddress($email);
        $mail->Subject = "Password Reset OTP";
        $mail->Body = "NOTE: NEVER SHARE your ONE-TIME PIN(OTP).\n\n"
                    . "Your OTP for password reset is: $otp";
        
        $mail->send();

        // Update OTP in database
        $stmt = $conn->prepare("UPDATE client SET otp = ? WHERE unique_id = ?");
        $stmt->bind_param("si", $otp, $unique_id);
        $stmt->execute();

        $_SESSION['unique_id'] = $unique_id;
        $_SESSION['email'] = $email;
        $_SESSION['otp'] = $otp;

        echo json_encode(['status' => 'success', 'message' => 'OTP sent to your email.']);
    } catch (Exception $e) {
        error_log("Email Error: " . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Failed to send OTP. Please try again later.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Email not found.']);
}

$conn->close();
?>
