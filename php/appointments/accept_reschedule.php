<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    $sql = "UPDATE appointments 
            SET status = 'upcoming',
                appointment_date = proposed_date,
                appointment_time = proposed_time,
                proposed_date = NULL,
                proposed_time = NULL,
                reschedule_by = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['appointmentId']);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Reschedule request accepted'
        ]);
    } else {
        throw new Exception('Failed to accept reschedule request');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
