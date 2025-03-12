<?php
session_start();
include_once '../db.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['appointmentId'])) {
        throw new Exception('Appointment ID is required');
    }

    $appointmentId = intval($data['appointmentId']);
    
    $sql = "SELECT 
        a.*,
        CONCAT(c.firstName, ' ', c.lastName) as client_name,
        CONCAT(t.first_name, ' ', t.last_name) as therapist_name
    FROM appointments a
    JOIN client c ON a.client_id = c.client_id
    JOIN therapists t ON a.therapist_id = t.therapist_id
    WHERE a.appointment_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $appointmentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Appointment not found');
    }
    
    $appointment = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'appointment' => [
            'id' => $appointment['appointment_id'],
            'client_name' => $appointment['client_name'],
            'therapist_name' => $appointment['therapist_name'],
            'date' => $appointment['appointment_date'],
            'time' => $appointment['appointment_time'],
            'session_type' => $appointment['session_type'],
            'status' => $appointment['status'],
            'notes' => $appointment['notes'],
            'cancellation_reason' => $appointment['cancellation_reason'],
            'cancellation_by' => $appointment['cancellation_by'],
            'reschedule_notes' => $appointment['reschedule_notes'],
            'reschedule_by' => $appointment['reschedule_by'],
            'proposed_date' => $appointment['proposed_date'],
            'proposed_time' => $appointment['proposed_time'],
            'proposed_session_type' => $appointment['session_type'] // Default to current session type
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
