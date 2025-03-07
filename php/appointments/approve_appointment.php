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
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    // Get therapist_id from session
    $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Therapist not found');
    }
    
    $therapist = $result->fetch_assoc();
    $therapist_id = $therapist['therapist_id'];

    // Verify appointment belongs to therapist and is pending
    $stmt = $conn->prepare("
        SELECT status 
        FROM appointments 
        WHERE appointment_id = ? 
        AND therapist_id = ? 
        AND status = 'pending'
    ");
    $stmt->bind_param("ii", $data['appointmentId'], $therapist_id);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows === 0) {
        throw new Exception('Appointment not found or cannot be approved');
    }

    // Update appointment status
    $stmt = $conn->prepare("
        UPDATE appointments 
        SET status = 'upcoming',
            updated_at = CURRENT_TIMESTAMP
        WHERE appointment_id = ? 
        AND therapist_id = ?
    ");
    
    $stmt->bind_param("ii", $data['appointmentId'], $therapist_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment approved successfully'
        ]);
    } else {
        throw new Exception('Failed to approve appointment');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
