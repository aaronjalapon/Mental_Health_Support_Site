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

    // Get therapist ID first
    $stmt = $conn->prepare("SELECT therapist_id FROM therapists WHERE unique_id = ?");
    $stmt->bind_param("s", $_SESSION['unique_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Therapist not found');
    }
    
    $therapist = $result->fetch_assoc();

    // Fetch appointment details with client name
    $stmt = $conn->prepare("
        SELECT 
            a.*,
            CONCAT(c.firstName, ' ', c.lastName) as client_name,
            c.client_id,
            c.email as client_email
        FROM appointments a
        JOIN client c ON a.client_id = c.client_id
        WHERE a.appointment_id = ? 
        AND a.therapist_id = ?
    ");
    
    $stmt->bind_param("ii", $data['appointmentId'], $therapist['therapist_id']);
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
            'client_id' => $appointment['client_id'],
            'date' => $appointment['appointment_date'],
            'time' => $appointment['appointment_time'],
            'type' => $appointment['session_type'],
            'status' => $appointment['status'],
            'notes' => $appointment['notes']
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
