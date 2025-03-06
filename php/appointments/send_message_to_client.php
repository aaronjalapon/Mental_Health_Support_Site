<?php
session_start();
include_once '../db.php';

require '../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'therapist') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId']) || !isset($data['message'])) {
        throw new Exception('Missing required parameters');
    }

    // Get therapist details
    $stmt = $conn->prepare("
        SELECT t.first_name, t.last_name, t.email 
        FROM therapists t 
        WHERE t.unique_id = ?
    ");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $therapist = $stmt->get_result()->fetch_assoc();

    // Get client details and appointment info
    $stmt = $conn->prepare("
        SELECT c.firstName, c.lastName, c.email, a.appointment_date, a.appointment_time 
        FROM appointments a
        JOIN client c ON a.client_id = c.client_id
        WHERE a.appointment_id = ?
    ");
    $stmt->bind_param("i", $data['appointmentId']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Appointment not found');
    }
    
    $client = $result->fetch_assoc();

    // Configure PHPMailer
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'nonamemister28@gmail.com';
    $mail->Password = 'limm dgni spms buqq';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('nonamemister28@gmail.com', 'MindSpace Therapist');
    $mail->addAddress($client['email']);
    $mail->Subject = "Message from your Therapist - MindSpace";

    // Format appointment date and time
    $appointmentDate = date('F j, Y', strtotime($client['appointment_date']));
    $appointmentTime = date('g:i A', strtotime($client['appointment_time']));

    // Compose email body 
    $message = htmlspecialchars($data['message']); // Sanitize the message
    
    $mail->isHTML(true); // Enable HTML format
    $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #1e9160;'>Message from your Therapist</h2>
            
            <p>Dear {$client['firstName']} {$client['lastName']},</p>
            
            <p>Your therapist, {$therapist['first_name']} {$therapist['last_name']}, 
            has sent you a message regarding your appointment on 
            <strong>$appointmentDate at $appointmentTime</strong>:</p>
            
            <div style='
                background-color: #f5f5f5;
                border-left: 4px solid #1e9160;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            '>
                " . nl2br($message) . "
            </div>
            
            <p>Best regards,<br>
            MindSpace Team</p>
        </div>";

    // Add plain text alternative
    $mail->AltBody = "Dear {$client['firstName']} {$client['lastName']},\n\n"
                   . "Your therapist, {$therapist['first_name']} {$therapist['last_name']}, "
                   . "has sent you a message regarding your appointment on "
                   . "$appointmentDate at $appointmentTime:\n\n"
                   . $message . "\n\n"
                   . "Best regards,\n"
                   . "MindSpace Team";

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send message: ' . $e->getMessage()
    ]);
}

$conn->close();
