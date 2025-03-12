<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

if (!isset($_SESSION['unique_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    $appointmentId = intval($data['appointmentId']);
    $reason = isset($data['reason']) ? $data['reason'] : '';
    $role = $_SESSION['role']; // Get role from session
    
    // Explicitly verify role matches
    if ($role !== 'therapist' && $role !== 'client') {
        throw new Exception('Invalid user role');
    }
    
    // Set status based on who initiates
    $newStatus = $role === 'therapist' ? 'cancellation_requested' : 'cancellation_pending';

    // Debug logs
    error_log("Raw appointmentId from request: " . $data['appointmentId']);
    error_log("Attempting to cancel - Appointment ID: $appointmentId");
    error_log("Session role: $role");
    error_log("Cancel appointment request - Role: $role, Status: $newStatus");

    // First, get the client_id for this appointment
    $verify = $conn->prepare("
        SELECT client_id 
        FROM appointments 
        WHERE appointment_id = ?
    ");
    
    $verify->bind_param("i", $appointmentId);
    $verify->execute();
    $result = $verify->get_result();

    if ($result->num_rows === 0) {
        error_log("No appointment found with ID: $appointmentId");
        throw new Exception('Appointment not found');
    }

    $appointment = $result->fetch_assoc();
    error_log("Appointment found with client_id: " . $appointment['client_id']);

    // Update appointment
    $stmt = $conn->prepare("
        UPDATE appointments 
        SET status = ?,
            cancellation_reason = ?,
            cancellation_by = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE appointment_id = ?
    ");
    
    $stmt->bind_param("sssi", $newStatus, $reason, $role, $appointmentId);
    
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        error_log("Successfully cancelled appointment $appointmentId");
        echo json_encode([
            'success' => true,
            'message' => 'Cancellation request submitted successfully'
        ]);
    } else {
        error_log("Failed to cancel appointment - No rows affected");
        throw new Exception('Failed to submit cancellation request');
    }

} catch (Exception $e) {
    error_log("Error in cancel_appointment.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
