<?php
session_start();
include_once "db.php";

header('Content-Type: application/json');

if (!isset($_SESSION['reset_email']) || !isset($_SESSION['reset_verified'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid session']);
    exit();
}

$email = $_SESSION['reset_email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

try {
    // Get user status first
    $stmt = $conn->prepare("SELECT Status FROM client WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // Update password
    $stmt = $conn->prepare("UPDATE client SET password = ? WHERE email = ?");
    $stmt->bind_param("ss", $password, $email);
    
    if ($stmt->execute()) {
        // Clear reset session variables
        unset($_SESSION['reset_email']);
        unset($_SESSION['reset_verified']);
        
        if ($user['Status'] === 'Pending') {
            echo json_encode([
                'status' => 'pending',
                'message' => 'Password updated successfully! However, your account is still pending admin approval.'
            ]);
        } else {
            echo json_encode([
                'status' => 'success',
                'message' => 'Password updated successfully! You can now login with your new password.'
            ]);
        }
    } else {
        throw new Exception("Failed to update password");
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update password. Please try again.'
    ]);
}

$conn->close();
?>
