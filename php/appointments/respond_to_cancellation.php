<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'therapist') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId']) || !isset($data['action'])) {
        throw new Exception('Missing required parameters');
    }

    $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $therapist = $stmt->get_result()->fetch_assoc();

    if (!$therapist) {
        throw new Exception('Therapist not found');
    }

    // Update appointment status based on therapist's response
    $sql = "UPDATE appointments 
            SET status = ?, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE appointment_id = ? 
            AND therapist_id = ? 
            AND status = 'cancellation_pending'";

    $newStatus = $data['action'] === 'approve' ? 'cancelled' : 'upcoming';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $newStatus, $data['appointmentId'], $therapist['therapist_id']);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => $data['action'] === 'approve' ? 
                'Appointment cancelled successfully' : 
                'Cancellation rejected'
        ]);
    } else {
        throw new Exception('Failed to update appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
